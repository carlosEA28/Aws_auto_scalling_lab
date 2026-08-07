import type { FastifyInstance } from 'fastify';
import { eventsRoutes } from './events.routes.js';
import { healthRoutes } from './health.routes.js';
import { simulateRoutes } from './simulate.routes.js';
import { ticketsRoutes } from './tickets.routes.js';

const API_PREFIX = '/api/v1';

export async function apiRoutes(fastify: FastifyInstance): Promise<void> {
  await fastify.register(healthRoutes);
  await fastify.register(eventsRoutes, { prefix: API_PREFIX });
  await fastify.register(ticketsRoutes, { prefix: API_PREFIX });
  await fastify.register(simulateRoutes);
}