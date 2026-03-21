"use client";
import React from 'react';

interface TransferSectionProps {
  carPrice: number;
  originalUrl: string;
}

const TransferSection = ({ carPrice, originalUrl }: TransferSectionProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 lg:p-8 bg-black/40 border-y border-white/5 backdrop-blur-md relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent pointer-events-none"></div>
        <div className="flex flex-col z-10 shrink-0">
            <span className="text-gray-500 font-mono text-[10px] font-bold tracking-[0.3em] uppercase mb-1">ACQUISITION_VALUE</span>
            <div className="flex items-baseline gap-2">
              <span className="font-orbitron text-2xl md:text-3xl text-orange-600/80 font-bold">€</span>
              <span className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-black text-[#ff8c00] drop-shadow-[0_0_20px_rgba(255,140,0,0.8)] leading-tight transition-transform group-hover:scale-105 duration-500">
                  {carPrice.toLocaleString('de-DE')}
              </span>
            </div>
        </div>
        <div className="z-10 flex-shrink-0 w-full sm:w-auto">
            <a 
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-pink-600 hover:bg-pink-500 text-white font-orbitron font-black uppercase tracking-widest text-sm md:text-base lg:text-lg transition duration-300 shadow-[0_0_30px_rgba(255,0,127,0.5)] border-2 border-pink-400 group-hover:shadow-[0_0_50px_rgba(255,0,127,0.8)] active:scale-95 text-center flex items-center justify-center min-w-[180px] no-underline"
            >
                INITIATE_TRANSFER
            </a>
        </div>
    </div>
  );
};

export default TransferSection;
