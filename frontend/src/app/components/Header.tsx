"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const CyberGauge = ({ value, label, color, unit, prefix = '' }: any) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setDisplayValue(parseInt(value)), 100);
    return () => clearTimeout(timeout);
  }, [value]);

  const isCyan = color === 'cyan';
  const strokeColor = isCyan ? '#00ffff' : '#f0abfc'; // cyan or fuchsia
  const glowClass = isCyan ? 'drop-shadow-[0_0_10px_rgba(0,255,255,1)]' : 'drop-shadow-[0_0_10px_rgba(217,70,239,1)]';
  const textClass = isCyan ? 'text-cyan-400' : 'text-fuchsia-400';

  const dasharray = 264; // roughly 2 * PI * 42
  const progressOffset = dasharray - (dasharray * displayValue / 100);

  return (
    <div className={`relative flex flex-col items-center justify-center w-20 h-20 xl:w-24 xl:h-24 ${glowClass}`}>
      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
        <circle cx="50%" cy="50%" r="42%" stroke="#1f2937" strokeWidth="3" fill="transparent" />
        <circle 
            cx="50%" cy="50%" r="42%" 
            stroke={strokeColor} 
            strokeWidth="3" fill="transparent" 
            strokeDasharray={dasharray}
            strokeDashoffset={progressOffset} 
            strokeLinecap="square"
            className="transition-all duration-1000 ease-out" 
        />
      </svg>
      <div className="flex flex-col items-center justify-center z-10 leading-none group-hover:scale-110 transition mt-0.5">
        <span className={`font-orbitron text-lg xl:text-xl font-black tracking-tighter ${textClass}`}>
          {prefix}{displayValue}<span className="text-xs">{unit}</span>
        </span>
        <span className="text-[7px] xl:text-[8px] font-mono text-gray-300 tracking-widest uppercase text-center mt-1 leading-[1.1] max-w-[60px]">
          {label.split(' ').map((l: string, i: number) => <div key={i}>{l}</div>)}
        </span>
      </div>
    </div>
  );
};

