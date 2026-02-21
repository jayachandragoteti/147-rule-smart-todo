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
    <header className="h-14 flex items-center justify-between px-6 bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-[#1f2937] transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#1f2937] transition cursor-pointer"
        >
          <Menu size={20} />
        </button>

        <h1 className="text-lg font-semibold">Smart Todo</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#1f2937] transition cursor-pointer"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <button
            onClick={() => dispatch(logoutThunk())}
            className="flex items-center gap-1 text-sm px-3 py-1 rounded-md border border-gray-300 dark:border-[#1f2937] hover:bg-gray-100 dark:hover:bg-[#1f2937] transition cursor-pointer"
          >
            <LogOut size={16} />
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1 text-sm px-3 py-1 rounded-md border border-gray-300 dark:border-[#1f2937] hover:bg-gray-100 dark:hover:bg-[#1f2937] transition cursor-pointer"
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