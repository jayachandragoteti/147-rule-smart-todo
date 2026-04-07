import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ListTodo,
  Clock,
  CheckCircle2,
  RefreshCw,
  CalendarCheck,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import TodoCard from "../components/todos/TodoCard";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchTodos } from "../features/todos/todoThunks";
import { isTodayDate } from "../utils/dateUtils";
import { THEME_CLASSES } from "../utils/themeUtils";

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { todos, loading } = useAppSelector((state) => state.todo);
  const isAuthChecked = useAppSelector((state) => state.auth.isAuthChecked);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (isAuthChecked && user) {
      dispatch(fetchTodos());
    }
  }, [isAuthChecked, user, dispatch]);

  const stats = useMemo(() => {
    return todos.reduce(
      (acc, t) => {
        acc.total++;
        if (t.status === "pending") acc.pending++;
        if (t.status === "completed") acc.completed++;
        if (t.status === "inprogress") acc.inProgress++;
        if (t.apply147Rule) acc.with147++;

        const isToday =
          t.seriesDates && t.seriesDates.length > 0
            ? t.seriesDates.some((d) => isTodayDate(d))
            : isTodayDate(t.scheduledDate);

        if (isToday) acc.todayCount++;

        return acc;
      },
      {
        total: 0,
        pending: 0,
        completed: 0,
        inProgress: 0,
        with147: 0,
        todayCount: 0,
      } as {
        total: number;
        pending: number;
        completed: number;
        inProgress: number;
        with147: number;
        todayCount: number;
      }
    );
  }, [todos]);

  const todayTodos = useMemo(
    () =>
      todos
        .filter((todo) => {
          if (todo.seriesDates && todo.seriesDates.length > 0) {
            return todo.seriesDates.some((d: string) => isTodayDate(d));
          }
          return isTodayDate(todo.scheduledDate);
        })
        .slice(0, 3),
    [todos]
  );

  const recentTodos = useMemo(
    () => todos.filter((t) => t.status !== "completed").slice(0, 5),
    [todos]
  );

  const statCards = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: ListTodo,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "147 Rule Active",
      value: stats.with147,
      icon: RefreshCw,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2
            className={`text-2xl font-semibold tracking-tight ${THEME_CLASSES.text.primary}`}
          >
            Dashboard
          </h2>
          <p className={`text-sm mt-1 ${THEME_CLASSES.text.secondary}`}>
            Overview of your tasks and learning progress
          </p>
        </div>
        <Link
          to="/create-todo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <PlusCircle size={16} />
          New Task
        </Link>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-xl p-5 border animate-pulse ${THEME_CLASSES.surface.card}`}
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className={`rounded-xl p-5 border transition-all duration-300 hover:shadow-md ${THEME_CLASSES.surface.card}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-medium uppercase tracking-wider ${THEME_CLASSES.text.secondary}`}
                >
                  {label}
                </span>
                <div className={`p-2 rounded-lg ${bg}`}>
                  <Icon size={16} className={color} />
                </div>
              </div>
              <p
                className={`text-3xl font-bold ${THEME_CLASSES.text.primary}`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Today's Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarCheck size={18} className="text-blue-500" />
            <h3
              className={`text-lg font-semibold ${THEME_CLASSES.text.primary}`}
            >
              Today's Tasks
            </h3>
            {stats.todayCount > 0 && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                {stats.todayCount}
              </span>
            )}
          </div>
          {stats.todayCount > 3 && (
            <Link
              to="/today"
              className={`text-sm flex items-center gap-1 ${THEME_CLASSES.text.link}`}
            >
              View all <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {loading ? (
          <div
            className={`border rounded-xl p-8 text-center ${THEME_CLASSES.surface.card} ${THEME_CLASSES.text.tertiary}`}
          >
            Loading...
          </div>
        ) : todayTodos.length === 0 ? (
          <div
            className={`border rounded-xl p-8 text-center ${THEME_CLASSES.surface.card} ${THEME_CLASSES.text.tertiary}`}
          >
            🎉 No tasks scheduled for today. Enjoy your free time!
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {todayTodos.map((todo) => (
              <TodoCard key={todo.id} todo={todo} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Active Tasks */}
      {recentTodos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-lg font-semibold ${THEME_CLASSES.text.primary}`}
            >
              Active Tasks
            </h3>
            <Link
              to="/todos"
              className={`text-sm flex items-center gap-1 ${THEME_CLASSES.text.link}`}
            >
              See all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentTodos.map((todo) => (
              <TodoCard key={todo.id} todo={todo} />
            ))}
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default Dashboard;