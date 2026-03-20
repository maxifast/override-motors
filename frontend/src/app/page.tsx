import Header from './components/Header';
import Link from 'next/link';

import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getCars() {
  try {
    const cars = await prisma.car.findMany({
      orderBy: [
        { is_pinned: 'desc' },
        { created_at: 'desc' }
      ]
    });
    return cars;
  } catch (e) {
    console.error("Database fetching error", e);
    return [];
  }
}

export default async function Home() {
  const cars = await getCars();

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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cars.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-20">No vehicles available or database offline.</p>
          ) : (
            cars.map((car: any) => (
              <a href={`/car/${car.id}`} key={car.id}>
                <div className="border border-cyan-900 rounded-lg overflow-hidden bg-gray-900/60 hover:bg-gray-800 hover:border-cyan-400 transition-all cursor-pointer relative shadow-[0_0_15px_rgba(0,0,0,0.8)] hover:shadow-[0_0_20px_rgba(0,255,255,0.2)] h-full flex flex-col group">
                  {car.is_pinned && (
                    <div className="absolute top-3 left-3 bg-pink-500/20 border border-pink-500 text-pink-500 text-xs px-2 py-1 z-10 font-bold uppercase drop-shadow-[0_0_5px_#ff007f] backdrop-blur-sm">
                      Pinned
                    </div>
                  )}
                  <div className="h-52 bg-gray-800 relative overflow-hidden">
                    {car.images?.length > 0 ? (
                      <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">Cyber Scan Missing</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                  </div>
                  <div className="p-5 flex flex-col flex-1 relative">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                    <h3 className="text-lg font-bold text-white leading-tight drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]">{car.title}</h3>
                    <p className="text-cyan-600 text-sm mt-2 font-mono">{car.year} • {car.mileage.toLocaleString()} km • {car.fuel_type}</p>
                    <p className="text-orange-500 text-2xl font-bold mt-auto pt-4 drop-shadow-[0_0_8px_rgba(255,165,0,0.4)]">€ {car.price.toLocaleString()}</p>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>
        
        <div className="flex justify-center mt-12">
          <button className="px-8 py-3 bg-transparent border border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white transition rounded font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(255,0,127,0.3)]">
            Load More Vehicles ⟳
          </button>
        </div>
      </div>
    </main>
  );
}
