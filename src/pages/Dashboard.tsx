import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ListTodo,
  CheckCircle2,
  RefreshCw,
  CalendarCheck,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Zap,
  Target
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
        if (t.recurrence && t.recurrence !== "none") acc.recurring++;

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
        recurring: 0,
      } as {
        total: number;
        pending: number;
        completed: number;
        inProgress: number;
        with147: number;
        todayCount: number;
        recurring: number;
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
    () => todos.filter((t) => t.status !== "completed").slice(0, 3),
    [todos]
  );

  const statCards = [
    {
      label: "Total Productivity",
      value: stats.total,
      icon: Target,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Today's Focus",
      value: stats.todayCount,
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      label: "Recurring",
      value: stats.recurring,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "1-4-7 Rule",
      value: stats.with147,
      icon: RefreshCw,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h2 className={`text-3xl font-bold tracking-tight ${THEME_CLASSES.text.primary}`}>
            Welcome back, {user?.displayName?.split(' ')[0] || 'Achiever'}
          </h2>
          <p className={`text-base mt-1 ${THEME_CLASSES.text.secondary}`}>
            Your productivity engine is running. Let's conquer the day.
          </p>
        </div>
        <Link
          to="/create-todo"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-sm font-bold"
        >
          <PlusCircle size={18} />
          New Breakthrough
        </Link>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-3xl p-6 border animate-pulse ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className={`rounded-3xl p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>
                  {label}
                </span>
                <div className={`p-2.5 rounded-xl ${bg}`}>
                  <Icon size={20} className={color} />
                </div>
              </div>
              <p className={`text-4xl font-black ${THEME_CLASSES.text.primary}`}>
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Today's Tasks Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-xl">
                 <CalendarCheck size={20} className="text-white" />
              </div>
              <h3 className={`text-xl font-bold ${THEME_CLASSES.text.primary}`}>
                Today's Priority
              </h3>
              {stats.todayCount > 0 && (
                <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full">
                  {stats.todayCount}
                </span>
              )}
            </div>
            {stats.todayCount > 3 && (
              <Link to="/today" className={`text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all ${THEME_CLASSES.text.link}`}>
                Entire list <ArrowRight size={16} />
              </Link>
            )}
          </div>

          {loading ? (
            <div className={`border rounded-3xl p-10 text-center ${THEME_CLASSES.surface.card} ${THEME_CLASSES.text.tertiary}`}> Loading progress... </div>
          ) : todayTodos.length === 0 ? (
            <div className={`border-2 border-dashed rounded-3xl p-12 text-center flex flex-col items-center gap-4 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <CheckCircle2 size={32} className="text-gray-400" />
              </div>
              <div>
                  <p className={`font-bold ${THEME_CLASSES.text.primary}`}>Everything is under control</p>
                  <p className={`text-sm ${THEME_CLASSES.text.tertiary}`}>No specific tasks for today. Start something new!</p>
              </div>
              <Link to="/create-todo" className={`mt-2 text-sm font-bold px-5 py-2 rounded-xl bg-blue-600 text-white`}> + Add Task </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {todayTodos.map((todo) => (
                <TodoCard key={todo.id} todo={todo} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Active Tasks */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-xl">
                 <ListTodo size={20} className="text-white" />
              </div>
              <h3 className={`text-xl font-bold ${THEME_CLASSES.text.primary}`}>
                Active Pipeline
              </h3>
            </div>
            <Link to="/todos" className={`text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all ${THEME_CLASSES.text.link}`}>
              All missions <ArrowRight size={16} />
            </Link>
          </div>
          
          {loading ? (
              <div className={`border rounded-3xl p-10 text-center ${THEME_CLASSES.surface.card} ${THEME_CLASSES.text.tertiary}`}> Analyzing pipeline... </div>
          ) : recentTodos.length === 0 ? (
              <div className={`border-2 border-dashed rounded-3xl p-12 text-center text-sm ${THEME_CLASSES.surface.card} ${THEME_CLASSES.text.tertiary} ${THEME_CLASSES.border.base}`}>
                  Pipeline is clear.
              </div>
          ) : (
            <div className="grid gap-4">
              {recentTodos.map((todo) => (
                <TodoCard key={todo.id} todo={todo} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;