import type pino from 'pino';
import { env } from './env.js';

/**
 * Gera as opções do logger (Pino) do Fastify.
 * Em desenvolvimento usamos pino-pretty para leitura humana;
 * em produção, logs em JSON puro (consumidos pelo CloudWatch).
 */
export function buildLoggerOptions(): pino.LoggerOptions {
  return {
    level: env.LOG_LEVEL,
    base: { service: 'ticket-api', env: env.NODE_ENV },
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie'],
      censor: '[REDACTED]',
    },
    transport: env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  };
}