# Auto Scaling na AWS — Ticket API 🎟️

Projeto de demonstração de **infraestrutura as code (IaC)** na AWS usando o
**Terraform**. O repositório contém uma API REST de venda de ingressos
(`backend/`) que serve como carga de trabalho para demonstrar **Auto Scaling**,
**Application Load Balancer (ALB)** e **observabilidade**, além de toda a
infraestrutura provisionada na nuvem (`infra/`).

## Visão geral

```
                         Internet
                            │
                            ▼
                     ┌─────────────┐
                     │   ALB (80)  │  Application Load Balancer (público)
                     └──────┬──────┘
                            │ target group :3000 (health /health)
              ┌─────────────┴─────────────┐
              ▼                           ▼
        ┌─────────────┐            ┌─────────────┐
        │    EC2      │            │    EC2      │   Auto Scaling Group
        │ ticket-api  │            │ ticket-api  │   (t3.micro, 2–6 instâncias)
        └──────┬──────┘            └──────┬──────┘
               │                          │
               └───────────┬──────────────┘
                           ▼
                   ┌──────────────┐
                   │  RDS (5432)  │  PostgreSQL 15 Multi-AZ
                   └──────────────┘
```

A API roda em contêineres Docker (imagem armazenada no **ECR**) dentro do **Auto
Scaling Group (ASG)**, que escala automaticamente conforme o uso de CPU. Fora da
arquitetura fica o **RDS**, que é o único componente persistente e **não escala**.

## Repositório

| Diretório  | Conteúdo |
|------------|----------|
| `backend/` | API REST (Node.js + TypeScript + Fastify + Prisma). README próprio com detalhes de execução. |
| `infra/`   | Terraform (VPC, EC2/ASG, ALB, RDS, ECR, Security Groups). |
| `.github/workflows/` | CI/CD (deploy automático) e workflow manual para destroy. |

## Infraestrutura AWS (Terraform)

Todo o provisionamento é feito com **Terraform** (região `sa-east-1`), com o
**state remoto no S3** e módulos em `infra/modules/`:

| Componente | Módulo | Detalhes |
|------------|--------|----------|
| **VPC** | `vpc` | CIDR `10.0.0.0/16`, 2 AZs (`sa-east-1a/b`), subnets públicas e privadas, **NAT Gateways** (um por AZ) e Internet Gateway. |
| **ALB** | `alb` | Aplication Load Balancer público na porta `80`. Target group na porta `3000` com health check em `/health`. |
| **EC2 / ASG** | `ec2` | Launch template com Amazon Linux 2023 + Docker. ASG `2–6` instâncias `t3.micro` multi-AZ. **Scale-out via Target Tracking de 60% de CPU** (ASGAverageCPUUtilization). |
| **RDS** | `rds` | PostgreSQL 15, `db.t3.micro`, **Multi-AZ**, subnets privadas, backup de 7 dias. |
| **ECR** | `ecr` | Repositório `ticket-api`, scan de imagem e lifecycle mantendo as últimas 5 imagens. |
| **Security Groups** | `security_groups` | ALB recebe HTTP da internet e só aponta para as EC2 (porta 3000); EC2 falam apenas com o RDS (5432) e com SSH restrito. |
| **IAM** | `ec2` | Role + instance profile para as EC2 puxarem imagens do ECR. |

### Auto Scaling

- **Mínimo / Desejado / Máximo:** 2 / 2 / 6 instâncias.
- **Política:** Target Tracking Scaling mantém **CPU média do ASG em 60%**.
- **Health check:** via ELB — o ALB marca instâncias como unhealthy se `/health`
  responder diferente de 200, e o ASG substitui a instância.
- **Lifecycle:** a API encerra de forma graciosa ao receber `SIGTERM` (drain).
  O deploy usa `start-instance-refresh` com `MinHealthyPercentage=100`.

### Segurança

- EC2 em **subnets privadas** — acesso público somente via ALB.
- Saída de internet das subnets privadas via **NAT Gateway**.
- RDS acessível apenas pelas EC2 (Security Group referenciado, não por IP).

## Rota de estresse — `GET /simulate-purchase`

> **⚠️ Exclusiva para testes de infraestrutura.** Não deve ser exposta em produção.

Simula uma operação pesada de compra: **queima CPU real** (loop SHA-256) por um
tempo configurável e executa leituras arbitrárias no banco. É usada com **k6**
para elevar a métrica `CPUUtilization` e demonstrar o **scale-out** do ASG.

| Parâmetro | Default | Descrição |
|-----------|---------|-----------|
| `cpuMs`   | `500` (`SIMULATE_CPU_MS`) | Duração da queima de CPU (0–5000 ms) |
| `queries` | `3` | Consultas ao banco (0–20) |

```bash
# Carga padrão
curl http://localhost:3000/simulate-purchase

# Carga alta controlada (1,5s de CPU + 10 queries ao banco)
curl "http://localhost:3000/simulate-purchase?cpuMs=1500&queries=10"
```

**Teste no ALB:** aponte o k6 para o DNS do load balancer e suba várias
iterações em paralelo com `cpuMs` alto (1000–3000 ms). Monitore a métrica
**EC2 CPUUtilization** no CloudWatch e observe novas instâncias entrando no ASG.

Exemplo de script k6:

```js
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // sobe para 50 VUs
    { duration: '3m', target: 50 },   // mantém a carga (estresse)
    { duration: '2m', target: 0 },    // derruba
  ],
};

export default function () {
  http.get('http://<ALB-DNS>/simulate-purchase?cpuMs=1500&queries=10');
}
```

## CI/CD (GitHub Actions)

- **[ci-cd.yml](.github/workflows/ci-cd.yml)** — disparado no push para `main`:
  1. **Terraform**: init → validate → plan → apply.
  2. **Build**: typecheck, lint e build da API.
  3. **Deploy**: build + push da imagem ao ECR (tag `git-<sha>` e `latest`) e
     refresh das instâncias do ASG.
- **[destroy.yml](.github/workflows/destroy.yml)** — manual (`workflow_dispatch`),
  exige digitar `DESTROY` para apagar toda a infraestrutura.

## Como rodar localmente

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed   # 10 eventos
npm run dev       # http://localhost:3000
```

Alternativa com Docker Compose: `docker compose up --build` (API + PostgreSQL).

Para provisionar a infraestrutura na AWS:

```bash
cd infra
terraform init
terraform plan
terraform apply
```

A documentação completa da API (stack, endpoints, estrutura e variáveis de
ambiente) está em [`backend/README.md`](backend/README.md).