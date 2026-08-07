import type { FastifyReply, FastifyRequest } from 'fastify';
import type { z } from 'zod';
import type { createPurchaseSchema } from '../schemas/tickets.schema.js';
import { TicketsService } from '../services/tickets.service.js';

type CreatePurchaseBody = z.infer<typeof createPurchaseSchema>;

export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  create = async (
    request: FastifyRequest<{ Body: CreatePurchaseBody }>,
    reply: FastifyReply,
  ) => {
    const purchase = await this.ticketsService.purchase(request.body);
    reply.code(201);
    return purchase;
  };

  list = async () => {
    return this.ticketsService.list();
  };
}