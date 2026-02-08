import type { NextFunction, Request, Response } from 'express';
import { sendError } from '../utils/http';

interface RateLimiter {
  check: (apiKeyId: string, now?: number) => {
    allowed: boolean;
    retryAfterMs?: number;
    limit: number;
    burst: number;
    windowMs: number;
    remaining?: number;
  };
}

export function createRateLimitMiddleware(rateLimiter: RateLimiter) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.apiKeyId) {
      sendError(res, req, 401, 'auth_invalid', 'Chave de API inválida ou revogada.');
      return;
    }

    const result = rateLimiter.check(req.apiKeyId);

    if (result.allowed) {
      res.setHeader('x-rate-limit-limit', String(result.limit + result.burst));
      res.setHeader('x-rate-limit-remaining', String(result.remaining ?? 0));
      res.setHeader('x-rate-limit-window-ms', String(result.windowMs));
      next();
      return;
    }

    const retryAfterMs = result.retryAfterMs ?? result.windowMs;
    const retryAfterSec = Math.max(1, Math.ceil(retryAfterMs / 1000));
    res.setHeader('retry-after', String(retryAfterSec));

    sendError(res, req, 429, 'rate_limited', 'Limite de requisições excedido para a chave.', [
      {
        field: 'x-api-key',
        reason: `cooldown ativo por ${retryAfterMs}ms`
      }
    ]);
  };
}
