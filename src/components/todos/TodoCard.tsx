import { Link } from "react-router-dom";
import { THEME_CLASSES } from "../../utils/themeUtils";
import type { Todo, TodoRecurrence } from "../../types/todo";
import { get137Label } from "../../utils/rule137";
import { formatDate } from "../../utils/dateUtils";
import { ExternalLink, CheckCircle, Clock, Link as LinkIcon, AlertCircle, RefreshCcw } from "lucide-react";
import { useAppDispatch, useToast } from "../../app/hooks";
import { completeTodo } from "../../features/todos/todoThunks";
import { openIFrame } from "../../features/ui/uiSlice";

interface Props {
  todo: Todo;
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  inprogress: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

const priorityStyles: Record<string, string> = {
  low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  medium: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  high: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
  urgent: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
};

const recurrenceStyles: Record<TodoRecurrence, string> = {
  none: "hidden",
  daily: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
  weekly: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
  monthly: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
};

const TodoCard = ({ todo }: Props) => {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const seriesLabel =
    todo.seriesDates && todo.seriesDates.length > 0
      ? get137Label(todo.seriesDates, todo.scheduledDate)
      : null;

  const handleQuickComplete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await dispatch(completeTodo(todo.id)).unwrap();
      toast.success("Done!");
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleOpenLink = (e: React.MouseEvent, url: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(openIFrame({ url, title }));
  };

  const isCompleted = todo.status === "completed";

  return (
    <div
      className={`group rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md border ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base} ${todo.status === "completed" ? "opacity-60 grayscale-[0.5]" : ""}`}
    >
      {todo.posterImage && (
        <div className="relative h-32 overflow-hidden">
          <img
            src={todo.posterImage}
            alt={todo.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
             <span className="text-white text-[10px] font-bold">Click to view details</span>
          </div>
        </div>
      )}

      <div className="p-4 space-y-2">
        {/* Category & Priority */}
        <div className="flex justify-between items-center">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 ${THEME_CLASSES.text.tertiary}`}>
            {todo.category || "General"}
          </span>
          <div className="flex items-center gap-2">
            {todo.recurrence !== "none" && (
                <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${recurrenceStyles[todo.recurrence]}`}>
                    <RefreshCcw size={10} /> {todo.recurrence}
                </span>
            )}
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${priorityStyles[todo.priority] || priorityStyles.medium}`}>
                {todo.priority || "medium"}
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold text-base line-clamp-1 ${THEME_CLASSES.text.primary}`}>
              {todo.title}
            </h3>
            {todo.reminderEnabled && (
                <AlertCircle size={14} className="text-amber-500" />
            )}
          </div>
          {seriesLabel && (
            <span className="inline-block text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
              Spaced Repetition: {seriesLabel}
            </span>
          )}
        </div>

        {/* Description preview */}
        {todo.descriptions && todo.descriptions[0] ? (
          <p className={`text-xs line-clamp-2 leading-relaxed ${THEME_CLASSES.text.secondary}`}>
            {todo.descriptions[0]}
          </p>
        ) : (
          <div className="h-2" />
        )}

        {/* Meta row */}
        <div className={`flex flex-wrap items-center gap-3 text-[10px] ${THEME_CLASSES.text.tertiary}`}>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{formatDate(todo.scheduledDate)} {todo.scheduledTime || ""}</span>
          </div>
          {todo.subtasks && todo.subtasks.length > 0 && (
              <>
                <div className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <span className="font-bold">
                  {todo.subtasks.filter(st => st.completed).length}/{todo.subtasks.length} Subtasks
                </span>
              </>
          )}
          {todo.apply137Rule && (
              <>
                <div className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <span className="text-purple-600 font-bold">1-3-7 Rule</span>
              </>
          )}
        </div>

        {/* Links Preview */}
        {todo.links && todo.links.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {todo.links.slice(0, 2).map((link) => (
              <button
                key={link.id}
                onClick={(e) => handleOpenLink(e, link.url, link.title)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 ${THEME_CLASSES.text.link} ${THEME_CLASSES.border.base}`}
              >
                <LinkIcon size={10} />
                <span className="truncate max-w-[80px]">{link.title}</span>
              </button>
            ))}
            {todo.links.length > 2 && (
              <span className={`text-[10px] ${THEME_CLASSES.text.tertiary}`}>+{todo.links.length - 2} more</span>
            )}
          </div>
        )}

        <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
          <Link
            to={`/todo/${todo.id}`}
            className={`text-xs font-semibold flex items-center gap-1 transition-all hover:gap-2 ${THEME_CLASSES.text.link}`}
          >
            Details <ExternalLink size={12} />
          </Link>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusStyles[todo.status] ?? ""}`}>
              {todo.status.toUpperCase()}
            </span>
            {!isCompleted && (
              <button
                onClick={handleQuickComplete}
                className="p-1.5 text-gray-400 hover:text-emerald-500 transition-colors cursor-pointer rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                title="Mark as done"
              >
                <CheckCircle size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoCard;