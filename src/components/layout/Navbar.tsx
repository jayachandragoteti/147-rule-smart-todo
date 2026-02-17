import { Moon, Sun, LogOut, LogIn, Menu } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { toggleTheme } from "../../features/ui/uiSlice";
import { logoutThunk } from "../../features/auth/authThunks";
import { Link } from "react-router-dom";

interface NavbarProps {
  onMenuClick?: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-borderColor bg-surface transition-colors duration-300">

      <div className="flex items-center gap-4">
        <button className="md:hidden" onClick={onMenuClick}>
          <Menu size={20} />
        </button>

        <h1 className="text-lg font-semibold tracking-tight">
          147RuleSmartTodo
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <button
            onClick={() => dispatch(logoutThunk())}
            className="flex items-center gap-1 text-sm px-3 py-1 rounded-md border border-borderColor hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1 text-sm px-3 py-1 rounded-md border border-borderColor hover:bg-black/5 dark:hover:bg-white/10 transition"
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
