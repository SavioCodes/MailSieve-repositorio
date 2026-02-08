import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.header('x-request-id') ?? randomUUID();

  req.requestId = requestId;
  req.startTimeNs = process.hrtime.bigint();
  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const started = req.startTimeNs ?? process.hrtime.bigint();
    const elapsedNs = process.hrtime.bigint() - started;
    const latencyMs = Number(elapsedNs / BigInt(1e6));

    logger.info({
      req_id: requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      latency_ms: latencyMs
    });
  });

  next();
}
