import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { removeToast } from "../../features/ui/uiSlice";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { playNotificationSound, resumeAudioContext } from "../../utils/soundEngine";

// ── Per-type configuration ────────────────────────────────────────────────────
const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    iconColor:   "text-[#22c55e]",
    bar:         "bg-[#22c55e]",
    border:      "border-[#22c55e]/20",
    bg:          "bg-[#22c55e]/8 dark:bg-[#22c55e]/10",
    glow:        "shadow-[0_4px_24px_rgba(34,197,94,0.12)]",
    sound:       "soft",
    ariaLive:    "polite" as const,
  },
  error: {
    icon: AlertCircle,
    iconColor:   "text-[#ef4444]",
    bar:         "bg-[#ef4444]",
    border:      "border-[#ef4444]/20",
    bg:          "bg-[#ef4444]/8 dark:bg-[#ef4444]/10",
    glow:        "shadow-[0_4px_24px_rgba(239,68,68,0.15)]",
    sound:       "alert",
    ariaLive:    "assertive" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconColor:   "text-[#f59e0b]",
    bar:         "bg-[#f59e0b]",
    border:      "border-[#f59e0b]/20",
    bg:          "bg-[#f59e0b]/8 dark:bg-[#f59e0b]/10",
    glow:        "shadow-[0_4px_24px_rgba(245,158,11,0.12)]",
    sound:       "bell",
    ariaLive:    "polite" as const,
  },
  info: {
    icon: Info,
    iconColor:   "text-[#4f8cff]",
    bar:         "bg-[#4f8cff]",
    border:      "border-[#4f8cff]/20",
    bg:          "bg-[#4f8cff]/8 dark:bg-[#4f8cff]/10",
    glow:        "shadow-[0_4px_24px_rgba(79,140,255,0.12)]",
    sound:       "soft",
    ariaLive:    "polite" as const,
  },
} as const;

type ToastType = keyof typeof TOAST_CONFIG;

// ── Single toast item ─────────────────────────────────────────────────────────
const ToastItem = ({
  id,
  message,
  type,
  duration = 4500,
}: {
  id: string;
  message: string;
  type: string;
  duration?: number;
}) => {
  const dispatch     = useAppDispatch();
  const soundEnabled = useAppSelector((s) => s.ui.soundEnabled);
  const timerRef     = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const cfg = TOAST_CONFIG[type as ToastType] ?? TOAST_CONFIG.info;
  const Icon = cfg.icon;

  // Auto-dismiss
  useEffect(() => {
    timerRef.current = setTimeout(() => dispatch(removeToast(id)), duration);
    return () => clearTimeout(timerRef.current);
  }, [id, duration, dispatch]);

  // Play sound once on mount (respects global mute)
  useEffect(() => {
    if (soundEnabled) {
      resumeAudioContext().then((ok) => {
        if (ok) playNotificationSound(cfg.sound as Parameters<typeof playNotificationSound>[0], true);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="alert"
      aria-live={cfg.ariaLive}
      aria-atomic="true"
      className={`
        toast-slide-in relative flex items-start gap-3 pl-4 pr-3 pt-3.5 pb-3
        rounded-2xl border backdrop-blur-md overflow-hidden
        ${cfg.bg} ${cfg.border} ${cfg.glow}
        bg-white/90 dark:bg-[#1e2230]/95
      `}
    >
      {/* Icon */}
      <div className={`shrink-0 mt-0.5 ${cfg.iconColor}`}>
        <Icon size={16} />
      </div>

      {/* Message */}
      <p className="flex-1 text-sm font-medium text-gray-800 dark:text-white leading-snug pr-1">
        {message}
      </p>

      {/* Close button */}
      <button
        onClick={() => dispatch(removeToast(id))}
        aria-label="Dismiss notification"
        className="shrink-0 mt-0.5 p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors hover:bg-black/5 dark:hover:bg-white/5"
      >
        <X size={13} />
      </button>

      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-[2px] ${cfg.bar} toast-progress opacity-60`}
        style={{ animationDuration: `${duration}ms` }}
      />
    </div>
  );
};

// ── Container ─────────────────────────────────────────────────────────────────
const ToastContainer = () => {
  const toasts = useAppSelector((state) => state.ui.toasts);
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-[4.5rem] right-3 sm:right-5 z-[200] flex flex-col gap-2 w-[calc(100vw-1.5rem)] sm:w-80 max-w-sm"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
