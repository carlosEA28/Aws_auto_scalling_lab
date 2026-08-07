import type { Event, PrismaClient } from '@prisma/client';

export class EventsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(): Promise<Event[]> {
    return this.prisma.event.findMany({
      orderBy: { date: 'asc' },
    });
  }

  async findById(id: string): Promise<Event | null> {
    return this.prisma.event.findUnique({ where: { id } });
  }

  async count(): Promise<number> {
    return this.prisma.event.count();
  }
}