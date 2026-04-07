import { useEffect, useMemo } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import TodoCard from "../components/todos/TodoCard";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchTodos } from "../features/todos/todoThunks";
import { isTodayDate } from "../utils/dateUtils";
import { THEME_CLASSES } from "../utils/themeUtils";
import { CalendarCheck } from "lucide-react";

const Today = () => {
  const dispatch = useAppDispatch();
  const allTodos = useAppSelector((state) => state.todo.todos);
  const loading = useAppSelector((state) => state.todo.loading);
  const error = useAppSelector((state) => state.todo.error);
  const isAuthChecked = useAppSelector((state) => state.auth.isAuthChecked);

  useEffect(() => {
    if (isAuthChecked) {
      dispatch(fetchTodos());
    }
  }, [isAuthChecked, dispatch]);

  const todayTodos = useMemo(
    () =>
      allTodos.filter((todo) => {
        if (todo.seriesDates && todo.seriesDates.length > 0) {
          return todo.seriesDates.some((d) => isTodayDate(d));
        }
        return isTodayDate(todo.scheduledDate);
      }),
    [allTodos]
  );

  const completedCount = todayTodos.filter(
    (t) => t.status === "completed"
  ).length;

  return (
    <PageWrapper>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarCheck size={24} className="text-blue-500" />
          <div>
            <h2
              className={`text-2xl font-semibold tracking-tight ${THEME_CLASSES.text.primary}`}
            >
              Today's Tasks
            </h2>
            {todayTodos.length > 0 && (
              <p className={`text-sm mt-0.5 ${THEME_CLASSES.text.tertiary}`}>
                {completedCount} of {todayTodos.length} completed
              </p>
            )}
          </div>
        </div>

        {/* Date display */}
        <span className={`text-sm ${THEME_CLASSES.text.secondary}`}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-100">
          Error loading tasks: {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-xl p-4 border animate-pulse ${THEME_CLASSES.surface.card}`}
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : todayTodos.length === 0 ? (
        <div
          className={`border rounded-xl p-10 text-center ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.default}`}
        >
          <p className="text-4xl mb-3">🎉</p>
          <p className={`font-medium ${THEME_CLASSES.text.primary}`}>
            All clear for today!
          </p>
          <p className={`text-sm mt-1 ${THEME_CLASSES.text.tertiary}`}>
            No tasks scheduled. Enjoy your free time or create a new task.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {todayTodos.map((todo) => (
            <TodoCard key={todo.id} todo={todo} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default Today;