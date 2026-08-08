# Ticket API 🎟️

API REST de demonstração para uma **plataforma de venda de ingressos**, construída
como aplicação de apoio a um projeto de infraestrutura na AWS. Existe para
demonstrar **Auto Scaling**, **Load Balancer (ALB)** e **observabilidade**
(CloudWatch), portanto é intencionalmente **pequena, organizada e fácil de expandir**.

## Stack

- **Node.js** (LTS) + **TypeScript**
- **Fastify** (framework, validação/serialização via **Zod**)
- **Prisma ORM** + **PostgreSQL**
- **Pino** (logs estruturados)
- **Docker / docker-compose**

## Estrutura do projeto

Arquitetura em camadas (Routes → Controllers → Services → Repositories), mantendo
separação de responsabilidades sem engessar o projeto.

```
src/
├── app.ts                 # Fábrica do Fastify (compiladores Zod, hooks, plugins)
├── server.ts              # Bootstrap + encerramento gracioso (SIGINT/SIGTERM)
├── config/                # env (Zod) e logger (Pino)
├── controllers/           # Camada HTTP — trata request/reply
├── services/              # Regras de negócio
├── repositories/          # Acesso a dados (Prisma)
├── routes/                # Definição das rotas e injeção de dependência
├── schemas/               # Schemas Zod (validação e serialização)
├── plugins/               # Plugins do Fastify (prisma)
├── middlewares/           # Hooks do Fastify (error handler global, request logger)
├── utils/                 # AppError e helpers de resposta
└── db/                    # Seed
prisma/
├── schema.prisma
└── migrations/            # Migrations versionadas
```

## Pré-requisitos

- Node.js 20+
- Docker + docker-compose
- (opcional) PostgreSQL 16 local

## Como rodar

### 1. Ambiente local (desenvolvimento)

```bash
npm install
cp .env.example .env   # ajuste a DATABASE_URL se necessário
npx prisma generate
npx prisma migrate dev
npm run db:seed        # 10 eventos
npm run dev            # http://localhost:3000
```

### 2. Docker Compose (API + PostgreSQL)

```bash
docker compose up --build
# API    -> http://localhost:3000
# Postgre -> localhost:5432 (usuário/senha/banco: ticket)
```

> O container da API executa automaticamente `prisma migrate deploy` e o seed
> na inicialização (idempotente).

**IMPORTANTE:** se a porta `5432` já estiver ocupada na sua máquina, altere o
mapeamento `ports` do serviço `db` no `docker-compose.yml` (ex.: `"5433:5432"`)
e o `DATABASE_URL` da API.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET    | `/` | Informações básicas do serviço |
| GET    | `/health` | Health check (status, uptime, timestamp) |
| GET    | `/live` | Liveness — sempre retorna `ok` |
| GET    | `/ready` | Readiness — verifica conexão com o banco (503 se indisponível) |
| GET    | `/api/v1/events` | Lista todos os eventos |
| GET    | `/api/v1/events/:id` | Busca um evento por ID |
| POST   | `/api/v1/purchases` | Compra de ingressos |
| GET    | `/api/v1/purchases` | Lista as compras realizadas |
| GET    | `/simulate-purchase` | **Exclusivo para teste de carga (ver abaixo)** |

### Exemplos

```bash
# Health
curl http://localhost:3000/health

# Listar eventos
curl http://localhost:3000/api/v1/events

# Comprar ingresso
curl -X POST http://localhost:3000/api/v1/purchases \
  -H 'Content-Type: application/json' \
  -d '{"eventId":"10000000-0000-4000-8000-000000000001","customerName":"João","quantity":2}'
```

## Observabilidade

- **Logs estruturados (Pino):** toda requisição gera `{"level","time","service",
  "reqId","res","responseTime","msg"}` em JSON, consumível diretamente pelo
  **CloudWatch Logs**.
- **Health checks:** `/health` (geral), `/live` (liveness) e `/ready` (readiness
  com verificação real do banco).
- **Headers de correlação:** `X-Request-Id` e `X-Response-Time` em toda resposta.
  O `X-Request-Id` recebido na entrada é preservado (útil via ALB).

## Endpoint de teste de carga — `GET /simulate-purchase`

> **⚠️ EXCLUSIVO PARA TESTES DE INFRAESTRUTURA.** Este endpoint **não** deve ser
> exposto em produção. Ele existe apenas para permitir que testes com **k6**
> aumentem o uso de CPU e de acesso ao banco, demonstrando o funcionamento do
> **Auto Scaling Group** na AWS.

Ele simula uma **operação pesada de compra** executando:

1. **Queima de CPU real** por um período configurável (hash SHA-256 em loop síncrono).
2. **Consultas ao banco** (leituras aleatórias em `Event`).

### Parâmetros (query string)

| Parâmetro | Default | Descrição |
|-----------|---------|-----------|
| `cpuMs`   | `SIMULATE_CPU_MS` (500 ms via env) | Duração da queima de CPU (0–5000 ms) |
| `queries` | `3` | Quantas consultas ao banco executar (0–20) |

### Exemplos

```bash
# Carga padrão (500 ms de CPU + 3 queries)
curl http://localhost:3000/simulate-purchase

# Carga alta controlada (1500 ms de CPU + 10 queries ao banco)
curl "http://localhost:3000/simulate-purchase?cpuMs=1500&queries=10"
```

### Resposta

```json
{
  "status": "ok",
  "simulated": true,
  "cpuWorkMs": 1499,
  "dbQueries": 10,
  "eventsInDatabase": 10,
  "timestamp": "2026-08-06.1:15:42.948Z"
}
```

### Controle por ambiente

- `SIMULATE_ENABLED=true` — habilita a rota (default).
- `SIMULATE_CPU_MS=500` — duração padrão de CPU.

**Sugestão de teste com k6:** rode várias iterações em paralelo com `cpuMs` alto
(por exemplo 1000–3000 ms) enquanto observa a métrica **EC2 CPUUtilization** no
CloudWatch para ver a escala automática para fora (scale-out) pelo Auto Scaling Group.

## Endpoints prontos para o ALB

- **Target group health check:** `GET /health` (retorna 200 quando saudável).
- **Instance lifecycle (drain):** `GET /live` / `GET /ready`.

A aplicação encerra de forma graciosa ao receber `SIGTERM` (o que o Auto Scaling
emite durante *scale-in*), permitindo o drenagem adequado das conexões.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Executa com reload (`tsx watch`) |
| `npm run build` | Compila para `dist/` |
| `npm start` | Executa a build |
| `npm run typecheck` | Verifica tipos (tsc --noEmit) |
| `npm run lint` | ESLint |
| `npm run db:seed` | Popula o banco |

## Ambiente (variáveis)

| Variável | Default | Descrição |
|----------|---------|-----------|
| `NODE_ENV` | `development` | Ambiente |
| `HOST` | `0.0.0.0` | Interface de escuta |
| `PORT` | `3000` | Porta |
| `DATABASE_URL` | — | URL do PostgreSQL (Prisma) |
| `LOG_LEVEL` | `info` | Nível de log |
| `SIMULATE_CPU_MS` | `500` | Queima de CPU padrão no `/simulate-purchase` |
| `SIMULATE_ENABLED` | `true` | Habilita/desabilita a rota de simulação |
