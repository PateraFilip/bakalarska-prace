import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <header className="relative min-h-[60vh] flex flex-col justify-center items-center text-center px-4 pt-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -z-10"></div>
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-blue-500/30 bg-blue-900/10 text-blue-400 text-[10px] font-black uppercase tracking-widest">
          Bakalářská práce
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase leading-tight">
          Srovnání Webových <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">Technologií</span>
        </h1>
        <div className="flex flex-wrap justify-center gap-4">
          <span className="px-4 py-2 bg-gray-900 rounded-lg border border-gray-800 text-gray-400 text-xs font-mono">React</span>
          <span className="px-4 py-2 bg-gray-900 rounded-lg border border-gray-800 text-gray-400 text-xs font-mono">Vue</span>
          <span className="px-4 py-2 bg-gray-900 rounded-lg border border-gray-800 text-gray-400 text-xs font-mono">Svelte</span>
          <span className="px-4 py-2 bg-gray-900 rounded-lg border border-gray-800 text-gray-400 text-xs font-mono">Angular</span>
          <span className="px-4 py-2 bg-gray-900 rounded-lg border border-gray-800 text-gray-400 text-xs font-mono">Vanilla JS</span>
          <span className="px-4 py-2 bg-gray-900 rounded-lg border border-gray-800 text-gray-400 text-xs font-mono">HTMX</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-black text-white mb-12 uppercase tracking-widest text-center">Modelové Aplikace</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <article className="glass p-8 rounded-[40px] flex flex-col hover:border-green-500/50 transition duration-500 group">
            <h3 className="text-2xl font-bold mb-2 text-white">Todo List</h3>
            <p className="text-gray-400 leading-relaxed mb-8 flex-1 text-sm">Základní aplikace, která se zaměřuje na CRUD operace, filtrování a práci s lokálním úložištěm prohlížeče.</p>
            <div className="flex gap-3 mt-auto">
              <Link to="/info-todo" className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-center font-bold uppercase text-xs tracking-wider transition text-gray-300">O projektu</Link>
            </div>
          </article>

          <article className="glass p-8 rounded-[40px] flex flex-col hover:border-blue-500/50 transition duration-500 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-20 bg-blue-600/10 blur-3xl rounded-full -mr-10 -mt-10 transition group-hover:bg-blue-600/20"></div>
            <h3 className="text-2xl font-bold mb-2 text-white relative z-10">WatchList</h3>
            <p className="text-gray-400 leading-relaxed mb-8 flex-1 text-sm relative z-10">Full-stack aplikace obsahující autentizaci, napojení na externí TMDB API, databázi a složitější filtrování dat.</p>
            <div className="flex gap-3 mt-auto relative z-10">
              <Link to="/info-watchlist" className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-center font-bold uppercase text-xs tracking-wider transition text-gray-300">O projektu</Link>
            </div>
          </article>

          <article className="glass p-8 rounded-[40px] flex flex-col hover:border-purple-500/50 transition duration-500 group">
            <h3 className="text-2xl font-bold mb-2 text-white">Game of Life</h3>
            <p className="text-gray-400 leading-relaxed mb-8 flex-1 text-sm">Algoritmická simulace (Conwayův celulární automat). Slouží jako zátěžový test pro rychlost překreslování DOMu.</p>
            <div className="flex gap-3 mt-auto">
              <Link to="/info-game" className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-center font-bold uppercase text-xs tracking-wider transition text-gray-300">O projektu</Link>
            </div>
          </article>
        </div>
      </main>
    </>
  );
}