import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';

interface ErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export interface ErrorResponse {
  error: ErrorBody;
}

/**
 * Error handler global do Fastify.
 * Padroniza todas as respostas de erro em: { error: { code, message, details? } }.
 */
export function buildErrorHandler() {
  return async function errorHandler(
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send(buildResponse(error));
    }

    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos fornecidos.',
          details: error.flatten(),
        },
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return reply.status(404).send({
          error: { code: 'NOT_FOUND', message: 'Recurso não encontrado.' },
        });
      }
      if (error.code === 'P2002') {
        return reply.status(409).send({
          error: { code: 'CONFLICT', message: 'Recurso já existe.' },
        });
      }
    }

    // Erros do próprio Fastify (ex.: falha de validação com schema)
    if (error.statusCode && error.statusCode < 500) {
      return reply.status(error.statusCode).send({
        error: {
          code: error.code ?? 'REQUEST_ERROR',
          message: error.message,
        },
      });
    }

    request.log.error({ err: error }, 'erro não tratado');
    return reply.status(500).send({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro interno do servidor.',
      },
    });
  };
}

function buildResponse(error: AppError): ErrorResponse {
  const body: ErrorBody = {
    code: error.code,
    message: error.message,
  };
  if (error.details) {
    body.details = error.details;
  }
  return { error: body };
}