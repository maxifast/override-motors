import { prisma } from "../../../lib/prisma";
import Link from 'next/link';
import CarGallery from '../../../components/CarGallery';

export const dynamic = 'force-dynamic';

export default async function CarDetail({ params }: { params: { id: string } }) {
  const carId = parseInt(params.id);
  if (isNaN(carId)) {
    return <div className="text-white text-center p-20">INVALID SIGNAL DETECTED</div>;
  }

  const car = await prisma.car.findUnique({
    where: { id: carId }
  });

  if (!car) {
    return <div className="text-white text-center p-20 font-mono tracking-widest text-red-500 text-xl shadow-[0_0_10px_red]">404 - ASSET NOT FOUND IN DATABANKS</div>;
  }

  return (
    <main className="min-h-screen bg-black text-white font-sans relative" style={{ backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(0, 255, 255, 0.05), transparent 25%), radial-gradient(circle at 85% 30%, rgba(255, 0, 127, 0.05), transparent 25%)' }}>
      
      {/* HEADER PORTED FROM HOMEPAGE */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-cyan-500/30 bg-black/50 backdrop-blur sticky top-0 z-50">
        <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]">
                OVERRIDE MOTORS
            </h1>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 border border-red-500/50 bg-red-900/20 px-3 py-1 rounded text-red-500 text-xs font-bold tracking-widest uppercase">
                <span className="animate-ping w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                ACCESS LEVEL: PREMIUM
            </div>
            <Link href="/" className="px-4 py-2 bg-cyan-900/40 hover:bg-cyan-600/60 border border-cyan-500 text-cyan-300 font-bold uppercase tracking-widest text-xs transition duration-300 shadow-[0_0_10px_rgba(0,255,255,0.2)]">
                &lt; BACK TO FEED
            </Link>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto p-4 md:p-8 mt-4 grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* LEFT COLLUMN - VISUALS */}
        <CarGallery images={car.images || []} title={car.title} />

        {/* RIGHT COLUMN - DATA & SPECS */}
        <div className="flex flex-col gap-6">
            <div className="border-b border-gray-800 pb-6 relative">
                <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-purple-600"></div>
                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{car.title}</h1>
                <div className="flex flex-wrap gap-3 mt-4">
                    <span className="px-3 py-1 bg-cyan-900/30 border border-cyan-800 text-cyan-400 font-mono text-sm uppercase">YEAR: {car.year}</span>
                    <span className="px-3 py-1 bg-purple-900/30 border border-purple-800 text-purple-400 font-mono text-sm uppercase">MILEAGE: {car.mileage.toLocaleString()} KM</span>
                    <span className="px-3 py-1 bg-orange-900/30 border border-orange-800 text-orange-400 font-mono text-sm uppercase">FUEL: {car.fuel_type}</span>
                </div>
            </div>

            <div className="flex gap-4 items-end">
                <div className="flex flex-col">
                    <span className="text-gray-500 font-mono text-xs mb-1">ASSET ACQUISITION VALUE</span>
                    <span className="text-4xl md:text-5xl font-bold text-orange-500 drop-shadow-[0_0_15px_rgba(255,165,0,0.4)]">
                        € {car.price.toLocaleString()}
                    </span>
                </div>
                <div className="ml-auto">
                    <button className="px-8 py-4 bg-pink-600 hover:bg-pink-500 text-white font-black uppercase tracking-widest text-lg transition shadow-[0_0_20px_rgba(255,0,127,0.5)] border border-pink-400 hover:scale-105 transform">
                        INITIATE TRANSFER
                    </button>
                </div>
            </div>

            {/* NEON PANELS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-900/50 border border-red-900 p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-8 h-8 bg-red-500/10 border-l border-b border-red-500/30 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                        <span className="text-red-500 text-[10px] font-mono">⚠</span>
                    </div>
                    <h3 className="text-red-500 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                        <div className="w-1 h-3 bg-red-500"></div>
                        Damage Profile
                    </h3>
                    <p className="text-gray-300 font-mono text-sm leading-relaxed">
                        {car.damage_description_en || "System indicates unspecified structural anomalies. Full physical inspection recommended."}
                    </p>
                </div>

                <div className="bg-gray-900/50 border border-cyan-900 p-4 relative overflow-hidden group">
                    <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                        <div className="w-1 h-3 bg-cyan-400"></div>
                        Market Analysis
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-xs font-mono text-gray-400 mb-1"><span>Repair Est.</span> <span>€{(car.price * 0.45).toLocaleString(undefined, {maximumFractionDigits:0})}</span></div>
                            <div className="w-full h-1 bg-gray-800"><div className="h-full bg-cyan-600 w-[45%]"></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-mono text-gray-400 mb-1"><span>Profit Margin</span> <span>HIGH</span></div>
                            <div className="w-full h-1 bg-gray-800"><div className="h-full bg-green-500 w-[82%] shadow-[0_0_5px_#0f0]"></div></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 border-t border-gray-800 pt-6">
                <p className="text-xs text-gray-600 font-mono">
                    ORIGIN DATALINK: <a href={car.original_url} target="_blank" className="text-cyan-700 hover:text-cyan-400 hover:underline break-all">{car.original_url}</a>
                </p>
            </div>
        </div>
      </div>
      
      {/* Required for the scanning animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </main>
  );
}
