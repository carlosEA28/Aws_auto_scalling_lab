import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { TicketsController } from '../controllers/tickets.controller.js';
import { EventsRepository } from '../repositories/events.repository.js';
import { PurchasesRepository } from '../repositories/purchases.repository.js';
import {
  createPurchaseSchema,
  listPurchasesResponseSchema,
  purchaseResponseSchema,
} from '../schemas/tickets.schema.js';
import { TicketsService } from '../services/tickets.service.js';

export async function ticketsRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = new TicketsController(
    new TicketsService(
      new PurchasesRepository(fastify.prisma),
      new EventsRepository(fastify.prisma),
    ),
  );

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/purchases',
    schema: {
      body: createPurchaseSchema,
      response: {
        201: purchaseResponseSchema,
      },
    },
    handler: controller.create,
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/purchases',
    schema: {
      response: {
        200: listPurchasesResponseSchema,
      },
    },
    handler: controller.list,
  });
}