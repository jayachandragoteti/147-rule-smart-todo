import { LogOut, LogIn, Menu } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { logoutThunk } from "../../features/auth/authThunks";
import { Link } from "react-router-dom";
import { THEME_CLASSES } from "../../utils/themeUtils";

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
        >
          <Menu size={20} />
        </button>

        <h1 className={`text-lg font-semibold ${THEME_CLASSES.text.primary}`}>Smart Todo</h1>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <button
            onClick={() => dispatch(logoutThunk())}
            className={`flex items-center gap-1 text-sm px-3 py-1 rounded-md transition cursor-pointer ${THEME_CLASSES.border.default} ${THEME_CLASSES.button.hover}`}
          >
            <LogOut size={16} />
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className={`flex items-center gap-1 text-sm px-3 py-1 rounded-md transition cursor-pointer ${THEME_CLASSES.border.default} ${THEME_CLASSES.button.hover}`}
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