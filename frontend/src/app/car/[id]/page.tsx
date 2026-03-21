import prisma from "@/lib/prisma";
import Link from 'next/link';
import CarGallery from '../../../components/CarGallery';
import Header from '../../components/Header';
import TransferSection from '../../components/TransferSection';

export const dynamic = 'force-dynamic';

export default async function CarDetail(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const carId = parseInt(id, 10);
  
  if (isNaN(carId)) {
    return (
      <div className="text-white text-center p-20 font-orbitron uppercase tracking-widest text-red-500">
        INVALID SIGNAL DETECTED: {id}
      </div>
    );
  }

  const car = await prisma.car.findUnique({
    where: { id: carId }
  });

  if (!car) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center p-10">
        <div className="text-center p-12 border-2 border-red-600 bg-red-950/20 backdrop-blur-xl shadow-[0_0_30px_rgba(255,0,0,0.3)]">
          <h2 className="font-orbitron text-3xl md:text-4xl font-black text-red-500 tracking-[0.2em] mb-4">404 - ASSET NOT FOUND</h2>
          <p className="text-gray-400 font-mono text-sm tracking-widest uppercase mb-8">ENTRY PURGED FROM CENTRAL DATABANKS</p>
          <Link href="/" className="px-6 py-3 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-500 transition shadow-[0_0_15px_rgba(255,0,0,0.5)]">
            RETURN TO FEED
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050508] text-white font-sans relative overflow-x-hidden">
      
      {/* GLOBAL HEADER */}
      <Header />

      <div className="max-w-[1400px] mx-auto p-4 md:p-8 lg:p-12 relative z-10">
        
        {/* Back Link */}
        <div className="mb-6 group">
          <Link href="/" className="inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-400 font-mono text-sm font-bold uppercase tracking-[0.3em] transition bg-cyan-950/20 px-4 py-2 border border-cyan-500/30 rounded-sm">
            <span className="group-hover:-translate-x-1 transition-transform">«</span> RETURN_TO_SYSTEM_FEED
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-start">
          
          {/* LEFT COLUMN - VISUALS */}
          <div className="relative">
             <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-pink-500 to-cyan-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
             <div className="relative bg-black rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                <CarGallery images={car.images || []} title={car.title} />
             </div>
          </div>

          {/* RIGHT COLUMN - DATA & SPECS */}
          <div className="flex flex-col gap-8">
              <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                     <span className="h-[2px] w-12 bg-pink-500 shadow-[0_0_10px_#ec4899]"></span>
                     <span className="text-pink-500 font-mono text-[10px] font-bold tracking-[0.4em] uppercase">VEHICLE_REPORT_v2.4</span>
                  </div>
                  
                  <h1 className="font-orbitron text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] mb-6 uppercase">
                    {car.title}
                  </h1>

                  <div className="flex flex-wrap gap-4">
                      <div className="px-4 py-2 bg-cyan-900/10 border border-cyan-800/50 backdrop-blur-md rounded-sm">
                        <span className="block text-[8px] text-cyan-600 font-mono font-bold tracking-widest uppercase mb-1">MANUFACTURE_YEAR</span>
                        <span className="font-orbitron text-cyan-400 text-lg font-bold">{car.year}</span>
                      </div>
                      <div className="px-4 py-2 bg-fuchsia-900/10 border border-fuchsia-800/50 backdrop-blur-md rounded-sm">
                        <span className="block text-[8px] text-fuchsia-600 font-mono font-bold tracking-widest uppercase mb-1">DISTANCE_TRAVELED</span>
                        <span className="font-orbitron text-fuchsia-400 text-lg font-bold">{car.mileage.toLocaleString('de-DE')} <span className="text-sm">KM</span></span>
                      </div>
                      <div className="px-4 py-2 bg-green-900/10 border border-green-800/50 backdrop-blur-md rounded-sm">
                        <span className="block text-[8px] text-green-600 font-mono font-bold tracking-widest uppercase mb-1">POWER_SOURCE</span>
                        <span className="font-orbitron text-green-400 text-lg font-bold uppercase">{car.fuel_type}</span>
                      </div>
                  </div>
              </div>

              {/* INTERACTIVE TRANSFER SECTION (CLIENT COMPONENT) */}
              <TransferSection carPrice={car.price} originalUrl={car.original_url} />


              {/* NEON PANELS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Damage Info */}
                  <div className="bg-[#0a0a0f] border border-red-900/50 p-6 relative overflow-hidden group hover:border-red-500/80 transition-colors duration-500">
                      <div className="absolute top-0 right-0 p-3 bg-red-900/10 border-l border-b border-red-900/50">
                          <span className="text-red-500 text-sm animate-pulse">⚠️</span>
                      </div>
                      <h3 className="font-orbitron text-red-500 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 shadow-[0_0_8px_red]"></span>
                        DAMAGE_PROFILE_REPORT
                      </h3>
                      <p className="text-gray-400 font-mono text-sm leading-relaxed border-l-2 border-red-900/30 pl-4 py-1 italic">
                        {car.damage_description_en || "System indicates unspecified structural anomalies. Deep scan required."}
                      </p>
                  </div>

                  {/* Profit Analysis */}
                  <div className="bg-[#0a0a0f] border border-cyan-900/50 p-6 relative overflow-hidden group hover:border-cyan-500/80 transition-colors duration-500">
                      <h3 className="font-orbitron text-cyan-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-cyan-400 shadow-[0_0_8px_cyan]"></span>
                        MARKET_ANALYSIS_INDEX
                      </h3>
                      <div className="space-y-4">
                          <div>
                              <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-2 tracking-widest">
                                 <span>REPAIR_ESTIMATE_INDEX</span> 
                                 <span className="text-cyan-400 font-bold">€{(car.price * 0.45).toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                              </div>
                              <div className="w-full h-1 bg-gray-950 shadow-inner"><div className="h-full bg-cyan-600/60 w-[45%] shadow-[0_0_10px_rgba(0,255,255,0.3)]"></div></div>
                          </div>
                          <div>
                              <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-2 tracking-widest">
                                 <span>EST_PROFIT_MARGIN_RATING</span> 
                                 <span className="text-green-400 font-bold">HIGH_YIELD</span>
                              </div>
                              <div className="w-full h-1 bg-gray-950 shadow-inner"><div className="h-full bg-green-500/60 w-[82%] shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div></div>
                          </div>
                      </div>
                  </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.3em]">SECURE_STORAGE_LOCATION: EU_WEST_NODE</span>
                  <p className="text-[9px] text-gray-700 font-mono break-all leading-tight">
                    ORIGIN_DATALINK: <a href={car.original_url} target="_blank" className="text-cyan-900 hover:text-cyan-500 transition-colors">{car.original_url}</a>
                  </p>
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* Background Graphic Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[20%] -left-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[10%] -right-20 w-80 h-80 bg-pink-500/5 rounded-full blur-[100px]"></div>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
      </div>
      
    </main>
  );
}
