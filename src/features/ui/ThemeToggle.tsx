import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { toggleTheme } from "./uiSlice";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light Mode" : "Dark Mode"}
    >
      {theme === "dark" ? (
        <Sun size={18} className="text-amber-400" />
      ) : (
        <Moon size={18} className="text-gray-600" />
      )}
    </button>
  );
}
