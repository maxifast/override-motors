import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function check() {
    const c = await prisma.car.findUnique({ where: { id: 1477 } });
    console.log("CAR 1477:", c);
}
check().catch(console.error).finally(() => prisma.$disconnect());
