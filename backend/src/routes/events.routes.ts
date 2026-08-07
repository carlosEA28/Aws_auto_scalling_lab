import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { EventsController } from '../controllers/events.controller.js';
import { EventsRepository } from '../repositories/events.repository.js';
import {
  eventParamsSchema,
  eventResponseSchema,
  listEventsResponseSchema,
} from '../schemas/events.schema.js';
import { EventsService } from '../services/events.service.js';

export async function eventsRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = new EventsController(
    new EventsService(new EventsRepository(fastify.prisma)),
  );

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/events',
    schema: {
      response: {
        200: listEventsResponseSchema,
      },
    },
    handler: controller.list,
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/events/:id',
    schema: {
      params: eventParamsSchema,
      response: {
        200: eventResponseSchema,
      },
    },
    handler: controller.listById,
  });
}