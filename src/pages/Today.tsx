import PageWrapper from "../components/layout/PageWrapper";
import TodoCard from "../components/todos/TodoCard";
import type { Todo } from "../types/todo";

const todayTodos: Todo[] = [];

const Today = () => {
  return (
    <PageWrapper>
      <h2 className="text-2xl font-semibold tracking-tight">
        Today's Tasks
      </h2>

      {todayTodos.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f2937] rounded-xl p-8 text-center text-gray-500 dark:text-gray-400">
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