import type { PurchaseWithEvent } from '../repositories/purchases.repository.js';
import { PurchasesRepository } from '../repositories/purchases.repository.js';
import { EventsRepository } from '../repositories/events.repository.js';
import { conflict, notFound } from '../utils/errors.js';

export interface CreatePurchaseInput {
  eventId: string;
  customerName: string;
  quantity: number;
}

export interface PurchaseDTO {
  id: string;
  eventId: string;
  eventName: string;
  customerName: string;
  quantity: number;
  totalPrice: number;
  createdAt: string;
}

function toPurchaseDTO(purchase: PurchaseWithEvent): PurchaseDTO {
  return {
    id: purchase.id,
    eventId: purchase.eventId,
    eventName: purchase.event.name,
    customerName: purchase.customerName,
    quantity: purchase.quantity,
    totalPrice: Number(purchase.totalPrice),
    createdAt: purchase.createdAt.toISOString(),
  };
}

export class TicketsService {
  constructor(
    private readonly purchasesRepository: PurchasesRepository,
    private readonly eventsRepository: EventsRepository,
  ) {}

  async purchase(input: CreatePurchaseInput): Promise<PurchaseDTO> {
    const event = await this.eventsRepository.findById(input.eventId);
    if (!event) {
      throw notFound('EVENT_NOT_FOUND', `Evento com id '${input.eventId}' não encontrado.`);
    }

    const sold = await this.purchasesRepository.countByEvent(input.eventId);
    if (sold + input.quantity > event.capacity) {
      const remaining = event.capacity - sold;
      throw conflict(
        'INSUFFICIENT_CAPACITY',
        `Capacidade insuficiente. Restam ${remaining} ingresso(s) para este evento.`,
      );
    }

    const totalPrice = Number(event.price) * input.quantity;
    const purchase = await this.purchasesRepository.create({
      eventId: input.eventId,
      customerName: input.customerName,
      quantity: input.quantity,
      totalPrice,
    });

    return {
      id: purchase.id,
      eventId: purchase.eventId,
      eventName: event.name,
      customerName: purchase.customerName,
      quantity: purchase.quantity,
      totalPrice: Number(purchase.totalPrice),
      createdAt: purchase.createdAt.toISOString(),
    };
  }

  async list(): Promise<{ purchases: PurchaseDTO[]; total: number }> {
    const purchases = await this.purchasesRepository.list();
    return {
      purchases: purchases.map(toPurchaseDTO),
      total: purchases.length,
    };
  }
}