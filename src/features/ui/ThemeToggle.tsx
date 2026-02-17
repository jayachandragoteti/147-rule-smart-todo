import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { toggleTheme } from "./uiSlice";


export default function ThemeToggle() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="px-3 py-1 rounded border"
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
