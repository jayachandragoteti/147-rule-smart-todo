import { Link } from "react-router-dom";
import { RefreshCw, ChevronRight } from "lucide-react";
import { THEME_CLASSES } from "../../utils/themeUtils";
import type { Todo } from "../../types/todo";
import { get137Label } from "../../utils/rule137";

interface Props {
  learningDueToday: Todo[];
}

const LearningWidget = ({ learningDueToday }: Props) => {
  return (
    <div className="space-y-6">
       <div className={`border rounded-2xl shadow-sm ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
         <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
           <div className="flex items-center gap-2">
             <RefreshCw size={16} className="text-purple-500" />
             <h3 className="font-bold text-sm">Learning Intervals</h3>
           </div>
           <Link to="/learning" className="text-[10px] font-bold text-purple-600 flex items-center gap-1">
              All <ChevronRight size={10} />
           </Link>
         </div>
         <div className="p-4 space-y-3">
            {learningDueToday.length === 0 ? (
              <p className="text-xs text-center py-4 opacity-50">No learning tasks due</p>
            ) : (
              learningDueToday.map(todo => (
                <Link key={todo.id} to={`/todo/${todo.id}`} className={`block p-3 rounded-xl border ${THEME_CLASSES.surface.secondary} ${THEME_CLASSES.border.base} hover:border-purple-300 transition-colors ${todo.status === "completed" ? "opacity-40" : ""}`}>
                  <p className={`text-xs font-bold truncate ${todo.status === "completed" ? "line-through" : ""}`}>{todo.title}</p>
                  {todo.seriesDates && (
                    <p className={`text-[9px] font-black mt-1 uppercase tracking-tighter ${todo.status === "completed" ? "text-gray-400" : "text-purple-500"}`}>
                      {get137Label(todo.seriesDates, todo.scheduledDate)}
                    </p>
                  )}
                </Link>
              ))
            )}
         </div>
       </div>
    </div>
  );
};

export default LearningWidget;
