import { LogOut, LogIn, Menu, Zap, User } from "lucide-react";
import { useAppDispatch, useAppSelector, useToast } from "../../app/hooks";
import { logoutThunk } from "../../features/auth/authThunks";
import { Link } from "react-router-dom";
import { THEME_CLASSES } from "../../utils/themeUtils";

import type { RootState } from "../../app/store";

interface NavbarProps {
  onMenuClick?: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const dispatch = useAppDispatch();
  const toast = useToast();
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
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
            <Zap size={20} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight leading-none bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              147 SMART TODO
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">Spaced Repetition Todo</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-full border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Synced</span>
        </div>

        <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block" />


        {user ? (
          <div className="flex items-center gap-3 pl-2">
            <div className="flex flex-col items-end hidden md:flex">
                <span className={`text-xs font-bold leading-none ${THEME_CLASSES.text.primary}`}>{user.email?.split('@')[0]}</span>
                <span className={`text-[10px] font-medium opacity-50 ${THEME_CLASSES.text.tertiary}`}>Personal Account</span>
            </div>
            <div className="relative group cursor-pointer">
                <div className="w-9 h-9 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden group-hover:border-blue-500/50 transition-colors">
                    <User size={18} className="opacity-60" />
                </div>
                
                {/* Dropdown Placeholder/Action */}
                <div className="absolute top-full right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-1 group-hover:translate-y-0">
                    <div className={`p-2 rounded-2xl border shadow-2xl ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
                        <button
                            onClick={() => {
                                dispatch(logoutThunk());
                                toast.success("Successfully logged out.");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 transition-colors text-sm font-bold"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
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