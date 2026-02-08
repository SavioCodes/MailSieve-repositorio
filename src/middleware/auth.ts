import type { NextFunction, Request, Response } from 'express';
import { sendError } from '../utils/http';

interface AuthService {
  validateKey: (
    key: string | undefined
  ) =>
    | { valid: true; record: { id: string } }
    | { valid: false; reason: 'missing' | 'invalid' };
}

export function createAuthMiddleware(authService: AuthService) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validation = authService.validateKey(req.header('x-api-key') ?? undefined);

    if (!validation.valid && validation.reason === 'missing') {
      sendError(res, req, 401, 'auth_missing', 'Header x-api-key é obrigatório.', [
        { field: 'x-api-key', reason: 'ausente' }
      ]);
      return;
    }

    if (!validation.valid) {
      sendError(res, req, 401, 'auth_invalid', 'Chave de API inválida ou revogada.', [
        { field: 'x-api-key', reason: 'inválida ou revogada' }
      ]);
      return;
    }

    req.apiKeyId = validation.record.id;
    next();
  };
}
