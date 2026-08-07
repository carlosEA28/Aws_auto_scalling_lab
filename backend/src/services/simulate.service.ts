import { createHash } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';

export interface SimulateOptions {
  cpuMs: number;
  dbQueries: number;
}

export interface SimulateResult {
  status: string;
  simulated: boolean;
  cpuWorkMs: number;
  dbQueries: number;
  eventsInDatabase: number;
  timestamp: string;
}

/**
 * Serviço que simula uma operação pesada de compra de ingressos:
 * queima CPU artificialmente (hash SHA-256) por `cpuMs` e executa
 * `dbQueries` leituras ao banco. Serve exclusivamente para testes de
 * carga (k6) e demonstração de Auto Scaling na AWS.
 */
export class SimulateService {
  constructor(private readonly prisma: PrismaClient) {}

  async run({ cpuMs, dbQueries }: SimulateOptions): Promise<SimulateResult> {
    const cpuStart = process.hrtime.bigint();
    this.burnCpu(cpuMs);
    const cpuWorkMs = Number((process.hrtime.bigint() - cpuStart) / 1_000_000n);

    for (let i = 0; i < dbQueries; i++) {
      await this.prisma.event.findFirst({
        orderBy: { date: 'desc' },
        select: { id: true, name: true },
      });
    }

    const eventsInDatabase = await this.prisma.event.count();

    return {
      status: 'ok',
      simulated: true,
      cpuWorkMs,
      dbQueries,
      eventsInDatabase,
      timestamp: new Date().toISOString(),
    };
  }

  /** Loop síncrono de CPU com hash SHA-256 por `ms` milissegundos. */
  private burnCpu(ms: number): void {
    const end = Date.now() + ms;
    let nonce = 0;
    while (Date.now() < end) {
      const hash = createHash('sha256');
      hash.update(`load-${process.hrtime.bigint()}-${nonce++}`);
      hash.digest('hex');
    }
  }
}