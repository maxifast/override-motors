import Header from '../../components/Header';

async function getCar(id: string) {
  // Simulating fetch from Express Backend
  return {
    id,
    title: 'Porsche 911 GT3 RS',
    price: 185000,
    year: 2023,
    mileage: 4500,
    fuel_type: 'Petrol',
    damage_description_en: 'Heavy front collision damage. Airbags deployed. Engine intact but radiators crushed. Structural integrity compromised at front right chassis rail.',
    original_url: 'https://schadeautos.nl/',
    images: [] // Placeholder
  };
}

export default async function CarProductPage({ params }: { params: { id: string } }) {
  const car = await getCar(params.id);

  return (
    <main className="min-h-screen bg-black text-white font-sans">
      <Header />
      
      <div className="max-w-6xl mx-auto p-4 sm:p-8 mt-6">
        <div className="border border-cyan-500/50 rounded-xl bg-gray-900/80 shadow-[0_0_30px_rgba(0,255,255,0.1)] overflow-hidden">
          <div className="p-8 border-b border-gray-800 flex justify-between items-end">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{car.title}</h1>
              <p className="text-gray-400 font-mono tracking-widest">VIN: WPOZZZ***</p>
            </div>
            <p className="text-orange-500 text-3xl font-bold shadow-orange w-max">€ {car.price.toLocaleString()}</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
            <div className="lg:col-span-3 bg-gray-950 flex flex-col">
               <div className="h-96 w-full relative">
                 {car.images?.length > 0 ? (
                    <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 border-r border-gray-800">
                        <span className="text-4xl mb-2">⌕</span>
                        <span className="tracking-widest uppercase">Visual Data Missing</span>
                    </div>
                  )}
               </div>
            </div>
            
            <div className="lg:col-span-2 p-8 flex flex-col gap-8 bg-gray-900/40">
              <div className="space-y-4">
                <h3 className="text-pink-500 font-bold text-sm flex items-center gap-2 uppercase tracking-widest">
                  <span className="w-2 h-2 bg-pink-500 rounded-full animate-ping"></span> 
                  Vehicle Specs
                </h3>
                <ul className="space-y-4 text-gray-300 font-mono text-sm">
                  <li className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-500">YEAR</span> <span className="text-cyan-400 font-bold">{car.year}</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-500">MILEAGE</span> <span className="text-cyan-400 font-bold">{car.mileage.toLocaleString()} km</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-500">POWERTRAIN</span> <span className="text-cyan-400 font-bold">{car.fuel_type}</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                 <h3 className="text-pink-500 font-bold text-sm uppercase tracking-widest">Damage Profile Report</h3>
                 <p className="text-gray-400 leading-relaxed text-sm bg-black/40 p-4 rounded border border-gray-800 font-mono">
                  {car.damage_description_en}
                 </p>
              </div>
              
              <a 
                href={car.original_url} 
                target="_blank" 
                rel="noreferrer"
                className="mt-auto block w-full text-center bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-4 rounded transition uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,255,0.3)]"
              >
                Acquire Asset
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
