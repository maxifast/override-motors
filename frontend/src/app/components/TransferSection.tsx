"use client";
import React, { useState } from 'react';

const TransferSection = ({ carPrice }: { carPrice: number }) => {
  const [isTransferring, setIsTransferring] = useState(false);
  const [step, setStep] = useState(0); // 0: Idle, 1: Scanning, 2: Form, 3: Success

  const initiateProcess = () => {
    setIsTransferring(true);
    setStep(1);
    // Auto progress from scan to form after 2.5 seconds
    setTimeout(() => setStep(2), 2500);
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  return (
    <>
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
              <button 
                onClick={initiateProcess}
                className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-pink-600 hover:bg-pink-500 text-white font-orbitron font-black uppercase tracking-widest text-sm md:text-base lg:text-lg transition duration-300 shadow-[0_0_30px_rgba(255,0,127,0.5)] border-2 border-pink-400 group-hover:shadow-[0_0_50px_rgba(255,0,127,0.8)] active:scale-95 text-center flex items-center justify-center min-w-[180px]">
                  INITIATE_TRANSFER
              </button>
          </div>
      </div>

      {isTransferring && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsTransferring(false)}></div>
            
            {/* Modal */}
            <div className="relative w-full max-w-xl bg-[#0a0a0f] border-2 border-cyan-500/50 p-8 shadow-[0_0_50px_rgba(0,255,255,0.2)] overflow-hidden">
                {/* Decorative scanning line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_cyan] animate-[scan_3s_linear_infinite] opacity-70"></div>
                
                {step === 1 && (
                  <div className="flex flex-col items-center py-12 relative">
                     <div className="w-24 h-24 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin mb-8 shadow-[0_0_20px_rgba(0,255,255,0.3)]"></div>
                     <h2 className="font-orbitron text-2xl font-black text-cyan-400 tracking-[0.3em] animate-pulse relative">
                        AUTHORIZING_LINK
                        <span className="absolute -inset-1 bg-cyan-500/10 blur-sm animate-pulse"></span>
                     </h2>
                     <div className="mt-6 flex flex-col items-center gap-1">
                        <p className="font-mono text-[9px] text-cyan-800 tracking-[0.2em] uppercase animate-pulse">ESTABLISHING_SECURE_PROTOCOLS</p>
                        <p className="font-mono text-[8px] text-gray-700 tracking-[0.1em] uppercase">LINKING_TO_EU_WEST_NODE_MAIN_GRID</p>
                     </div>
                  </div>
                )}

                {step === 2 && (
                  <form onSubmit={submitForm} className="relative z-10">
                     <div className="flex items-center gap-3 mb-8">
                        <div className="w-2 h-8 bg-pink-500 shadow-[0_0_10px_#ec4899]"></div>
                        <div>
                          <h2 className="font-orbitron text-2xl font-black text-white tracking-wider uppercase">TRANSFER_REQUEST</h2>
                          <p className="font-mono text-[8px] text-gray-500 tracking-[0.2em]">NODE_ID: OVERRIDE_MAIN_VAULT</p>
                        </div>
                        <button type="button" onClick={() => setIsTransferring(false)} className="ml-auto text-gray-600 hover:text-white transition">✕</button>
                     </div>
                     
                     <div className="space-y-6">
                        <div>
                           <label className="block font-mono text-[10px] text-cyan-600 font-bold tracking-widest uppercase mb-2">OPERATOR_IDENTIFIER (NAME)</label>
                           <input required type="text" className="w-full bg-black/50 border border-cyan-900/50 focus:border-cyan-400 p-4 text-white font-mono text-sm outline-none transition-colors shadow-inner" placeholder="IDENTIFY YOURSELF..." />
                        </div>
                        <div>
                           <label className="block font-mono text-[10px] text-cyan-600 font-bold tracking-widest uppercase mb-2">COMMUNICATION_BAND (EMAIL/PHONE)</label>
                           <input required type="text" className="w-full bg-black/50 border border-cyan-900/50 focus:border-cyan-400 p-4 text-white font-mono text-sm outline-none transition-colors shadow-inner" placeholder="PAGER_OR_NODE_ADDRESS..." />
                        </div>
                        <div className="pt-4">
                           <button type="submit" className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-orbitron font-black uppercase tracking-[0.3em] transition shadow-[0_0_30px_rgba(0,255,255,0.3)] border-2 border-cyan-400 active:scale-95">
                              SEND_ENCRYPTED_MESSAGE
                           </button>
                        </div>
                     </div>
                  </form>
                )}

                {step === 3 && (
                   <div className="text-center py-10">
                      <div className="text-6xl mb-6 drop-shadow-[0_0_20px_#22c55e]">✔️</div>
                      <h2 className="font-orbitron text-3xl font-black text-green-500 tracking-widest mb-4">TRANSFER_INITIALIZED</h2>
                      <p className="font-mono text-xs text-gray-400 mb-10 px-6 uppercase leading-relaxed tracking-wider">
                        YOUR ACQUISITION REQUEST HAS BEEN ENCRYPTED AND SENT TO THE SALVAGE DISPATCH TEAM. STAND BY FOR DIRECT NEURAL COMMS.
                      </p>
                      <button onClick={() => setIsTransferring(false)} className="px-10 py-4 bg-gray-900/50 hover:bg-cyan-900/40 border border-gray-700 hover:border-cyan-500 text-gray-400 hover:text-cyan-400 font-mono text-[10px] font-bold tracking-widest uppercase transition duration-500">
                         TERMINATE_SESSION_AND_RETURN
                      </button>
                   </div>
                )}
            </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(400px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default TransferSection;
