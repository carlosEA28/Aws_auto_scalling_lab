import type { PrismaClient } from '@prisma/client';

export class HealthService {
  constructor(private readonly prisma: PrismaClient) {}

  /** Verifica a conexão com o banco executando `SELECT 1`. */
  async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      // O controller registra o log
      return false;
    }
  }
}