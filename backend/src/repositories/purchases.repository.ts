import type { Prisma, PrismaClient, Purchase } from '@prisma/client';

export type PurchaseWithEvent = Prisma.PurchaseGetPayload<{
  include: { event: true };
}>;

export class PurchasesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: Prisma.PurchaseUncheckedCreateInput): Promise<Purchase> {
    return this.prisma.purchase.create({ data });
  }

  async list(): Promise<PurchaseWithEvent[]> {
    return this.prisma.purchase.findMany({
      orderBy: { createdAt: 'desc' },
      include: { event: true },
    });
  }

  async countByEvent(eventId: string): Promise<number> {
    const result = await this.prisma.purchase.aggregate({
      where: { eventId },
      _sum: { quantity: true },
    });
    return result._sum.quantity ?? 0;
  }

  async count(): Promise<number> {
    return this.prisma.purchase.count();
  }
}