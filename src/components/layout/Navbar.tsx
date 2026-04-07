import { LogOut, LogIn, Menu } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { logoutThunk } from "../../features/auth/authThunks";
import { Link } from "react-router-dom";
import { THEME_CLASSES } from "../../utils/themeUtils";
import ThemeToggle from "../../features/ui/ThemeToggle";

interface NavbarProps {
  onMenuClick?: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <header className={`h-14 flex items-center justify-between px-6 border-b transition-colors duration-300 ${THEME_CLASSES.surface.navbar} ${THEME_CLASSES.border.default}`}>
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className={`md:hidden p-2 rounded-md transition cursor-pointer ${THEME_CLASSES.button.hover}`}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Smart Todo
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        {user ? (
          <button
            onClick={() => dispatch(logoutThunk())}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition cursor-pointer border ${THEME_CLASSES.border.default} ${THEME_CLASSES.button.hover}`}
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        ) : (
          <Link
            to="/login"
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition cursor-pointer border ${THEME_CLASSES.border.default} ${THEME_CLASSES.button.hover}`}
          >
            <LogIn size={15} />
            <span className="hidden sm:inline">Login</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;