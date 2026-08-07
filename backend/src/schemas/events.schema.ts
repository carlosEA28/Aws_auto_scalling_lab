import { z } from 'zod';

export const eventResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  location: z.string(),
  date: z.string().datetime(),
  capacity: z.number().int().positive(),
  price: z.number().positive(),
  createdAt: z.string().datetime(),
});

export const listEventsResponseSchema = z.object({
  events: z.array(eventResponseSchema),
  total: z.number().int().nonnegative(),
});

export const eventParamsSchema = z.object({
  id: z.string().uuid('ID de evento inválido'),
});