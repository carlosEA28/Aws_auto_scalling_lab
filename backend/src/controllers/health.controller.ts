import type { FastifyReply, FastifyRequest } from 'fastify';
import { HealthService } from '../services/health.service.js';

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  health = async (_request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> => {
    return reply.send({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  };

  live = async (_request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> => {
    return reply.send({ status: 'ok' });
  };

  ready = async (request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> => {
    const dbOk = await this.healthService.checkDatabase();
    if (!dbOk) {
      request.log.error('Falha no health check de prontidão (banco de dados).');
      return reply.status(503).send({ status: 'unavailable', db: 'error' });
    }
    return reply.send({ status: 'ok', db: 'connected' });
  };
}