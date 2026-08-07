import type { FastifyInstance } from 'fastify';

/**
 * Middleware (implementado como Fastify hooks) de observabilidade:
 * adiciona headers de correlação e tempo de resposta a cada requisição.
 * O log estruturado de cada requisição já é feito pelo logger do Fastify (Pino).
 */
export function registerRequestLogger(fastify: FastifyInstance): void {
  fastify.addHook('onRequest', async (request, reply) => {
    reply.header('X-Request-Id', request.id);
  });

  fastify.addHook('onResponse', async (_request, reply) => {
    const responseTimeMs = reply.elapsedTime;
    reply.header('X-Response-Time', responseTimeMs.toFixed(2));
  });
}