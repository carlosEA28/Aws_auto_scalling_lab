import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SeedEvent = {
  id: string;
  name: string;
  location: string;
  date: Date;
  capacity: number;
  price: number;
};

// IDs fixos (UUID v4 determinísticos) para permitir upsert idempotente
const events: SeedEvent[] = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    name: 'Rock in São Paulo',
    location: 'Interlagos, São Paulo - SP',
    date: new Date('2026-11-06T20:00:00Z'),
    capacity: 85000,
    price: 450,
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    name: 'Festival Verão Total',
    location: 'Praia de Guarajuba, Camaçari - BA',
    date: new Date('2027-01-15T18:00:00Z'),
    capacity: 40000,
    price: 280,
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    name: 'Maratona do Rio',
    location: 'Aterro do Flamengo, Rio de Janeiro - RJ',
    date: new Date('2026-08-23T07:00:00Z'),
    capacity: 20000,
    price: 120,
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    name: 'Jazz & Soul Night',
    location: 'Blue Note, Porto Alegre - RS',
    date: new Date('2026-09-12T21:00:00Z'),
    capacity: 800,
    price: 180,
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    name: 'Circuito de Fórmula GP',
    location: 'Autódromo de Brasília, Brasília - DF',
    date: new Date('2027-03-20T09:00:00Z'),
    capacity: 60000,
    price: 620,
  },
  {
    id: '10000000-0000-4000-8000-000000000006',
    name: 'Comic Zone Convention',
    location: 'Centro de Convenções, Recife - PE',
    date: new Date('2026-10-30T10:00:00Z'),
    capacity: 15000,
    price: 95,
  },
  {
    id: '10000000-0000-4000-8000-000000000007',
    name: 'Balé das Águas',
    location: 'Teatro Amazonas, Manaus - AM',
    date: new Date('2026-08-29T20:30:00Z'),
    capacity: 700,
    price: 240,
  },
  {
    id: '10000000-0000-4000-8000-000000000008',
    name: 'Forró do Futuro',
    location: 'Parque do Povo, Campina Grande - PB',
    date: new Date('2027-06-24T22:00:00Z'),
    capacity: 50000,
    price: 150,
  },
  {
    id: '10000000-0000-4000-8000-000000000009',
    name: 'Eletrônica nas Dunas',
    location: 'Genipabu, Natal - RN',
    date: new Date('2027-01-02T20:00:00Z'),
    capacity: 25000,
    price: 199,
  },
  {
    id: '10000000-0000-4000-8000-000000000010',
    name: 'Gastronomia & Vinho',
    location: 'Parque Tanguá, Curitiba - PR',
    date: new Date('2026-11-28T12:00:00Z'),
    capacity: 5000,
    price: 350,
  },
];

async function main(): Promise<void> {
  for (const event of events) {
    await prisma.event.upsert({
      where: { id: event.id },
      update: {},
      create: {
        id: event.id,
        name: event.name,
        location: event.location,
        date: event.date,
        capacity: event.capacity,
        price: event.price,
      },
    });
  }

  const total = await prisma.event.count();
  console.log(`Seed concluído. ${total} eventos no banco.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());