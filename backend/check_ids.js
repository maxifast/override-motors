const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cars = await prisma.car.findMany({ take: 5, orderBy: { created_at: 'desc' } });
  console.log('VALID_IDS:', cars.map(c => c.id));
}

main().catch(console.error).finally(() => prisma.$disconnect());
