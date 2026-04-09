import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../app/hooks";
import { toggleTheme } from "../features/ui/uiSlice";

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      // Ctrl/Cmd + Shift + N to create new task
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        navigate("/create-todo");
      }

      // Ctrl/Cmd + / to toggle theme
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        dispatch(toggleTheme());
      }
      
      // Ctrl/Cmd + H to go dashboard
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        navigate("/");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, dispatch]);
};
