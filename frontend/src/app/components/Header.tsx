"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

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
    <header className="flex flex-col xl:flex-row items-center justify-between p-4 bg-gray-900 border-b border-cyan-500 gap-4">
      <Link href="/">
          <div className="text-xl font-black text-pink-500 tracking-widest uppercase hover:text-pink-400 transition cursor-pointer drop-shadow-[0_0_8px_rgba(255,0,127,0.5)]">
              OVERRIDE MOTORS
          </div>
      </Link>
      
      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
        <select 
            value={make} 
            onChange={(e) => { setMake(e.target.value); applyFilters(e.target.value, undefined, undefined, undefined); }}
            className="bg-black text-cyan-400 border border-cyan-800 focus:border-cyan-400 p-2 text-sm font-mono outline-none flex-1 min-w-[140px] shadow-[0_0_10px_rgba(0,255,255,0.1)] transition"
        >
          <option>All Makes</option>
          {["Acura", "Audi", "BMW", "Cadillac", "Genesis", "Infiniti", "Jeep", "Land Rover", "Lexus", "Li Auto", "Lucid", "Mazda", "Mercedes-Benz", "Polestar", "Porsche", "Rivian", "Tesla", "Toyota", "Volkswagen", "Volvo", "Zeekr"].map(b => (
              <option key={b} value={b}>{b}</option>
          ))}
        </select>
        
        <select 
            value={damage} 
            onChange={(e) => { setDamage(e.target.value); applyFilters(undefined, e.target.value, undefined, undefined); }}
            className="bg-black text-red-500 border border-red-900 focus:border-red-500 p-2 text-sm font-mono outline-none flex-1 min-w-[170px] shadow-[0_0_10px_rgba(255,0,0,0.1)] transition"
        >
          <option>All Damage Types</option>
          {["Collision damage", "Engine damage", "Fire damage", "Water damage", "Theft damage", "Hail damage", "Storm damage", "Mechanical damage"].map(d => (
              <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select 
            value={fuel} 
            onChange={(e) => { setFuel(e.target.value); applyFilters(undefined, undefined, e.target.value, undefined); }}
            className="bg-black text-green-400 border border-green-900 focus:border-green-500 p-2 text-sm font-mono outline-none flex-1 min-w-[140px] shadow-[0_0_10px_rgba(0,255,0,0.1)] transition"
        >
          <option>All Fuel Types</option>
          <option value="Electric">Electric</option>
          <option value="Hybrid">Hybrid</option>
        </select>

        <div className="flex flex-1 min-w-[200px] relative">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters(undefined, undefined, undefined, query)}
              placeholder="Search databases..." 
              className="bg-black text-white border border-cyan-800 focus:border-cyan-400 p-2 text-sm font-mono outline-none w-full shadow-[inset_0_0_10px_rgba(0,255,255,0.1)] transition placeholder-gray-600"
            />
            <button 
                onClick={() => applyFilters(undefined, undefined, undefined, query)}
                className="absolute right-0 top-0 h-full px-3 text-cyan-600 hover:text-cyan-300 font-bold"
            >
                [↵]
            </button>
        </div>
      </div>
    </header>
  );
}
