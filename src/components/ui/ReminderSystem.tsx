import { useEffect, useState, useRef } from "react";
import { useAppSelector, useAppDispatch, useToast } from "../../app/hooks";
import { isTodayDate } from "../../utils/dateUtils";
import { Bell, Clock, CheckCircle2, X, Volume2, Sparkles, RefreshCw, Calendar } from "lucide-react";
import { suggestReschedule } from "../../services/aiService";
import { THEME_CLASSES } from "../../utils/themeUtils";
import type { Todo } from "../../types/todo";
import { updateTodo } from "../../features/todos/todoThunks";
import { TODO_STATUS } from "../../utils/todoConstants";
import { playNotificationSound } from "../../utils/soundEngine";

const ReminderSystem = () => {
  const { todos } = useAppSelector((state) => state.todo);
  const { soundEnabled } = useAppSelector((state) => state.ui);
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [activeReminders, setActiveReminders] = useState<Todo[]>([]);
  const [snoozed, setSnoozed] = useState<{ [id: string]: number }>({});
  const [aiSuggestions, setAiSuggestions] = useState<{ [id: string]: { suggestedTime: string, reason: string } }>({});
  const [isParsingReschedule, setIsParsingReschedule] = useState<{ [id: string]: boolean }>({});

  /** Prevent double-firing within the same minute */
  const lastCheckedMinute = useRef<number>(-1);
  /** Track which todos already triggered (persist across renders) */
  const triggeredThisMinute = useRef<Set<string>>(new Set());

  // Request browser notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentMin = now.getMinutes();
      const currentHour = now.getHours();
      const currentTimeStr = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`;
      const nowMs = now.getTime();

      // Reset per-minute tracking when the minute turns over
      if (lastCheckedMinute.current !== currentMin) {
        lastCheckedMinute.current = currentMin;
        triggeredThisMinute.current = new Set();
      }

      const triggered: Todo[] = [];

      todos.forEach((todo) => {
        if (!todo.reminderEnabled || todo.status === "completed") return;
        // Skip if already triggered this minute
        if (triggeredThisMinute.current.has(todo.id)) return;

        // Check if snoozed
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

        // Normal schedule check
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
            // Play each task's own sound (or 'bell' as fallback)
            newReminders.forEach((todo) => {
              playNotificationSound(todo.notificationSound ?? "bell", soundEnabled);

              // Browser notification when app is in background
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

    const interval = setInterval(checkReminders, 10_000); // check every 10s
    checkReminders(); // immediate check on mount

    return () => clearInterval(interval);
  }, [todos, snoozed, soundEnabled]);

  const handleDismiss = (id: string) => {
    setActiveReminders((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSnooze = async (todo: Todo) => {
    const id = todo.id;
    const currentSnoozeCount = todo.snoozeCount || 0;
    const newSnoozeCount = currentSnoozeCount + 1;
    
    // Update snooze count in Firestore
    dispatch(updateTodo({ id, updates: { snoozeCount: newSnoozeCount } }));

    const snoozeUntil = Date.now() + 10 * 60 * 1000; // 10 minutes
    setSnoozed((prev) => ({ ...prev, [id]: snoozeUntil }));
    handleDismiss(id);
    toast.info("Reminder snoozed for 10 minutes");

    // If snoozed 3+ times, generate AI suggestion for next time it triggers
    if (newSnoozeCount >= 3 && !aiSuggestions[id]) {
      setIsParsingReschedule(prev => ({ ...prev, [id]: true }));
      try {
        const suggestion = await suggestReschedule(todo);
        setAiSuggestions(prev => ({ ...prev, [id]: suggestion }));
      } catch (err) {
        console.error("Failed to get AI reschedule suggestion", err);
      } finally {
        setIsParsingReschedule(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  const handleApplyReschedule = async (id: string, newTime: string) => {
    try {
      await dispatch(updateTodo({ 
        id, 
        updates: { scheduledTime: newTime, snoozeCount: 0 } 
      })).unwrap();
      handleDismiss(id);
      toast.success(`Task rescheduled to ${newTime} per AI suggestion`);
    } catch {
      toast.error("Failed to reschedule task");
    }
  };

  const handleCompleteTask = async (id: string) => {
    try {
      await dispatch(updateTodo({ id, updates: { status: TODO_STATUS.COMPLETED } })).unwrap();
      handleDismiss(id);
      toast.success("Task completed! 🎉");
    } catch {
      toast.error("Failed to complete task");
    }
  };

  if (activeReminders.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-3 max-w-[calc(100vw-2rem)]">
      {activeReminders.map((todo) => (
        <div
          key={todo.id}
          className="w-80 p-5 rounded-2xl shadow-2xl border border-amber-400/30 bg-white/97 dark:bg-gray-900/97 backdrop-blur-md"
          style={{ animation: "slideInFromBottom 0.3s ease-out" }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Bell size={16} className="text-amber-500 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  Reminder
                </span>
                {/* Show which sound is assigned (subtle) */}
                {todo.notificationSound && todo.notificationSound !== "bell" && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Volume2 size={9} className="text-gray-400" />
                    <span className="text-[9px] text-gray-400 capitalize">{todo.notificationSound}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => handleDismiss(todo.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Dismiss reminder"
            >
              <X size={14} />
            </button>
          </div>

          {/* Task title */}
          <h3 className={`font-bold text-base leading-tight mb-2 ${THEME_CLASSES.text.primary}`}>
            {todo.title}
          </h3>

          {/* Description preview */}
          {todo.descriptions?.[0] && (
            <p className={`text-xs line-clamp-2 mb-4 ${THEME_CLASSES.text.secondary}`}>
              {todo.descriptions[0]}
            </p>
          )}

          {/* Scheduled time */}
          {todo.scheduledTime && (
            <div className={`flex items-center gap-1.5 mb-4 text-[10px] font-bold ${THEME_CLASSES.text.tertiary}`}>
              <Clock size={10} />
              <span>Scheduled at {todo.scheduledTime}</span>
            </div>
          )}

          {/* AI Reschedule Suggestion */}
          {aiSuggestions[todo.id] && (
            <div className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles size={12} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">AI Suggestion</span>
              </div>
              <p className="text-[10px] leading-tight text-blue-700 dark:text-blue-300 italic">{aiSuggestions[todo.id].reason}</p>
              <button
                onClick={() => handleApplyReschedule(todo.id, aiSuggestions[todo.id].suggestedTime)}
                className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold shadow-sm active:scale-95 transition-all"
              >
                <RefreshCw size={10} /> Reschedule to {aiSuggestions[todo.id].suggestedTime}
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t dark:border-gray-800">
            <button
              onClick={() => handleSnooze(todo)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.primary}`}
            >
              <Clock size={13} /> Snooze 10m
            </button>
            <button
              onClick={() => handleCompleteTask(todo.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-emerald-500/20"
            >
              <CheckCircle2 size={13} /> Done
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReminderSystem;
