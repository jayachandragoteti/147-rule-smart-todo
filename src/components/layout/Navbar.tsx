import { Menu, Bell, BellOff } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { Link } from "react-router-dom";
import { THEME_CLASSES } from "../../utils/themeUtils";
import { toggleSound } from "../../features/ui/uiSlice";
import type { RootState } from "../../app/store";

interface NavbarProps {
  onMenuClick?: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user }       = useAppSelector((state: RootState) => state.auth);
  const soundEnabled   = useAppSelector((state) => state.ui.soundEnabled);
  const dispatch       = useAppDispatch();

  return (
    <header
      className={`h-14 flex items-center justify-between px-4 sm:px-6 border-b sticky top-0 z-40 backdrop-blur-md ${THEME_CLASSES.surface.navbar} ${THEME_CLASSES.border.base}`}
    >
      {/* Left: Hamburger + Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className={`md:hidden p-2 rounded-xl transition-all cursor-pointer ${THEME_CLASSES.button.hover} active:scale-95`}
          aria-label="Open navigation"
        >
          <Menu size={18} className={THEME_CLASSES.text.secondary} />
        </button>

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 bg-[#4f8cff] rounded-lg flex items-center justify-center text-white shadow-[0_0_16px_rgba(79,140,255,0.35)] group-hover:shadow-[0_0_20px_rgba(79,140,255,0.5)] transition-shadow">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h3l2-5 2 10 2-5h1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className={`text-sm font-bold tracking-tight leading-none ${THEME_CLASSES.text.primary}`}>
              TodoSpace
            </span>
            <span className={`text-[9px] font-medium uppercase tracking-widest opacity-40 ${THEME_CLASSES.text.tertiary}`}>
              1 · 3 · 7 Productivity
            </span>
          </div>
        </Link>
      </div>

      {/* Right: Sound toggle + Sync + User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* ── Global sound mute toggle ── */}
        <button
          onClick={() => dispatch(toggleSound())}
          title={soundEnabled ? "Mute notification sounds" : "Unmute notification sounds"}
          aria-label={soundEnabled ? "Mute sounds" : "Unmute sounds"}
          className={`p-2 rounded-xl transition-all active:scale-90 ${THEME_CLASSES.button.hover} ${
            soundEnabled ? THEME_CLASSES.text.secondary : "text-[#ef4444]"
          }`}
        >
          {soundEnabled ? <Bell size={16} /> : <BellOff size={16} />}
        </button>

        {/* Sync pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className={`text-[10px] font-semibold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>
            Synced
          </span>
        </div>

        {user ? (
          <Link
            to="/profile"
            className="flex items-center gap-2 group transition-all"
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className={`text-xs font-semibold leading-none group-hover:text-[#4f8cff] transition-colors ${THEME_CLASSES.text.primary}`}>
                {user.displayName?.split(" ")[0] || user.email?.split("@")[0]}
              </span>
              <span className={`text-[10px] opacity-50 ${THEME_CLASSES.text.tertiary}`}>My account</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4f8cff] to-[#818cf8] flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:shadow-[0_0_12px_rgba(79,140,255,0.4)] transition-shadow">
              {(user.displayName?.charAt(0) || user.email?.charAt(0) || "U").toUpperCase()}
            </div>
          </Link>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#4f8cff] hover:bg-[#3c7cf0] shadow-[0_0_16px_rgba(79,140,255,0.3)] transition-all active:scale-95"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;