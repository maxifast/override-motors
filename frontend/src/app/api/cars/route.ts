import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '16');
    const make = searchParams.get('make') || undefined;
    const damage = searchParams.get('damage') || undefined;
    const fuel = searchParams.get('fuel') || undefined;
    const q = searchParams.get('q') || undefined;

    const where: any = { status: 'active' };

    if (make && make !== 'All Makes') {
      where.brand = { name: make };
    }
    if (damage && damage !== 'All Damage Types') {
      where.damage_type = { name: damage };
    }
    if (fuel && fuel !== 'All Fuel Types') {
      where.fuel_type = fuel;
    }
    if (q) {
      const trimmed = q.trim();
      const yearMatch = trimmed.match(/\b(19\d{2}|20\d{2})\b/);
      if (yearMatch) {
        const yearVal = parseInt(yearMatch[1]);
        const textQ = trimmed.replace(yearMatch[1], '').trim();
        if (textQ) {
          where.AND = [
            { year: yearVal },
            { title: { contains: textQ, mode: 'insensitive' } },
          ];
        } else {
          where.OR = [
            { title: { contains: trimmed, mode: 'insensitive' } },
            { year: yearVal },
          ];
        }
      } else {
        where.title = { contains: trimmed, mode: 'insensitive' };
      }
    }

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        orderBy: [{ is_pinned: 'desc' }, { created_at: 'desc' }],
        skip,
        take,
      }),
      prisma.car.count({ where }),
    ]);

    return NextResponse.json({ cars, total, hasMore: skip + take < total });
  } catch (error: any) {
    console.error('[API/CARS]', error);
    return NextResponse.json({ cars: [], total: 0, hasMore: false, error: error.message }, { status: 500 });
  }
}
