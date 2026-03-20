export default function Header() {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-900 border-b border-cyan-500">
      <div className="text-xl font-bold text-pink-500 tracking-wider">OVERRIDE MOTORS</div>
      <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
        <select className="bg-black text-cyan-400 border border-cyan-500 p-2 rounded outline-none w-full md:w-auto">
          <option>All Makes</option>
          <option>Porsche</option>
          <option>Audi</option>
          <option>BMW</option>
          <option>Mercedes-Benz</option>
        </select>
        <select className="bg-black text-cyan-400 border border-cyan-500 p-2 rounded outline-none w-full md:w-auto">
          <option>All Damage Types</option>
          <option>Collision</option>
          <option>Water / Flood</option>
          <option>Fire</option>
        </select>
        <input 
          type="text" 
          placeholder="Search inventory..." 
          className="bg-black text-white border border-cyan-500 p-2 rounded outline-none w-full md:w-auto"
        />
      </div>
    </header>
  );
}
