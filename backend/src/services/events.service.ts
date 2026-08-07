import type { Event } from '@prisma/client';
import { EventsRepository } from '../repositories/events.repository.js';
import { notFound } from '../utils/errors.js';

export interface EventDTO {
  id: string;
  name: string;
  location: string;
  date: string;
  capacity: number;
  price: number;
  createdAt: string;
}

function toEventDTO(event: Event): EventDTO {
  return {
    id: event.id,
    name: event.name,
    location: event.location,
    date: event.date.toISOString(),
    capacity: event.capacity,
    price: Number(event.price),
    createdAt: event.createdAt.toISOString(),
  };
}

export class EventsService {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async list(): Promise<{ events: EventDTO[]; total: number }> {
    const events = await this.eventsRepository.list();
    return {
      events: events.map(toEventDTO),
      total: events.length,
    };
  }

  async getById(id: string): Promise<EventDTO> {
    const event = await this.eventsRepository.findById(id);
    if (!event) {
      throw notFound('EVENT_NOT_FOUND', `Evento com id '${id}' não encontrado.`);
    }
    return toEventDTO(event);
  }
}