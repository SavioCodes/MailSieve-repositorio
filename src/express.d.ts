import 'express';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      apiKeyId?: string;
      startTimeNs?: bigint;
    }
  }
}

export {};
