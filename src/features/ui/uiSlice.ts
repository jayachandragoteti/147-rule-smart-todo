import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark";
export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface IFrameState {
  isOpen: boolean;
  url: string;
  title: string;
  isMinimized: boolean;
}

interface UiState {
  theme: ThemeMode;
  toasts: Toast[];
  soundEnabled: boolean;
  iframe: IFrameState;
}

/** Read persisted settings from localStorage */
const getInitialTheme = (): ThemeMode => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    if (window.matchMedia?.("(prefers-color-scheme: light)").matches) {
      return "light";
    }
  }
  return "dark";
};

const getInitialSound = (): boolean => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("soundEnabled");
    return saved !== "false"; // Default to true
  }
  return true;
};

const initialState: UiState = {
  theme: getInitialTheme(),
  toasts: [],
  soundEnabled: getInitialSound(),
  iframe: {
    isOpen: false,
    url: "",
    title: "",
    isMinimized: false,
  },
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
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
      localStorage.setItem("soundEnabled", state.soundEnabled.toString());
    },
    addToast: (state, action: PayloadAction<Omit<Toast, "id">>) => {
      const id = Date.now().toString();
      state.toasts.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    openIFrame: (state, action: PayloadAction<{ url: string; title: string }>) => {
      state.iframe.url = action.payload.url;
      state.iframe.title = action.payload.title;
      state.iframe.isOpen = true;
      state.iframe.isMinimized = false;
    },
    closeIFrame: (state) => {
      state.iframe.isOpen = false;
    },
    toggleIFrameMinimize: (state) => {
      state.iframe.isMinimized = !state.iframe.isMinimized;
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  toggleSound,
  addToast,
  removeToast,
  openIFrame,
  closeIFrame,
  toggleIFrameMinimize,
} = uiSlice.actions;
export default uiSlice.reducer;

