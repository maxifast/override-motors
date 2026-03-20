import Header from './components/Header';
import Link from 'next/link';

// Fake fetch function proxying to Express Backend
async function getCars() {
  try {
    const res = await fetch('http://localhost:5000/api/cars', { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

export default async function Home() {
  const cars = await getCars();

  return (
    <main className="min-h-screen bg-black text-white font-sans">
      <Header />
      
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl text-cyan-400 font-bold tracking-widest uppercase">Premium EU Salvage Assets</h2>
            <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_red]"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cars.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-20">No vehicles available or database offline.</p>
          ) : (
            cars.map((car: any) => (
              <Link href={`/car/${car.id}`} key={car.id}>
                <div className="border border-cyan-500/30 rounded-lg overflow-hidden bg-gray-900/50 hover:border-cyan-400 transition cursor-pointer relative shadow-[0_0_15px_rgba(0,0,0,0.8)] h-full flex flex-col">
                  {car.is_pinned && (
                    <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 z-10 font-bold uppercase shadow-[0_0_10px_rgba(255,0,127,0.8)]">
                      Pinned
                    </div>
                  )}
                  <div className="h-48 bg-gray-800 relative">
                    {car.images?.length > 0 ? (
                      <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">Cyber Scan Missing</div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-white leading-tight">{car.title}</h3>
                    <p className="text-cyan-600 text-sm mt-1">{car.year} • {car.fuel_type}</p>
                    <p className="text-orange-500 text-xl font-bold mt-auto pt-4 text-shadow-orange">€ {car.price}</p>
                  </div>
                </div>
              </Link>
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
