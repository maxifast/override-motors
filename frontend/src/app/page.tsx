import Header from './components/Header';
import CarGrid from './components/CarGrid';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 16;

async function getCars(searchParams: { make?: string, damage?: string, fuel?: string, q?: string }) {
  try {
    const where: any = { status: 'active' };
    if (searchParams.make && searchParams.make !== 'All Makes') {
      where.brand = { name: searchParams.make };
    }
    if (searchParams.damage && searchParams.damage !== 'All Damage Types') {
      where.damage_type = { name: searchParams.damage };
    }
    if (searchParams.fuel && searchParams.fuel !== 'All Fuel Types') {
      where.fuel_type = searchParams.fuel;
    }
    if (searchParams.q) {
      const q = searchParams.q.trim();
      const yearMatch = q.match(/\b(19\d{2}|20\d{2})\b/);

      if (yearMatch) {
        const yearVal = parseInt(yearMatch[1]);
        const textQ = q.replace(yearMatch[1], '').trim();

        if (textQ) {
          where.AND = [
            { year: yearVal },
            { title: { contains: textQ, mode: 'insensitive' } }
          ];
        } else {
          where.OR = [
            { title: { contains: q, mode: 'insensitive' } },
            { year: yearVal }
          ];
        }
      } else {
        where.title = { contains: q, mode: 'insensitive' };
      }
    }

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        orderBy: [
          { is_pinned: 'desc' },
          { created_at: 'desc' }
        ],
        take: PAGE_SIZE,
      }),
      prisma.car.count({ where }),
    ]);

    return { cars, total };
  } catch (e) {
    console.error("Database fetching error", e);
    return { cars: [], total: 0 };
  }
}

export default async function Home(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const filters = {
    make: searchParams.make,
    damage: searchParams.damage,
    fuel: searchParams.fuel,
    q: searchParams.q
  };
  const { cars, total } = await getCars(filters);

  return (
    <main className="min-h-screen bg-black text-white font-sans relative" style={{ backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(0, 255, 255, 0.05), transparent 25%), radial-gradient(circle at 85% 30%, rgba(255, 0, 127, 0.05), transparent 25%)' }}>
      <Header />

      <div className="p-4 sm:p-8 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
            <h2 className="text-xl md:text-2xl text-cyan-400 font-bold tracking-widest uppercase drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]">Premium EU Salvage Assets</h2>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs tracking-widest uppercase hidden md:inline-block">LIVE FEED</span>
              <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_red]"></div>
            </div>
        </div>

        <CarGrid initialCars={cars} initialTotal={total} filters={filters} />
      </div>
    </main>
  );
}