const BarChartDecal = () => (
    <div className="flex flex-col justify-center gap-1 h-12 xl:h-16 opacity-80 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] mr-2 xl:mr-4">
        <div className="w-8 xl:w-10 h-1 bg-cyan-600 rounded-sm"></div>
        <div className="w-6 xl:w-8 h-1 bg-cyan-400 rounded-sm"></div>
        <div className="w-8 xl:w-10 h-1 bg-cyan-800 rounded-sm"></div>
        <div className="w-4 xl:w-6 h-1 bg-cyan-500 rounded-sm"></div>
        <div className="w-10 xl:w-12 h-1 bg-cyan-700 rounded-sm"></div>
        <div className="w-6 xl:w-8 h-1 bg-cyan-600 rounded-sm"></div>
    </div>
);

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [make, setMake] = useState(searchParams.get('make') || 'All Makes');
  const [damage, setDamage] = useState(searchParams.get('damage') || 'All Damage Types');
  const [fuel, setFuel] = useState(searchParams.get('fuel') || 'All Fuel Types');
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const applyFilters = (newMake?: string, newDamage?: string, newFuel?: string, newQuery?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    const m = newMake !== undefined ? newMake : make;
    const d = newDamage !== undefined ? newDamage : damage;
    const f = newFuel !== undefined ? newFuel : fuel;
    const q = newQuery !== undefined ? newQuery : query;

    if (m && m !== 'All Makes') params.set('make', m); else params.delete('make');
    if (d && d !== 'All Damage Types') params.set('damage', d); else params.delete('damage');
    if (f && f !== 'All Fuel Types') params.set('fuel', f); else params.delete('fuel');
    if (q) params.set('q', q); else params.delete('q');
    
    router.push(`/?${params.toString()}`);
  };

  return (
    <header className="relative w-full bg-[#050508] border-b-2 border-pink-500/50 shadow-[0_4px_30px_rgba(255,0,127,0.2)] overflow-hidden">
      
      {/* Animated Perspective Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]" 
           style={{ 
               backgroundImage: 'linear-gradient(rgba(0,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,1) 1px, transparent 1px)',
               backgroundSize: '40px 40px',
               transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(3)',
               transformOrigin: 'top center',
               maskImage: 'linear-gradient(to bottom, transparent, black 10%, transparent 100%)',
               WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, transparent 100%)'
           }}>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto p-3 lg:p-4 flex flex-col gap-4">

         {/* Top Area: Logo & Gauges */}
         <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6 w-full">
             
             {/* Left Side: Logo & Titles */}
             <div className="flex flex-col items-center lg:items-start text-center lg:text-left z-20">
                 <div className="flex items-center gap-2 mb-1">
                    <div className="text-red-500 font-mono text-[9px] md:text-[10px] xl:text-xs font-bold tracking-widest border border-red-500/50 px-2 py-0.5 bg-red-900/20 drop-shadow-[0_0_8px_rgba(255,0,0,0.8)] uppercase">
                       <span className="animate-pulse mr-2">⚠️</span> ACCESS LEVEL: CYBER-CORE [PRO]
                    </div>
                 </div>
                 
                 <Link href="/">
                     <h1 className="font-orbitron text-3xl md:text-4xl lg:text-5xl font-black tracking-widest uppercase hover:opacity-80 transition cursor-pointer drop-shadow-[0_0_15px_rgba(255,0,127,0.4)] mt-1 animate-electric-shimmer">
                         OVERRIDE MOTORS
                     </h1>
                 </Link>

                 <div className="flex items-center gap-2 mt-2">
                     <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,1)] animate-ping absolute"></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,1)] relative"></div>
                     <span className="text-cyan-400 font-mono text-[8px] md:text-[10px] xl:text-xs font-bold tracking-[0.2em] border border-cyan-400/30 px-3 py-0.5 bg-cyan-900/10 drop-shadow-[0_0_8px_rgba(0,255,255,0.7)] uppercase ml-2">
                         PREMIUM EU SALVAGE ASSETS
                     </span>
                 </div>
             </div>

             {/* Right Side: Cyber Gauges */}
             <div className="hidden md:flex items-center gap-2 xl:gap-4 bg-black/40 p-3 rounded-xl border border-white/5 backdrop-blur-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] z-20">
                 <BarChartDecal />
                 <CyberGauge value="92" label="DAMAGE ASSESSMENT" color="cyan" unit="%" />
                 <CyberGauge value="18" label="REPAIR EST." color="pink" unit="k" prefix="€" />
                 <CyberGauge value="88" label="MARKET INDEX" color="cyan" unit="/100" />
             </div>
         </div>

         {/* Bottom Area: Controls/Filters */}
         <div className="flex flex-wrap items-center gap-3 w-full bg-[#0a0a0f]/80 p-2 lg:p-3 rounded-lg border border-cyan-900/50 backdrop-blur-md shadow-[0_0_15px_rgba(0,255,255,0.05)] z-20">
            <select 
                value={make} 
                onChange={(e) => { setMake(e.target.value); applyFilters(e.target.value, undefined, undefined, undefined); }}
                className="bg-black text-cyan-400 border border-cyan-800/50 hover:border-cyan-500 focus:border-cyan-400 p-2 text-sm font-mono outline-none flex-1 min-w-[140px] shadow-[0_0_10px_rgba(0,255,255,0.05)] transition hover:shadow-[0_0_15px_rgba(0,255,255,0.2)]"
            >
              <option>All Makes</option>
              {["Acura", "Audi", "BMW", "Cadillac", "Genesis", "Infiniti", "Jeep", "Land Rover", "Lexus", "Li Auto", "Lucid", "Mazda", "Mercedes-Benz", "Polestar", "Porsche", "Rivian", "Tesla", "Toyota", "Volkswagen", "Volvo", "Zeekr"].map(b => (
                  <option key={b} value={b}>{b}</option>
              ))}
            </select>
            
            <select 
                value={damage} 
                onChange={(e) => { setDamage(e.target.value); applyFilters(undefined, e.target.value, undefined, undefined); }}
                className="bg-black text-fuchsia-400 border border-fuchsia-900/50 hover:border-fuchsia-500 focus:border-fuchsia-400 p-2 text-sm font-mono outline-none flex-1 min-w-[170px] shadow-[0_0_10px_rgba(255,0,127,0.05)] transition hover:shadow-[0_0_15px_rgba(255,0,127,0.2)]"
            >
              <option>All Damage Types</option>
              {["Collision damage", "Engine damage", "Fire damage", "Water damage", "Theft damage", "Hail damage", "Storm damage", "Mechanical damage"].map(d => (
                  <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select 
                value={fuel} 
                onChange={(e) => { setFuel(e.target.value); applyFilters(undefined, undefined, e.target.value, undefined); }}
                className="bg-black text-green-400 border border-green-900/50 hover:border-green-500 focus:border-green-400 p-2 text-sm font-mono outline-none flex-1 min-w-[140px] shadow-[0_0_10px_rgba(0,255,0,0.05)] transition hover:shadow-[0_0_15px_rgba(0,255,0,0.2)]"
            >
              <option>All Fuel Types</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>

            <div className="flex flex-[2] min-w-[200px] relative group">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters(undefined, undefined, undefined, query)}
                  placeholder="Query database... [e.g. 2024]" 
                  className="bg-black text-white border border-cyan-800/50 hover:border-cyan-500 focus:border-cyan-400 p-2 text-sm font-mono outline-none w-full shadow-[inset_0_0_10px_rgba(0,255,255,0.05)] transition placeholder-gray-600 group-hover:shadow-[inset_0_0_15px_rgba(0,255,255,0.2)]"
                />
                <button 
                    onClick={() => applyFilters(undefined, undefined, undefined, query)}
                    className="absolute right-0 top-0 h-full px-4 bg-cyan-900/20 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-900/50 font-bold border-l border-cyan-800/50 transition flex items-center justify-center font-mono"
                >
                    SEARCH_
                </button>
            </div>
         </div>

      </div>
    </header>
  );
}
