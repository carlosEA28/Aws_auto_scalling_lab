import 'dotenv/config';
import { z } from 'zod';

const booleanFromEnv = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  // Endpoint /simulate-purchase (testes de carga / Auto Scaling)
  SIMULATE_CPU_MS: z.coerce.number().int().min(0).max(10000).default(500),
  SIMULATE_ENABLED: booleanFromEnv.default('true'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    'Variáveis de ambiente inválidas:',
    JSON.stringify(result.error.flatten().fieldErrors, null, 2),
  );
  process.exit(1);
}

export const env = result.data;

export type Env = typeof env;