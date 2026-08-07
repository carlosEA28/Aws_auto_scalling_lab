export interface ErrorDetails {
  [key: string]: unknown;
}

export interface AppErrorOptions {
  statusCode?: number;
  code?: string;
  details?: ErrorDetails;
}

/**
 * Erro de aplicação com código e status padronizados,
 * consumido pelo error handler global.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ErrorDetails;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = options.statusCode ?? 500;
    this.code = options.code ?? 'INTERNAL_ERROR';
    this.details = options.details;
  }
}

export function badRequest(code: string, message: string, details?: ErrorDetails): AppError {
  return new AppError(message, { statusCode: 400, code, details });
}

export function notFound(code: string, message: string): AppError {
  return new AppError(message, { statusCode: 404, code });
}

export function conflict(code: string, message: string): AppError {
  return new AppError(message, { statusCode: 409, code });
}

export function internalError(code: string, message: string): AppError {
  return new AppError(message, { statusCode: 500, code });
}