"use client";
import { useState } from 'react';

export default function CarGallery({ images, title }: { images: string[], title: string }) {
  const [mainImage, setMainImage] = useState(images && images.length > 0 ? images[0] : null);

  if (!images || images.length === 0) {
    return (
      <div className="border border-cyan-500/40 p-1 bg-gray-900 relative shadow-[0_0_20px_rgba(0,255,255,0.1)] group overflow-hidden">
          <div className="w-full h-80 flex items-center justify-center border border-dashed border-gray-700 text-gray-500">
              IMAGE STREAM OFFLINE
          </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Hero Viewer */}
      <div className="border border-cyan-500/40 p-1 bg-gray-900 relative shadow-[0_0_20px_rgba(0,255,255,0.1)] group overflow-hidden h-[300px] md:h-[450px]">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 opacity-60 shadow-[0_0_8px_#0ff] z-10 hidden group-hover:block translate-y-full hover:animate-[scan_2s_linear_infinite]"></div>
          
          <img 
            src={mainImage!} 
            className="w-full h-full object-cover opacity-90 transition duration-500 hover:scale-105" 
            alt={title} 
          />
      </div>

      {/* Thumbnails Carousel */}
      <div className="grid grid-cols-4 md:grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {images.map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => setMainImage(img)}
                className={`border transition-colors cursor-pointer overflow-hidden ${mainImage === img ? 'border-pink-500 opacity-100 shadow-[0_0_10px_rgba(255,0,127,0.5)]' : 'border-gray-800 opacity-60 hover:opacity-100 hover:border-cyan-500'}`}
              >
                  <img src={img} className="w-full h-20 object-cover" alt={`Detail view ${idx + 1}`} />
              </div>
          ))}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #0891b2;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background-color: #111827;
        }
      `}</style>
    </div>
  );
}
