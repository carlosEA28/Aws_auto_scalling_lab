import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { env } from '../config/env.js';
import { SimulateService } from '../services/simulate.service.js';

const simulateQuerySchema = z.object({
  cpuMs: z.coerce.number().int().min(0).max(5000).optional(),
  queries: z.coerce.number().int().min(0).max(20).optional(),
});

export class SimulateController {
  constructor(private readonly simulateService: SimulateService) {}

  run = async (request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> => {
    const query = simulateQuerySchema.parse(request.query);
    const result = await this.simulateService.run({
      cpuMs: query.cpuMs ?? env.SIMULATE_CPU_MS,
      dbQueries: query.queries ?? 3,
    });
    return reply.send(result);
  };
}