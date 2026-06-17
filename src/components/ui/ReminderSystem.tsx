import { useEffect, useState, useRef, useCallback } from "react";
import { useAppSelector, useAppDispatch, useToast } from "../../app/hooks";
import { isTodayDate } from "../../utils/dateUtils";
import { Bell, Clock, CheckCircle2, X } from "lucide-react";
import { THEME_CLASSES } from "../../utils/themeUtils";
import type { Todo } from "../../types/todo";
import { completeTodo } from "../../features/todos/todoThunks";
import { playNotificationSound, resumeAudioContext } from "../../utils/soundEngine";
import type { NotificationSound } from "../../types/todo";

const SNOOZE_MINUTES = 10;

const ReminderSystem = () => {
  const { todos }      = useAppSelector((state) => state.todo);
  const { soundEnabled } = useAppSelector((state) => state.ui);
  const dispatch = useAppDispatch();
  const toast    = useToast();

  const [activeReminders, setActiveReminders] = useState<Todo[]>([]);
  const [snoozed,         setSnoozed]         = useState<{ [id: string]: number }>({});

  // Permission / audio — resolved AFTER async checks to avoid flicker
  const [permChecked,    setPermChecked]    = useState(false);
  const [permissionState, setPermissionState] = useState<string>("default");
  const [audioSuspended, setAudioSuspended] = useState(false);

  /** Prevent double-firing within the same minute */
  const lastCheckedMinute  = useRef<number>(-1);
  const triggeredThisMinute = useRef<Set<string>>(new Set());

  // ── Async permission + audio check on mount ──────────────────────────────
  useEffect(() => {
    const init = async () => {
      if ("Notification" in window) {
        setPermissionState(Notification.permission);
      }
      const audioOk = await resumeAudioContext();
      setAudioSuspended(!audioOk);
      setPermChecked(true);
    };
    init();
  }, []);

  // ── Re-check when window regains focus ───────────────────────────────────
  useEffect(() => {
    const onFocus = () => {
      if ("Notification" in window) setPermissionState(Notification.permission);
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // ── Permission request ──────────────────────────────────────────
  const requestPermission = useCallback(async () => {
    try {
      if ("Notification" in window) {
        const result = await Notification.requestPermission();
        setPermissionState(result);
        if (result === "denied") {
          toast.error("Notifications blocked. Please allow them in browser settings.");
          return;
        }
      }
      await resumeAudioContext();
      setAudioSuspended(false);
      // Don't fire a toast here — user will see reminders fire naturally
    } catch (err) {
      console.error("Permission request failed:", err);
      toast.error("Failed to enable alerts.");
    }
  }, [toast]);

  // ── Reminder polling ──────────────────────────────────────────────────────
  useEffect(() => {
    const checkReminders = () => {
      const now            = new Date();
      const currentMin     = now.getMinutes();
      const currentHour    = now.getHours();
      const currentTimeStr = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`;
      const nowMs          = now.getTime();

      if (lastCheckedMinute.current !== currentMin) {
        lastCheckedMinute.current     = currentMin;
        triggeredThisMinute.current   = new Set();
      }

      const triggered: Todo[] = [];

      todos.forEach((todo) => {
        if (!todo.reminderEnabled || todo.status === "completed") return;
        if (triggeredThisMinute.current.has(todo.id)) return;

        // Handle snoozed tasks
        if (snoozed[todo.id]) {
          if (nowMs >= snoozed[todo.id]) {
            triggered.push(todo);
            triggeredThisMinute.current.add(todo.id);
            setSnoozed((prev) => {
              const next = { ...prev };
              delete next[todo.id];
              return next;
            });
          }
          return;
        }

        const isForToday = todo.seriesDates?.length
          ? todo.seriesDates.some((d) => isTodayDate(d))
          : isTodayDate(todo.scheduledDate);

        if (isForToday && todo.scheduledTime === currentTimeStr) {
          triggered.push(todo);
          triggeredThisMinute.current.add(todo.id);
        }
      });

      if (triggered.length > 0) {
        setActiveReminders((prev) => {
          const existingIds  = new Set(prev.map((t) => t.id));
          const newReminders = triggered.filter((t) => !existingIds.has(t.id));

          if (newReminders.length > 0) {
            newReminders.forEach((todo) => {
              // Play per-task chosen sound
              playNotificationSound(
                (todo.notificationSound as NotificationSound) || "bell",
                soundEnabled
              );

              // OS notification — always show (tag deduplicates on the OS level)
              // Works in foreground (tab visible) AND background (tab hidden)
              if (
                "Notification" in window &&
                Notification.permission === "granted"
              ) {
                // Use SW registration if available for richer notifications
                if (navigator.serviceWorker?.controller) {
                  navigator.serviceWorker.ready.then((reg) => {
                    reg.showNotification(`⏰ ${todo.title}`, {
                      body: todo.descriptions?.[0] || "Time to work on this task!",
                      icon: "/favicon.png",
                      badge: "/favicon.png",
                      tag: `task-${todo.id}`,
                      data: { url: `/todo/${todo.id}` },
                      // Only show OS popup when tab is NOT visible
                      // When visible, the in-app card is enough
                      silent: document.visibilityState === "visible",
                    } as NotificationOptions);
                  });
                } else if (document.visibilityState !== "visible") {
                  // Fallback for no SW
                  new Notification(`⏰ ${todo.title}`, {
                    body: todo.descriptions?.[0] || "Time to work on this task!",
                    icon: "/favicon.png",
                    tag: `task-${todo.id}`,
                  } as NotificationOptions);
                }
              }
            });
          }
          return [...prev, ...newReminders];
        });
      }
    };

    const interval = setInterval(checkReminders, 10_000);
    checkReminders();
    return () => clearInterval(interval);
  }, [todos, snoozed, soundEnabled]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleDismiss = (id: string) =>
    setActiveReminders((prev) => prev.filter((t) => t.id !== id));

  const handleSnooze = (id: string) => {
    const snoozeUntil = Date.now() + SNOOZE_MINUTES * 60 * 1000;
    setSnoozed((prev) => ({ ...prev, [id]: snoozeUntil }));
    handleDismiss(id);
    toast.info(`Snoozed for ${SNOOZE_MINUTES} minutes`);
  };

  const handleCompleteTask = async (id: string) => {
    try {
      await dispatch(completeTodo(id)).unwrap();
      handleDismiss(id);
      toast.success("Task completed! 🎉");
    } catch {
      toast.error("Failed to update task");
    }
  };

  // Show banner only after async checks resolve AND only when truly needed
  const showBanner =
    permChecked &&
    (permissionState === "default" || audioSuspended) &&
    permissionState !== "denied"; // Already denied — nothing we can do from here

  return (
    <>
      {/* ── Permission / Audio banner ── */}
      {showBanner && (
        <div className="fixed top-[3.75rem] left-0 right-0 z-[60] px-4 py-2 flex justify-center pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 px-4 py-3 bg-[#f59e0b] text-white rounded-2xl shadow-2xl shadow-[#f59e0b]/20 max-w-lg w-full animate-fade-in-up">
            <div className="shrink-0 p-2 bg-white/20 rounded-xl">
              <Bell size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-none">Enable Alerts &amp; Sound</p>
              <p className="text-[10px] opacity-80 mt-0.5">Allow notifications and audio so reminders work correctly.</p>
            </div>
            <button
              onClick={requestPermission}
              className="shrink-0 px-3 py-1.5 bg-white text-[#f59e0b] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-50 active:scale-95 transition-all"
            >
              Enable
            </button>
          </div>
        </div>
      )}

      {/* ── Active reminder cards ── */}
      <div className="fixed bottom-4 left-4 z-[150] flex flex-col gap-3 max-w-[min(320px,calc(100vw-2rem))]">
        {activeReminders.map((todo) => (
          <div
            key={todo.id}
            className={`reminder-pop w-full rounded-2xl border shadow-2xl backdrop-blur-md overflow-hidden ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}
          >
            {/* Accent stripe */}
            <div className="h-1 bg-gradient-to-r from-[#f59e0b] to-[#4f8cff]" />

            <div className="p-4 space-y-3">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center">
                    <Bell size={14} className="text-[#f59e0b]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#f59e0b]">
                    Reminder
                  </span>
                </div>
                <button
                  onClick={() => handleDismiss(todo.id)}
                  aria-label="Dismiss reminder"
                  className={`p-1.5 rounded-lg transition-all ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.tertiary} hover:text-red-500`}
                >
                  <X size={13} />
                </button>
              </div>

              {/* Task title */}
              <h3 className={`font-bold text-sm leading-snug ${THEME_CLASSES.text.primary}`}>
                {todo.title}
              </h3>

              {/* Time + category */}
              <div className={`flex items-center gap-3 text-[10px] font-semibold ${THEME_CLASSES.text.tertiary}`}>
                {todo.scheduledTime && (
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> {todo.scheduledTime}
                  </span>
                )}
                {todo.category && (
                  <span className="px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/5">
                    {todo.category}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className={`flex items-center gap-2 pt-2 border-t ${THEME_CLASSES.border.base}`}>
                <button
                  onClick={() => handleSnooze(todo.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.secondary}`}
                >
                  ⏱ {SNOOZE_MINUTES}m
                </button>
                <button
                  onClick={() => handleCompleteTask(todo.id)}
                  className="flex-[2] flex items-center justify-center gap-1.5 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl text-xs font-semibold shadow-[0_0_12px_rgba(34,197,94,0.2)] transition-all active:scale-95"
                >
                  <CheckCircle2 size={12} /> Done
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ReminderSystem;
