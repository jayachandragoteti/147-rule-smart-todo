import { Link } from "react-router-dom";
import { THEME_CLASSES } from "../../utils/themeUtils";
import type { Todo } from "../../types/todo";
import { get137Label } from "../../utils/rule137";
import { formatDate } from "../../utils/dateUtils";
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  Circle,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { useState } from "react";
import { useAppDispatch, useToast } from "../../app/hooks";
import { completeTodo, updateTodo } from "../../features/todos/todoThunks";
import type { TodoStatus } from "../../types/todo";

interface Props {
  todo: Todo;
}



const priorityLabel: Record<string, string> = {
  urgent: THEME_CLASSES.priority.urgent,
  high:   THEME_CLASSES.priority.high,
  medium: THEME_CLASSES.priority.medium,
  low:    THEME_CLASSES.priority.low,
};

const TodoCard = ({ todo }: Props) => {
  const dispatch    = useAppDispatch();
  const toast       = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const seriesLabel =
    todo.seriesDates && todo.seriesDates.length > 0
      ? get137Label(todo.seriesDates, todo.scheduledDate)
      : null;

  const isDone = todo.status === "completed";

  const handleCycle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsUpdating(true);
    try {
      if (todo.status === "pending") {
        await dispatch(updateTodo({ id: todo.id, updates: { status: "inprogress" as TodoStatus } })).unwrap();
      } else if (todo.status === "inprogress") {
        await dispatch(completeTodo(todo.id)).unwrap();
        toast.success("Done! 🎉");
      } else {
        await dispatch(updateTodo({ id: todo.id, updates: { status: "pending" as TodoStatus } })).unwrap();
      }
    } catch {
      toast.error("Failed to update task");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={`group rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md border ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base} ${
        isDone ? "opacity-55 grayscale-[0.4]" : "hover:border-[#4f8cff]/20"
      }`}
    >
      {/* Poster image */}
      {todo.posterImage && (
        <div className="relative h-28 overflow-hidden">
          <img
            src={todo.posterImage}
            alt={todo.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Top row: category + priority */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${THEME_CLASSES.status.todo} whitespace-normal break-words`}>
            {todo.category || "General"}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {todo.recurrence !== "none" && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-[#4f8cff] bg-[#4f8cff]/10 px-2 py-0.5 rounded-md whitespace-nowrap">
                <RefreshCcw size={9} /> {todo.recurrence}
              </span>
            )}
            {todo.recurrence === "weekly" && todo.weeklyDays && todo.weeklyDays.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                {todo.weeklyDays.map((day) => (
                  <span
                    key={day}
                    className="text-[10px] text-[#4f8cff] bg-[#4f8cff]/10 px-2 py-0.5 rounded-md whitespace-nowrap"
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </span>
                ))}
              </div>
            )}
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${priorityLabel[todo.priority] ?? priorityLabel.medium} whitespace-normal break-words`}>
              {todo.priority}
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-0.5">
          <h3 className={`font-semibold text-sm leading-snug line-clamp-2 ${isDone ? "line-through" : THEME_CLASSES.text.primary}`}>
            {todo.title}
          </h3>
          {seriesLabel && (
            <span className="inline-block text-[10px] font-semibold text-[#818cf8] bg-[#818cf8]/10 px-1.5 py-0.5 rounded-full">
              {seriesLabel} Revision
            </span>
          )}
        </div>

        {/* Description preview */}
        {todo.descriptions && todo.descriptions[0] && (
          <p className={`text-xs leading-relaxed line-clamp-2 ${THEME_CLASSES.text.secondary}`}>
            {todo.descriptions[0]}
          </p>
        )}

        {/* Meta */}
        <div className={`flex items-center gap-2 text-[10px] ${THEME_CLASSES.text.tertiary}`}>
          <Clock size={10} />
          <span>{formatDate(todo.scheduledDate)}</span>
          {todo.scheduledTime && <span>· {todo.scheduledTime}</span>}
          {todo.subtasks && todo.subtasks.length > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-current opacity-40" />
              <span>
                {todo.subtasks.filter((st) => st.completed).length}/{todo.subtasks.length} subtasks
              </span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className={`flex items-center justify-between pt-2 border-t ${THEME_CLASSES.border.base}`}>
          <Link
            to={`/todo/${todo.id}`}
            className={`text-xs font-medium flex items-center gap-1 transition-all hover:gap-1.5 ${THEME_CLASSES.text.link}`}
          >
            Details <ExternalLink size={10} />
          </Link>

          <button
            onClick={handleCycle}
            disabled={isUpdating}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
              isDone
                ? "bg-[#22c55e]/10 text-[#22c55e]"
                : todo.status === "inprogress"
                ? "bg-[#f59e0b]/10 text-[#f59e0b]"
                : `${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.tertiary} hover:text-[#4f8cff]`
            }`}
          >
            {isUpdating ? (
              <Loader2 size={13} className="animate-spin" />
            ) : isDone ? (
              <><CheckCircle2 size={13} /> Done</>
            ) : todo.status === "inprogress" ? (
              <><Clock size={13} /> In Progress</>
            ) : (
              <><Circle size={13} /> Start</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoCard;