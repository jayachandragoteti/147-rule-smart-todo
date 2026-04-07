import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface UiState {
  theme: ThemeMode;
  toasts: Toast[];
}

/** Read persisted theme from localStorage, fallback to system preference, then "dark" */
const getInitialTheme = (): ThemeMode => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;

    // Respect OS preference
    if (window.matchMedia?.("(prefers-color-scheme: light)").matches) {
      return "light";
    }
  }
  return "dark";
};

const initialState: UiState = {
  theme: getInitialTheme(),
  toasts: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      state.theme = newTheme;
      localStorage.setItem("theme", newTheme);
    },
    addToast: (state, action: PayloadAction<Omit<Toast, "id">>) => {
      const id = Date.now().toString();
      state.toasts.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { setTheme, toggleTheme, addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
