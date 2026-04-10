import { LogIn, Menu, Zap, User } from "lucide-react";
import { useAppSelector } from "../../app/hooks";
import { Link } from "react-router-dom";
import { THEME_CLASSES } from "../../utils/themeUtils";

import type { RootState } from "../../app/store";


interface NavbarProps {
  onMenuClick?: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user } = useAppSelector((state: RootState) => state.auth);

  return (
    <header className={`h-16 flex items-center justify-between px-6 border-b transition-all duration-300 sticky top-0 z-40 backdrop-blur-md ${THEME_CLASSES.surface.navbar} ${THEME_CLASSES.border.base}`}>
      <div className="flex items-center gap-6">
        <button
          onClick={onMenuClick}
          className={`md:hidden p-2 rounded-xl transition-all cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95`}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <Link to="/" className="flex items-center gap-3 group transition-transform hover:scale-[1.02]">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
            <Zap size={16} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight leading-none text-gray-900 dark:text-white">
              Smart Todo
            </span>
            <span className="text-[9px] font-medium uppercase tracking-wider opacity-40">1 · 4 · 7 Productivity</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          <Link 
            to="/today" 
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${THEME_CLASSES.text.secondary}`}
          >
            Focus
          </Link>
        </nav>
      </div>


      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-full border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-semibold uppercase tracking-widest opacity-60">Synced</span>
        </div>

        {user ? (
          <div className="flex items-center gap-3 pl-2">
            <Link 
              to="/profile" 
              className="flex items-center gap-3 group transition-all"
            >
              <div className="flex flex-col items-end hidden md:flex">
                  <span className={`text-xs font-semibold leading-none group-hover:text-blue-500 transition-colors ${THEME_CLASSES.text.primary}`}>{user.displayName?.split(' ')[0] || user.email?.split('@')[0]}</span>
                  <span className={`text-[10px] font-medium opacity-50 ${THEME_CLASSES.text.tertiary}`}>My Account</span>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden group-hover:border-blue-500 transition-colors">
                  <User size={16} className="opacity-60" />
              </div>
            </Link>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <LogIn size={16} />
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;