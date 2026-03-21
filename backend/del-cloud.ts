import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function clean() {
    await prisma.car.deleteMany({ where: { source: 'schadeautos.nl/cloud-sync' } });
    console.log("Deleted old cloud-sync data.");
}
clean().catch(console.error).finally(() => prisma.$disconnect());
