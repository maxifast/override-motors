import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function clean() {
    await prisma.car.deleteMany({ where: { source: 'schadeautos.nl/targeted-ev' } });
    console.log("Deleted mock targeted data.");
}
clean().catch(console.error).finally(() => prisma.$disconnect());
