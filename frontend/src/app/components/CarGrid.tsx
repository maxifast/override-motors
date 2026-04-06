'use client';

import { useState, useCallback } from 'react';

interface Car {
  id: number;
  title: string;
  year: number;
  mileage: number;
  fuel_type: string;
  price: number;
  images: string[];
  is_pinned: boolean;
}

interface CarGridProps {
  initialCars: Car[];
  initialTotal: number;
  filters: {
    make?: string;
    damage?: string;
    fuel?: string;
    q?: string;
  };
}

export default function CarGrid({ initialCars, initialTotal, filters }: CarGridProps) {
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(initialTotal);

  const hasMore = cars.length < total;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('skip', String(cars.length));
      params.set('take', '12');
      if (filters.make) params.set('make', filters.make);
      if (filters.damage) params.set('damage', filters.damage);
      if (filters.fuel) params.set('fuel', filters.fuel);
      if (filters.q) params.set('q', filters.q);

      const res = await fetch(`/api/cars?${params.toString()}`);
      const data = await res.json();
      if (data.cars?.length) {
        setCars(prev => [...prev, ...data.cars]);
        setTotal(data.total);
      }
    } catch (e) {
      console.error('Load more failed', e);
    } finally {
      setLoading(false);
    }
  }, [cars.length, loading, hasMore, filters]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {cars.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-20">No vehicles available or database offline.</p>
        ) : (
          cars.map((car) => (
            <a href={`/car/${car.id}`} key={car.id}>
              <div className="border border-cyan-900 rounded-lg overflow-hidden bg-gray-900/60 hover:bg-gray-800 hover:border-cyan-400 transition-all cursor-pointer relative shadow-[0_0_15px_rgba(0,0,0,0.8)] hover:shadow-[0_0_20px_rgba(0,255,255,0.2)] h-full flex flex-col group">
                {car.is_pinned && (
                  <div className="absolute top-3 left-3 bg-pink-500/20 border border-pink-500 text-pink-500 text-xs px-2 py-1 z-10 font-bold uppercase drop-shadow-[0_0_5px_#ff007f] backdrop-blur-sm">
                    Pinned
                  </div>
                )}
                <div className="h-52 bg-gray-800 relative overflow-hidden">
                  {car.images?.length > 0 ? (
                    <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">Cyber Scan Missing</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                </div>
                <div className="p-4 lg:p-5 flex flex-col flex-1 relative bg-[#050508]">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                  <h3 className="font-orbitron text-xl md:text-2xl font-black text-white tracking-wide drop-shadow-[0_0_6px_rgba(255,255,255,0.4)] mb-1">
                    {car.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-2 text-sm text-cyan-400 mb-5 font-mono drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">
                    <span>{car.year}</span>
                    <span className="w-1 h-1 rounded-full bg-cyan-700"></span>
                    <span className="uppercase">{car.fuel_type}</span>
                    <span className="w-1 h-1 rounded-full bg-cyan-700"></span>
                    <span>{car.mileage.toLocaleString('de-DE')} KM!</span>
                  </div>
                  <div className="mt-auto pt-2">
                    <p className="font-orbitron text-2xl md:text-3xl font-black text-[#ff8c00] tracking-widest drop-shadow-[0_0_20px_rgba(255,140,0,0.8)]">
                      {'\u20AC'} {car.price.toLocaleString('de-DE')}
                    </p>
                  </div>
                </div>
              </div>
            </a>
          ))
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-12">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 bg-transparent border border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white transition rounded font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(255,0,127,0.3)] disabled:opacity-50 disabled:cursor-wait"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </span>
            ) : (
              <>Load More Vehicles &#x27F3;</>
            )}
          </button>
        </div>
      )}

      {!hasMore && cars.length > 0 && (
        <div className="flex justify-center mt-12">
          <p className="text-gray-600 text-sm tracking-widest uppercase">All {total} vehicles loaded</p>
        </div>
      )}
    </>
  );
}
