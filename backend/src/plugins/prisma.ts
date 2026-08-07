import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

/**
 * Plugin que expõe o PrismaClient como `fastify.prisma`
 * e garante a desconexão ao fechar o servidor.
 */
export const prismaPlugin = fp(async (fastify: FastifyInstance) => {
  const prisma = new PrismaClient({
    log: ['warn', 'error'],
  });

  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
});