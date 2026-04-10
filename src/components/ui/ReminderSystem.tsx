import { useEffect, useState, useRef } from "react";
import { useAppSelector, useAppDispatch, useToast } from "../../app/hooks";
import { isTodayDate } from "../../utils/dateUtils";
import { Bell, Clock, CheckCircle2, X } from "lucide-react";
import { THEME_CLASSES } from "../../utils/themeUtils";
import type { Todo } from "../../types/todo";
import { updateTodo } from "../../features/todos/todoThunks";
import { TODO_STATUS } from "../../utils/todoConstants";
import { playNotificationSound, resumeAudioContext } from "../../utils/soundEngine";

const ReminderSystem = () => {
  const { todos } = useAppSelector((state) => state.todo);
  const { soundEnabled } = useAppSelector((state) => state.ui);
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [activeReminders, setActiveReminders] = useState<Todo[]>([]);
  const [snoozed, setSnoozed] = useState<{ [id: string]: number }>({});
  const [permissionState, setPermissionState] = useState<string>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [audioSuspended, setAudioSuspended] = useState(false);

  /** Prevent double-firing within the same minute */
  const lastCheckedMinute = useRef<number>(-1);
  const triggeredThisMinute = useRef<Set<string>>(new Set());

  // Check permissions and audio state on mount
  useEffect(() => {
    if ("Notification" in window) {
      setPermissionState(Notification.permission);
    }
    
    // Check if AudioContext is likely to be suspended
    const checkAudio = async () => {
      const isOk = await resumeAudioContext();
      setAudioSuspended(!isOk);
    };
    checkAudio();
  }, []);

  const requestPermission = async () => {
    try {
      // 1. Request Notification Permission
      if ("Notification" in window) {
        const result = await Notification.requestPermission();
        setPermissionState(result);
      }
      
      // 2. Resume Audio Context (Unlock Sound)
      const audioOk = await resumeAudioContext();
      setAudioSuspended(!audioOk);
      
      if (Notification.permission === "granted") {
        toast.success("Notifications and audio enabled!");
      } else {
        toast.info("Audio enabled, but notifications were blocked.");
      }
    } catch (err) {
      console.error("Permission request failed:", err);
      toast.error("Failed to enable alerts.");
    }
  };

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentMin = now.getMinutes();
      const currentHour = now.getHours();
      const currentTimeStr = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`;
      const nowMs = now.getTime();

      if (lastCheckedMinute.current !== currentMin) {
        lastCheckedMinute.current = currentMin;
        triggeredThisMinute.current = new Set();
      }

      const triggered: Todo[] = [];

      todos.forEach((todo) => {
        if (!todo.reminderEnabled || todo.status === "completed") return;
        if (triggeredThisMinute.current.has(todo.id)) return;

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
          const existingIds = new Set(prev.map((t) => t.id));
          const newReminders = triggered.filter((t) => !existingIds.has(t.id));
          
          if (newReminders.length > 0) {
            newReminders.forEach((todo) => {
              playNotificationSound(todo.notificationSound, soundEnabled);

              if (
                "Notification" in window &&
                Notification.permission === "granted" &&
                document.visibilityState !== "visible"
              ) {
                new Notification(`⏰ Reminder: ${todo.title}`, {
                  body: todo.descriptions?.[0] || "It's time for your task.",
                  icon: "/favicon.ico",
                });
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

  const handleDismiss = (id: string) => {
    setActiveReminders((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSnooze = (id: string) => {
    const snoozeUntil = Date.now() + 10 * 60 * 1000;
    setSnoozed((prev) => ({ ...prev, [id]: snoozeUntil }));
    handleDismiss(id);
    toast.info("Snoozed for 10 minutes");
  };

  const handleCompleteTask = async (id: string) => {
    try {
      await dispatch(updateTodo({ id, updates: { status: TODO_STATUS.COMPLETED } })).unwrap();
      handleDismiss(id);
      toast.success("Task completed!");
    } catch {
      toast.error("Failed to update task");
    }
  };

  return (
    <>
      {/* Permission Bar */}
      {(permissionState === "default" || audioSuspended) && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-full max-w-lg px-4">
          <div className="bg-amber-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Bell size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold">Enable Alerts & Sound</span>
                <span className="text-[10px] opacity-80">Allow notifications and audio for reminders to work correctly.</span>
              </div>
            </div>
            <button
              onClick={requestPermission}
              className="px-4 py-2 bg-white text-amber-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-50 transition-colors"
            >
              Enable
            </button>
          </div>
        </div>
      )}

      {/* Active Reminders */}
      <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-3 max-w-[calc(100vw-2rem)]">
        {activeReminders.map((todo) => (
          <div
            key={todo.id}
            className={`w-80 p-5 rounded-2xl shadow-2xl border ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base} backdrop-blur-md`}
            style={{ animation: "slideInFromBottom 0.3s ease-out" }}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Bell size={16} className="text-amber-500" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-amber-600">Reminder</span>
              </div>
              <button onClick={() => handleDismiss(todo.id)} className="p-1.5 rounded-lg opacity-40 hover:opacity-100 transition-opacity">
                <X size={14} />
              </button>
            </div>

            <h3 className={`font-bold text-base mb-2 ${THEME_CLASSES.text.primary}`}>{todo.title}</h3>
            
            <div className="flex items-center gap-2 mb-4 text-[10px] font-bold opacity-60">
              <Clock size={10} />
              <span>{todo.scheduledTime}</span>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t dark:border-gray-800">
              <button
                onClick={() => handleSnooze(todo.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border ${THEME_CLASSES.border.base} hover:bg-gray-50 dark:hover:bg-gray-800 transition-all`}
              >
                Snooze
              </button>
              <button
                onClick={() => handleCompleteTask(todo.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
              >
                <CheckCircle2 size={13} /> Done
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ReminderSystem;
