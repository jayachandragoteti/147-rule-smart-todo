import { Link } from "react-router-dom";
import { THEME_CLASSES } from "../../utils/themeUtils";
import type { Todo } from "../../types/todo";
import { get147Label, getNextSeriesDate } from "../../utils/rule147";
import { formatDate } from "../../utils/dateUtils";
import { ExternalLink, CheckCircle } from "lucide-react";
import { useAppDispatch, useToast } from "../../app/hooks";
import { updateTodo } from "../../features/todos/todoThunks";
import { TODO_STATUS } from "../../utils/todoConstants";

interface Props {
  todo: Todo;
}

const statusStyles: Record<string, string> = {
  pending:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  inprogress:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  completed:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

const TodoCard = ({ todo }: Props) => {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const seriesLabel =
    todo.seriesDates && todo.seriesDates.length > 0
      ? get147Label(todo.seriesDates, todo.scheduledDate)
      : null;

  const handleQuickComplete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (todo.seriesDates && todo.seriesDates.length > 0) {
        const nextDate = getNextSeriesDate(todo.seriesDates, todo.scheduledDate);
        if (nextDate) {
          await dispatch(
            updateTodo({
              id: todo.id,
              updates: { scheduledDate: nextDate, status: TODO_STATUS.PENDING },
            })
          ).unwrap();
          toast.success(`Advanced to ${get147Label(todo.seriesDates, nextDate)}`);
          return;
        }

        await dispatch(
          updateTodo({
            id: todo.id,
            updates: { status: TODO_STATUS.COMPLETED, apply147Rule: false },
          })
        ).unwrap();
        toast.success("Series completed!");
        return;
      }

      await dispatch(
        updateTodo({ id: todo.id, updates: { status: TODO_STATUS.COMPLETED } })
      ).unwrap();
      toast.success("Task completed!");
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  const isCompleted = todo.status === "completed";

  return (
    <div
      className={`group rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${THEME_CLASSES.surface.card}`}
    >
      {todo.posterImage && (
        <img
          src={todo.posterImage}
          alt={todo.title}
          className="w-full h-40 object-cover"
        />
      )}

      <div className="p-4 space-y-3">
        {/* Title & Series Badge */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3
              className={`font-semibold text-sm truncate ${THEME_CLASSES.text.primary}`}
            >
              {todo.title}
            </h3>
            {seriesLabel && (
              <span className="shrink-0 text-[10px] px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-md font-medium">
                {seriesLabel}
              </span>
            )}
          </div>

          <span
            className={`shrink-0 text-xs px-2 py-1 rounded-md font-medium ${statusStyles[todo.status] ?? ""}`}
          >
            {todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}
          </span>
        </div>

        {/* Description preview */}
        {todo.descriptions[0] ? (
          <p className={`text-xs line-clamp-2 ${THEME_CLASSES.text.tertiary}`}>
            {todo.descriptions[0]}
          </p>
        ) : (
          <div className="h-4" /> // placeholder for height consistency
        )}

        {/* Meta row */}
        <div
          className={`flex justify-between items-center text-xs ${THEME_CLASSES.text.tertiary}`}
        >
          <span>{formatDate(todo.scheduledDate)}</span>

          <div className="flex items-center gap-2">
            {todo.apply147Rule && (
              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-md font-medium text-[10px]">
                147 RULE
              </span>
            )}
            <span className="capitalize">{todo.actionType}</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-1">
          <Link
            to={`/todo/${todo.id}`}
            className={`inline-flex items-center gap-1 text-xs group-hover:underline ${THEME_CLASSES.text.link}`}
          >
            View Details
            <ExternalLink
              size={12}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </Link>

          {!isCompleted && (
            <button
              onClick={handleQuickComplete}
              title={todo.apply147Rule ? "Advance Series" : "Mark Complete"}
              className="p-1 text-gray-400 hover:text-emerald-500 transition-colors cursor-pointer"
            >
              <CheckCircle size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoCard;