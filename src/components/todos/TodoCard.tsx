import { Link } from "react-router-dom";
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
    <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f2937] rounded-xl overflow-hidden transition-colors duration-300 hover:shadow-md">

      {todo.posterImage && (
        <img
          src={todo.posterImage}
          alt={todo.title}
          className="w-full h-40 object-cover"
        />
      )}

      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-sm">
            {todo.title}
          </h3>

          <span className={`text-xs px-2 py-1 rounded-md ${statusStyles[todo.status]}`}>
            {todo.status}
          </span>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
          {todo.descriptions[0]}
        </p>

        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <span>{todo.actionType}</span>

          {todo.apply147Rule && (
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-md">
              147 Rule
            </span>
          )}
        </div>

        <Link
          to={`/todo/${todo.id}`}
          className="text-blue-600 dark:text-blue-400 text-xs hover:underline cursor-pointer"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default TodoCard;