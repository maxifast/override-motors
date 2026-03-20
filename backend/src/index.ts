import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
export const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Admin CMS Endpoints ---

// Create manual car
app.post('/admin/cars', async (req, res) => {
    try {
        const car = await prisma.car.create({
            data: { ...req.body, source: 'manual', is_pinned: true }
        });
        res.status(201).json(car);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create car' });
    }
});

// Delete car
app.delete('/admin/cars/:id', async (req, res) => {
    try {
        await prisma.car.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete car' });
    }
});

// Toggle pin status
app.patch('/admin/cars/:id/pin', async (req, res) => {
    try {
        const { is_pinned } = req.body;
        const car = await prisma.car.update({
            where: { id: parseInt(req.params.id) },
            data: { is_pinned }
        });
        res.json(car);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update pin status' });
    }
});

// --- Frontend API Endpoints ---
app.get('/api/cars', async (req, res) => {
    try {
        const cars = await prisma.car.findMany({
            where: { status: 'active' },
            orderBy: [
                { is_pinned: 'desc' },
                { created_at: 'desc' }
            ]
        });
        
        if (cars.length > 0) {
            return res.json(cars);
        }
        throw new Error("No cars found or DB offline");
    } catch (error) {
        console.log("[API] Database offline or empty. Returning premium mock data for UI testing.");
        // Fallback Mock Data for Next.js UI Testing
        res.json([
            {
                id: 1, title: 'Porsche 911 GT3 RS (992)', year: 2023, mileage: 2400, fuel_type: 'Petrol', price: 185000,
                damage_description_en: 'Heavy front collision damage. Airbags deployed. Engine intact.', is_pinned: true,
                images: ['https://images.unsplash.com/photo-1503376760367-1b612164ad40?q=80&w=1000&auto=format&fit=crop']
            },
            {
                id: 2, title: 'Audi RS6 Avant Performance', year: 2024, mileage: 800, fuel_type: 'Petrol Hybrid', price: 115000,
                damage_description_en: 'Side swipe damage to driver side. Drivetrain functioning.', is_pinned: false,
                images: ['https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1000&auto=format&fit=crop']
            },
            {
                id: 3, title: 'McLaren 720S Spider', year: 2021, mileage: 12500, fuel_type: 'Petrol', price: 145000,
                damage_description_en: 'Underbody and suspension damage. Carbon tub verified intact.', is_pinned: true,
                images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1000&auto=format&fit=crop']
            },
            {
                id: 4, title: 'Mercedes-Benz G63 AMG', year: 2022, mileage: 38000, fuel_type: 'Petrol', price: 95000,
                damage_description_en: 'Rear collision. Frame slight bend. Repairable status.', is_pinned: false,
                images: ['https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=1000&auto=format&fit=crop']
            }
        ]);
    }
});

app.listen(PORT, () => {
    console.log(`[Override Motors] Server running on http://localhost:${PORT}`);
});
