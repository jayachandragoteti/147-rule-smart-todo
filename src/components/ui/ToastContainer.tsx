import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { removeToast } from "../../features/ui/uiSlice";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useEffect } from "react";

const ToastIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "success":
      return <CheckCircle className="text-emerald-500" size={18} />;
    case "error":
      return <AlertCircle className="text-red-500" size={18} />;
    case "warning":
      return <AlertTriangle className="text-amber-500" size={18} />;
    default:
      return <Info className="text-blue-500" size={18} />;
  }
};

const ToastItem = ({
  id,
  message,
  type,
  duration = 5000,
}: {
  id: string;
  message: string;
  type: string;
  duration?: number;
}) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(id));
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, dispatch]);

  const bgStyles = {
    success: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800",
    error: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
    warning: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800",
    info: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
  }[type as "success" | "error" | "warning" | "info"] || "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700";

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-in slide-in-from-right-full duration-300 ${bgStyles}`}
    >
      <ToastIcon type={type} />
      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mr-2">
        {message}
      </p>
      <button
        onClick={() => dispatch(removeToast(id))}
        className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const toasts = useAppSelector((state) => state.ui.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
