import type { FastifyInstance } from 'fastify';
import { HealthController } from '../controllers/health.controller.js';
import { HealthService } from '../services/health.service.js';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = new HealthController(new HealthService(fastify.prisma));

  fastify.get('/', async () => ({
    name: 'ticket-api',
    status: 'ok',
    version: '1.0.0',
  }));

  fastify.get('/health', controller.health);
  fastify.get('/live', controller.live);
  fastify.get('/ready', controller.ready);
}