import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import type { AppConfig } from './config/env';
import { createApiKeyService } from './services/auth/apiKeyService';
import { createRateLimiter } from './services/rateLimit/rateLimitService';
import { createUsageMetricsService } from './services/usage/usageMetricsService';
import { createDisposableListService } from './services/mailsieve/disposableListService';
import { createMailSieveService } from './services/mailsieve/mailsieveService';
import { requestContextMiddleware } from './middleware/requestContext';
import { createAuthMiddleware } from './middleware/auth';
import { createRateLimitMiddleware } from './middleware/rateLimit';
import { createUsageMetricsMiddleware } from './middleware/usage';
import { batchRequestSchema, generateRequestSchema } from './routes/schemas';
import { sendError } from './utils/http';
import { asyncPool } from './utils/asyncPool';
import { logger } from './utils/logger';

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('request_timeout')), timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export function createApp(config: AppConfig) {
  const app = express();
  const startedAtMs = Date.now();

  const apiKeyService = createApiKeyService(config.files.apiKeysFile);
  const rateLimiter = createRateLimiter(config.rateLimit);
  const usageMetricsService = createUsageMetricsService(config.usage);
  const disposableListService = createDisposableListService(
    config.files.disposableListFile,
    config.files.disposableListVersionFile
  );

  const mailSieveService = createMailSieveService({
    roleBasedLocalsFile: config.files.roleBasedLocalsFile,
    typoSuspectsFile: config.files.typoSuspectsFile,
    enableMxCheck: config.mx.enabled,
    mxCacheTtlMs: config.mx.cacheTtlMs,
    domainCacheTtlMs: config.domainCacheTtlMs,
    disposableListService,
    provider: config.provider,
    logWarn: (payload) => {
      logger.warn(payload);
    }
  });

  app.disable('x-powered-by');
  app.use(requestContextMiddleware);
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin }));
  app.use(express.json({ limit: config.bodySizeLimit }));

  const protectedRouter = express.Router();
  protectedRouter.use(createAuthMiddleware(apiKeyService));
  protectedRouter.use(createUsageMetricsMiddleware(usageMetricsService));
  protectedRouter.use(createRateLimitMiddleware(rateLimiter));

  protectedRouter.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      name: config.serviceName,
      version: config.serviceVersion,
      uptime_s: Math.floor((Date.now() - startedAtMs) / 1000)
    });
  });

  protectedRouter.post('/generate', async (req: Request, res: Response) => {
    const parsed = generateRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(
        res,
        req,
        400,
        'invalid_request',
        'Payload inválido.',
        parsed.error.issues.map((issue) => ({
          field: issue.path.join('.') || 'body',
          reason: issue.message
        }))
      );
      return;
    }

    try {
      const result = await withTimeout(
        mailSieveService.analyzeEmail(parsed.data.email, req.requestId),
        config.requestTimeoutMs
      );
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'invalid_email_format') {
        sendError(res, req, 400, 'invalid_request', 'Campo email inválido.', [
          { field: 'email', reason: 'formato inválido' }
        ]);
        return;
      }

      if (error instanceof Error && error.message === 'provider_unavailable') {
        sendError(res, req, 500, 'provider_unavailable', 'Provedor externo indisponível.');
        return;
      }

      if (error instanceof Error && error.message === 'request_timeout') {
        sendError(res, req, 500, 'internal_error', 'Tempo de processamento excedido.');
        return;
      }

      sendError(res, req, 500, 'internal_error', 'Erro interno do servidor.');
    }
  });

  protectedRouter.post('/batch', async (req: Request, res: Response) => {
    const parsed = batchRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(
        res,
        req,
        400,
        'invalid_request',
        'Payload inválido.',
        parsed.error.issues.map((issue) => ({
          field: issue.path.join('.') || 'body',
          reason: issue.message
        }))
      );
      return;
    }

    if (parsed.data.emails.length > config.batchMaxItems) {
      sendError(res, req, 400, 'invalid_request', 'Quantidade de e-mails excede o limite.', [
        { field: 'emails', reason: `máximo permitido: ${config.batchMaxItems}` }
      ]);
      return;
    }

    const requestedConcurrency = parsed.data.concurrency ?? config.batchMaxConcurrency;
    const concurrency = Math.max(1, Math.min(requestedConcurrency, config.batchMaxConcurrency));

    try {
      const results = await withTimeout(
        asyncPool(parsed.data.emails, concurrency, async (email) => mailSieveService.analyzeEmail(email, req.requestId)),
        config.requestTimeoutMs
      );

      res.status(200).json({ results });
    } catch (error) {
      if (error instanceof Error && error.message === 'request_timeout') {
        sendError(res, req, 500, 'internal_error', 'Tempo de processamento excedido.');
        return;
      }

      if (error instanceof Error && error.message === 'provider_unavailable') {
        sendError(res, req, 500, 'provider_unavailable', 'Provedor externo indisponível.');
        return;
      }

      if (error instanceof Error && error.message === 'invalid_email_format') {
        sendError(res, req, 400, 'invalid_request', 'Um ou mais e-mails estão inválidos.', [
          { field: 'emails', reason: 'contém item em formato inválido' }
        ]);
        return;
      }

      sendError(res, req, 500, 'internal_error', 'Erro interno do servidor.');
    }
  });

  app.use('/v1', protectedRouter);

  app.use((req: Request, res: Response) => {
    sendError(res, req, 404, 'not_found', 'Rota não encontrada.');
  });

  app.use((err: unknown, req: Request, res: Response, _next: express.NextFunction) => {
    const parseError =
      typeof err === 'object' &&
      err !== null &&
      'type' in err &&
      (err as { type?: string }).type === 'entity.parse.failed';

    if (parseError) {
      sendError(res, req, 400, 'invalid_json', 'JSON malformado.');
      return;
    }

    sendError(res, req, 500, 'internal_error', 'Erro interno do servidor.');
  });

  return {
    app,
    usageMetricsService
  };
}
