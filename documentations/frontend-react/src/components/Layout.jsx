import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  const navClass = ({ isActive }) =>
    isActive
      ? "text-white border-b-2 border-blue-500 transition-colors"
      : "text-gray-400 hover:text-white transition-colors";

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest text-gray-400">
            <NavLink to="/" className={navClass}>Domů</NavLink>
            <NavLink to="/info-todo" className={navClass}>Todo</NavLink>
            <NavLink to="/info-watchlist" className={navClass}>WatchList</NavLink>
            <NavLink to="/info-game" className={navClass}>Game of Life</NavLink>
          </div>
        </div>
      </nav>

      <div className="flex-1">
        <Outlet />
      </div>

      <footer className="border-t border-gray-900 bg-black py-12 text-center mt-auto">
        <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">
          2026 Bakalářská práce - Filip Patera
        </p>
      </footer>
    </div>
  );
}