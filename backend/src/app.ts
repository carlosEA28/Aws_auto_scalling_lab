import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { buildLoggerOptions } from './config/logger.js';
import { buildErrorHandler } from './middlewares/error-handler.js';
import { registerRequestLogger } from './middlewares/request-logger.js';
import { prismaPlugin } from './plugins/prisma.js';
import { apiRoutes } from './routes/index.js';

/** Constrói a instância do Fastify com toda a configuração da aplicação. */
export function buildApp() {
  const app = Fastify({
    logger: buildLoggerOptions(),
    // Confia no X-Forwarded-For quando atrás do Application Load Balancer (AWS)
    trustProxy: true,
    genReqId: (req) => req.headers['x-request-id']?.toString() ?? cryptoUUID(),
  });

  // Validação/serialização via Zod
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Tratamento de erros padronizado (global)
  app.setErrorHandler(buildErrorHandler());

  // Middlewares / plugins
  app.register(prismaPlugin);
  app.register(registerRequestLogger);
  app.register(apiRoutes);

  return app;
}

function cryptoUUID(): string {
  return globalThis.crypto.randomUUID();
}