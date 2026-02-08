import type { Response, Request } from 'express';
import type { ErrorCode, ErrorDetail, ErrorResponse } from '../types';

export function buildErrorPayload(params: {
  code: ErrorCode;
  message: string;
  requestId: string | null;
  details?: ErrorDetail[];
}): ErrorResponse {
  return {
    error: {
      code: params.code,
      message: params.message,
      request_id: params.requestId,
      details: params.details ?? []
    }
  };
}

export function sendError(
  res: Response,
  req: Request,
  statusCode: number,
  code: ErrorCode,
  message: string,
  details?: ErrorDetail[]
): void {
  res.status(statusCode).json(
    buildErrorPayload({
      code,
      message,
      requestId: req.requestId ?? null,
      details
    })
  );
}