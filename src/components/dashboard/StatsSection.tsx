import { useMemo } from "react";
import { THEME_CLASSES } from "../../utils/themeUtils";
import { CheckCircle2, Target, Zap, Clock } from "lucide-react";
import type { Todo } from "../../types/todo";

interface Props {
  todos: Todo[];
}

const StatsSection = ({ todos }: Props) => {
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.status === "completed").length;
    const pending = total - completed;
    const highPriority = todos.filter((t) => t.priority === "high" || t.priority === "urgent").length;
    
    // Calculate weekly completion (mock or based on createdAt)
    // For now just dynamic numbers based on current data
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, pending, highPriority, completionRate };
  }, [todos]);

  const cards = [
    { label: "Completion", value: `${stats.completionRate}%`, icon: Zap, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { label: "Active Tasks", value: stats.pending, icon: Target, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "High Priority", value: stats.highPriority, icon: Clock, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div 
          key={card.label} 
          className={`p-4 rounded-2xl border transition-all hover:shadow-md ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
              <card.icon size={18} />
            </div>
          </div>
          <div className="space-y-1">
            <h4 className={`text-2xl font-black ${THEME_CLASSES.text.primary}`}>{card.value}</h4>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>{card.label}</p>
          </div>
          
          {/* Sparkline decoration */}
          <div className="mt-4 h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
             <div 
               className={`h-full rounded-full ${card.color.replace('text-', 'bg-')}`} 
               style={{ width: card.label === 'Completion' ? `${stats.completionRate}%` : '60%' }} 
             />
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsSection;
