import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { toggleTheme } from "./uiSlice";
import { THEME_CLASSES } from "../../utils/themeUtils";

export default function ThemeToggle() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className={`px-3 py-1 rounded border transition-colors duration-300 ${THEME_CLASSES.border.default} ${THEME_CLASSES.button.hover}`}
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
