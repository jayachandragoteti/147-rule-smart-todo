import { useEffect, useState, useRef } from "react";
import { useAppSelector, useAppDispatch, useToast } from "../../app/hooks";
import { isTodayDate } from "../../utils/dateUtils";
import { Bell, Clock, CheckCircle2, X } from "lucide-react";
import { THEME_CLASSES } from "../../utils/themeUtils";
import type { Todo } from "../../types/todo";
import { updateTodo } from "../../features/todos/todoThunks";
import { TODO_STATUS } from "../../utils/todoConstants";

const ReminderSystem = () => {
  const { todos } = useAppSelector((state) => state.todo);
  const { soundEnabled } = useAppSelector((state) => state.ui);
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [activeReminders, setActiveReminders] = useState<Todo[]>([]);
  const [snoozed, setSnoozed] = useState<{ [id: string]: number }>({});
  
  const lastCheckedMinute = useRef<number>(-1);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Play sound function using web audio api
  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new window.AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      oscillator.frequency.exponentialRampToValueAtTime(880.00, audioCtx.currentTime + 0.1); // A5

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio not supported or blocked");
    }
  };

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentMin = now.getMinutes();
      
      // Prevent double triggering in the same minute
      if (lastCheckedMinute.current === currentMin) return;
      
      const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const nowTimeMs = now.getTime();

      const triggered: Todo[] = [];

      todos.forEach(todo => {
        if (!todo.reminderEnabled || todo.status === "completed") return;

        // Check if snoozed timer is up
        if (snoozed[todo.id]) {
          if (nowTimeMs >= snoozed[todo.id]) {
            triggered.push(todo);
            // remove from snoozed
            setSnoozed(prev => {
              const next = { ...prev };
              delete next[todo.id];
              return next;
            });
          }
          return; // Skip normal time check if currently snoozed
        }

        // Normal schedule check
        let isForToday = false;
        if (todo.seriesDates && todo.seriesDates.length > 0) {
           isForToday = todo.seriesDates.some(d => isTodayDate(d));
        } else {
           isForToday = isTodayDate(todo.scheduledDate);
        }

        if (isForToday && todo.scheduledTime === currentTimeStr) {
           triggered.push(todo);
        }
      });

      if (triggered.length > 0) {
        lastCheckedMinute.current = currentMin;
        setActiveReminders(prev => {
          // Avoid duplicates in active display
          const existingIds = new Set(prev.map(t => t.id));
          const newReminders = triggered.filter(t => !existingIds.has(t.id));
          if (newReminders.length > 0) {
             playAlertSound();
             newReminders.forEach(todo => {
                if ("Notification" in window && Notification.permission === "granted" && document.visibilityState !== "visible") {
                  new Notification(`Reminder: ${todo.title}`, {
                    body: todo.descriptions?.[0] || 'It is time for your task.'
                  });
                }
             });
          }
          return [...prev, ...newReminders];
        });
      }
    };

    // Run interval
    const interval = setInterval(checkReminders, 10000); // verify every 10 sec
    checkReminders(); // check immediately on mount

    return () => clearInterval(interval);
  }, [todos, snoozed, soundEnabled]);

  const handleDismiss = (id: string) => {
    setActiveReminders(prev => prev.filter(t => t.id !== id));
  };

  const handleSnooze = (id: string) => {
    // Snooze for 10 minutes
    const snoozeTime = Date.now() + 10 * 60 * 1000;
    setSnoozed(prev => ({ ...prev, [id]: snoozeTime }));
    handleDismiss(id);
    toast.info("Reminder snoozed for 10 minutes");
  };

  const handleCompleteTask = async (id: string) => {
    try {
      await dispatch(updateTodo({ id, updates: { status: TODO_STATUS.COMPLETED } })).unwrap();
      handleDismiss(id);
      toast.success("Task completed!");
    } catch {
      toast.error("Failed to complete task");
    }
  };

  if (activeReminders.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-3">
      {activeReminders.map(todo => (
         <div key={todo.id} className="w-80 p-5 rounded-2xl shadow-2xl border border-amber-500/30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-start mb-3">
               <div className="flex items-center gap-2 text-amber-500">
                  <Bell size={18} className="animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest">Reminding</span>
               </div>
               <button onClick={() => handleDismiss(todo.id)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <X size={16} />
               </button>
            </div>
            
            <h3 className={`font-bold text-lg leading-tight mb-2 ${THEME_CLASSES.text.primary}`}>
                {todo.title}
            </h3>
            
            {todo.descriptions && todo.descriptions[0] && (
                <p className={`text-xs line-clamp-2 mb-4 ${THEME_CLASSES.text.secondary}`}>
                    {todo.descriptions[0]}
                </p>
            )}

            <div className="flex items-center gap-2 mt-4 pt-4 border-t dark:border-gray-800">
                <button 
                  onClick={() => handleSnooze(todo.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.primary}`}
                >
                    <Clock size={14} /> Snooze
                </button>
                <button 
                  onClick={() => handleCompleteTask(todo.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                >
                    <CheckCircle2 size={14} /> Complete
                </button>
            </div>
         </div>
      ))}
    </div>
  );
};

export default ReminderSystem;
