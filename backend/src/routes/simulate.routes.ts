import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';
import { SimulateController } from '../controllers/simulate.controller.js';
import { SimulateService } from '../services/simulate.service.js';

/**
 * Rota exclusiva para testes de infraestrutura (k6 / Auto Scaling na AWS).
 * Só é registrada quando SIMULATE_ENABLED=true.
 */
export async function simulateRoutes(fastify: FastifyInstance): Promise<void> {
  if (!env.SIMULATE_ENABLED) {
    fastify.log.warn('/simulate-purchase desabilitado (SIMULATE_ENABLED=false).');
    return;
  }

  const controller = new SimulateController(new SimulateService(fastify.prisma));

  fastify.get('/simulate-purchase', controller.run);
}