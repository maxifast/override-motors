import Header from './components/Header';
import Link from 'next/link';

// Fake fetch function proxying to Express Backend
async function getCars() {
  try {
    const res = await fetch('http://localhost:5000/api/cars', { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    // Vercel / Local Fallback if Express backend is offline
    return [
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
    ];
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
