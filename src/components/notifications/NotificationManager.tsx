import { useEffect, useRef } from "react";
import { useAppSelector, useToast } from "../../app/hooks";
import { isTodayDate } from "../../utils/dateUtils";

// Plays a pleasant 2-tone "ding-dong" chime using the Web Audio API
const playNotificationSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const audioCtx = new AudioContext();
        
        const playTone = (frequency: number, startTime: number, duration: number) => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, startTime);

            // Soft attack and decay
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        };

        const now = audioCtx.currentTime;
        // Two soft notes forming a major third interval
        playTone(659.25, now, 0.4); // E5
        playTone(830.61, now + 0.15, 0.6); // G#5
        
    } catch (e) {
        console.error("Audio Context playback failed", e);
    }
};

const NotificationManager = () => {
  const todos = useAppSelector(state => state.todo.todos);
  const user = useAppSelector(state => state.auth.user);
  const toast = useToast();
  
  // Track tasks we've already alerted for so we don't spam
  const alertedTaskIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const checkReminders = () => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const timeString = `${currentHours}:${currentMinutes}`;
      
      const dueTasks = todos.filter(t => 
         t.status !== 'completed' && 
         t.reminderEnabled && 
         t.scheduledTime === timeString &&
         isTodayDate(t.scheduledDate) &&
         !alertedTaskIds.current.has(t.id)
      );

      if (dueTasks.length > 0) {
        playNotificationSound();
        dueTasks.forEach(task => {
            toast.info(`Reminder: ${task.title}`, 8000);
            alertedTaskIds.current.add(task.id);
        });
      }
    };

    // Check immediately and then every 10 seconds to ensure we don't miss the minute mark
    checkReminders();
    const interval = setInterval(checkReminders, 10000);
    
    return () => clearInterval(interval);
  }, [todos, user, toast]);

  return null;
};

export default NotificationManager;
