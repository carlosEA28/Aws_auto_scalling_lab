import { z } from 'zod';

export const createPurchaseSchema = z.object({
  eventId: z.string().uuid('ID de evento inválido'),
  customerName: z.string().trim().min(1, 'Nome é obrigatório').max(120),
  quantity: z.number().int().min(1, 'Quantidade mínima é 1').max(10),
});

export const purchaseResponseSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  eventName: z.string(),
  customerName: z.string(),
  quantity: z.number().int().positive(),
  totalPrice: z.number().positive(),
  createdAt: z.string().datetime(),
});

export const listPurchasesResponseSchema = z.object({
  purchases: z.array(purchaseResponseSchema),
  total: z.number().int().nonnegative(),
});