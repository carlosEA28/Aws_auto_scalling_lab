import type { FastifyRequest } from 'fastify';
import type { z } from 'zod';
import type { eventParamsSchema } from '../schemas/events.schema.js';
import { EventsService } from '../services/events.service.js';

type EventParams = z.infer<typeof eventParamsSchema>;

export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  list = async () => {
    return this.eventsService.list();
  };

  listById = async (request: FastifyRequest<{ Params: EventParams }>) => {
    return this.eventsService.getById(request.params.id);
  };
}