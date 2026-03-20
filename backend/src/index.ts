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
        res.json(cars);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.listen(PORT, () => {
    console.log(`[Override Motors] Server running on http://localhost:${PORT}`);
});
