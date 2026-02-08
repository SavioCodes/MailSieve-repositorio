import type { NextFunction, Request, Response } from 'express';

interface UsageMetricsService {
  record: (apiKeyId: string | undefined, statusCode: number, latencyMs: number) => void;
}

export function createUsageMetricsMiddleware(metricsService: UsageMetricsService) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const started = process.hrtime.bigint();

    res.on('finish', () => {
      const elapsedNs = process.hrtime.bigint() - started;
      const latencyMs = Number(elapsedNs / BigInt(1e6));
      metricsService.record(req.apiKeyId, res.statusCode, latencyMs);
    });

    next();
  };
}
