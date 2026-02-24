import { useEffect } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import TodoCard from "../components/todos/TodoCard";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchTodos } from "../features/todos/todoThunks";
import { isTodayDate } from "../utils/dateUtils";
import { THEME_CLASSES } from "../utils/themeUtils";

const Today = () => {
  const dispatch = useAppDispatch();
  const allTodos = useAppSelector((state) => state.todo.todos);
  const loading = useAppSelector((state) => state.todo.loading);
  const error = useAppSelector((state) => state.todo.error);
  const isAuthChecked = useAppSelector(
    (state) => state.auth.isAuthChecked
  );

  useEffect(() => {
    if (isAuthChecked) {
      dispatch(fetchTodos());
    }
  }, [isAuthChecked, dispatch]);

  const todayTodos = allTodos.filter((todo) => {
    if (todo.seriesDates && todo.seriesDates.length > 0) {
      return todo.seriesDates.some((d) => isTodayDate(d));
    }
    return isTodayDate(todo.scheduledDate);
  });

  return (
    <PageWrapper>
      <h2 className={`text-2xl font-semibold tracking-tight mb-6 ${THEME_CLASSES.text.primary}`}>
        Today's Tasks
      </h2>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-100 mb-6">
          Error loading tasks: {error}
        </div>
      )}

      {loading ? (
        <div className={`border rounded-xl p-8 text-center ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.default} ${THEME_CLASSES.text.tertiary}`}>
          Loading tasks...
        </div>
      ) : todayTodos.length === 0 ? (
        <div className={`border rounded-xl p-8 text-center ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.default} ${THEME_CLASSES.text.tertiary}`}>
          No tasks scheduled for today.
        </div>
      ) : (
        <div className="space-y-6">
          {todayTodos.map((todo) => (
            <TodoCard key={todo.id} todo={todo} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default Today;