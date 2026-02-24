import { useEffect } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import TodoCard from "../components/todos/TodoCard";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchTodos } from "../features/todos/todoThunks";
import { THEME_CLASSES } from "../utils/themeUtils";

const Todos = () => {
  const dispatch = useAppDispatch();
  const todos = useAppSelector((state) => state.todo.todos);
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

  return (
    <PageWrapper>
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-semibold tracking-tight ${THEME_CLASSES.text.primary}`}>
          All Tasks
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-100">
          Error loading tasks: {error}
        </div>
      )}

      {loading ? (
        <div className={`border rounded-xl p-8 text-center ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.default} ${THEME_CLASSES.text.tertiary}`}>
          Loading tasks...
        </div>
      ) : todos.length === 0 ? (
        <div className={`border rounded-xl p-8 text-center ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.default} ${THEME_CLASSES.text.tertiary}`}>
          No tasks yet. Start creating your first learning task.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {todos.map((todo) => (
            <TodoCard key={todo.id} todo={todo} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default Todos;