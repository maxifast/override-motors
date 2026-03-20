import { Queue, Worker } from 'bullmq';
import TelegramBot from 'node-telegram-bot-api';
import { prisma } from './index';
import dotenv from 'dotenv';
dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN || 'placeholder', { polling: false });
const CHAT_ID = process.env.CHAT_ID || 'placeholder';

// BullMQ Queue setup using default local Redis
export const socialQueue = new Queue('social-publishing', { connection: { host: 'localhost', port: 6379 } });

// Cron-like function to schedule 30 random pending cars
export async function scheduleDailyPosts() {
    const cars = await prisma.car.findMany({
        where: { status: 'pending_publish' },
        take: 30
    });
    
    let delayMinutes = 0;
    for (const car of cars) {
        // Add random interval between 20-50 minutes exponentially
        delayMinutes += Math.floor(Math.random() * (50 - 20 + 1)) + 20;
        
        await socialQueue.add('publish-car', { carId: car.id }, { delay: delayMinutes * 60 * 1000 });
        
        // Mark as active so it appears on the frontend
        await prisma.car.update({
            where: { id: car.id },
            data: { status: 'active' }
        });
    }
}

// Background Worker executing the delayed jobs
const worker = new Worker('social-publishing', async job => {
    const { carId } = job.data;
    const car = await prisma.car.findUnique({ where: { id: carId } });
    
    if (!car) return;

    let message_text = `🔥 ${car.title}\n`;
    message_text += `📅 Year: ${car.year}\n`;
    message_text += `⛽ Fuel: ${car.fuel_type}\n`;
    message_text += `⏱ Mileage: ${car.mileage} km\n`;
    message_text += `💰 Price: €${car.price}\n\n`;
    message_text += `🔗 View Details: https://override-motors.com/car/${car.id}`;
    
    try {
        if (car.images.length > 0) {
            await bot.sendPhoto(CHAT_ID, car.images[0], { caption: message_text });
        } else {
            await bot.sendMessage(CHAT_ID, message_text);
        }
        console.log(`[Bot] Published Car ${car.id} to Telegram successfully`);
    } catch (e) {
        console.error(`[Bot] Error publishing Car ${car.id}:`, e);
    }
}, { connection: { host: 'localhost', port: 6379 } });
