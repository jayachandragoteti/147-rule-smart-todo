import { Link } from "react-router-dom";
import { THEME_CLASSES } from "../../utils/themeUtils";
import type { Todo } from "../../types/todo";

interface Props {
  todo: Todo;
}

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  inprogress: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

const TodoCard = ({ todo }: Props) => {
  return (
    <div className={`rounded-xl overflow-hidden transition-colors duration-300 hover:shadow-md ${THEME_CLASSES.surface.card}`}>

      {todo.posterImage && (
        <img
          src={todo.posterImage}
          alt={todo.title}
          className="w-full h-40 object-cover"
        />
      )}

      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">
              {todo.title}
            </h3>
            {todo.seriesDates && todo.seriesDates.length > 0 && (() => {
              const idx = todo.seriesDates.findIndex(d => new Date(d).toISOString() === new Date(todo.scheduledDate).toISOString());
              const label = idx === 0 ? "Orig" : (idx > 0 ? `Day ${[4,7][idx-1] || idx}` : "Series");
              return (
                <span className="text-[10px] px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-md">
                  {label}
                </span>
              );
            })()}
          </div>

          <span className={`text-xs px-2 py-1 rounded-md ${statusStyles[todo.status]}`}>
            {todo.status}
          </span>
        </div>

        <p className={`text-xs line-clamp-2 ${THEME_CLASSES.text.tertiary}`}>
          {todo.descriptions[0]}
        </p>

        <div className={`flex justify-between items-center text-xs ${THEME_CLASSES.text.tertiary}`}>
          <span>{todo.actionType}</span>

          {todo.apply147Rule && (
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-md">
              147 Rule
            </span>
          )}
        </div>

        <Link
          to={`/todo/${todo.id}`}
          className={`text-xs hover:underline cursor-pointer ${THEME_CLASSES.text.link}`}
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default TodoCard;