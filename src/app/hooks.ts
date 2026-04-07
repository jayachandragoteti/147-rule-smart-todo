import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

import { addToast } from "../features/ui/uiSlice";
import type { ToastType } from "../features/ui/uiSlice";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useToast = () => {
  const dispatch = useAppDispatch();

  const showToast = (message: string, type: ToastType = "info", duration?: number) => {
    dispatch(addToast({ message, type, duration }));
  };

  return {
    success: (msg: string, dur?: number) => showToast(msg, "success", dur),
    error: (msg: string, dur?: number) => showToast(msg, "error", dur),
    warning: (msg: string, dur?: number) => showToast(msg, "warning", dur),
    info: (msg: string, dur?: number) => showToast(msg, "info", dur),
  };
};
