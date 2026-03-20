import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    const cars = await prisma.car.findMany({ where: { is_pinned: true } });
    console.log(JSON.stringify(cars.map(c => ({ id: c.id, title: c.title, original_url: c.original_url, images: c.images })), null, 2));
    
    // Auto-delete the badly generated image ones
    await prisma.car.deleteMany({ where: { source: 'schadeautos.nl/targeted-injection' }});
    
    // Check if fetch-first-5 ones exist
    const scraped = await prisma.car.findMany({ where: { source: 'schadeautos.nl/real-targeted' }});
    console.log("Scraped from automated playwright search:");
    console.log(JSON.stringify(scraped.map(c => ({ title: c.title, images: c.images })), null, 2));
}

check().then(() => process.exit(0));
