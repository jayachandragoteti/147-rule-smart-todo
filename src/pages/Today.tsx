import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import TodoCard from "../components/todos/TodoCard";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchTodos } from "../features/todos/todoThunks";
import { selectTodayTasks, selectTaskStats } from "../features/todos/todoSelectors";
import { THEME_CLASSES } from "../utils/themeUtils";
import { 
  Sparkles, 
  Target,
  Zap,
  CheckCircle2,
  AlertCircle,
  Plus
} from "lucide-react";

const Today = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.todo.loading);
  const error = useAppSelector((state) => state.todo.error);
  const isAuthChecked = useAppSelector((state) => state.auth.isAuthChecked);

  const todayTodos = useAppSelector(selectTodayTasks);
  const stats = useAppSelector(selectTaskStats);

  useEffect(() => {
    if (isAuthChecked) {
      dispatch(fetchTodos());
    }
  }, [isAuthChecked, dispatch]);

  const { completedToday: completedCount, progressPercent } = stats;

  return (
    <PageWrapper>
      <div className="space-y-10">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl ${THEME_CLASSES.brand.primary} ${THEME_CLASSES.brand.glow}`}>
                    <Zap size={24} />
                </div>
                <div className={`px-4 py-1.5 rounded-full border ${THEME_CLASSES.surface.secondary} ${THEME_CLASSES.border.base}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Focus Mode</span>
                </div>
            </div>
            
            <div className="space-y-2">
                <h2 className={`text-4xl md:text-5xl font-bold tracking-tight ${THEME_CLASSES.text.primary}`}>
                  Today's Tasks
                </h2>
                <p className={`text-lg font-medium leading-relaxed ${THEME_CLASSES.text.tertiary}`}>
                  Your focus for <span className="text-blue-500 font-bold">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>. 
                </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 min-w-[200px]">
              <div className="flex items-center gap-2">
                  <Target size={18} className="text-emerald-500" />
                  <span className={`text-sm font-black uppercase tracking-widest ${THEME_CLASSES.text.primary}`}>Progress</span>
              </div>
              <div className={`w-full h-3 rounded-full overflow-hidden border ${THEME_CLASSES.surface.secondary} ${THEME_CLASSES.border.base}`}>
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${THEME_CLASSES.brand.gradient} ${THEME_CLASSES.brand.glow}`}
                    style={{ width: `${progressPercent}%` }}
                  />
              </div>
              <div className="flex justify-between w-full text-[10px] font-black uppercase tracking-widest opacity-50">
                  <span>{completedCount} COMPLETED</span>
                  <span>{progressPercent}%</span>
              </div>
          </div>
        </div>

        {error && (
          <div className={`border rounded-3xl p-6 font-bold flex items-center gap-4 animate-shake ${THEME_CLASSES.status.danger} border-red-200 dark:border-red-900/50`}>
            <AlertCircle size={24} />
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest opacity-70">Error Loading Tasks</span>
                <span>{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-[2.5rem] p-8 border animate-pulse ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}
              >
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-xl w-3/4 mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-full mb-3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-5/6" />
              </div>
            ))}
          </div>
        ) : todayTodos.length === 0 ? (
          <div
            className={`border rounded-3xl p-16 text-center shadow-sm flex flex-col items-center justify-center space-y-6 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}
          >
            <div className="relative">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-inner ${THEME_CLASSES.status.success}`}>
                  <CheckCircle2 size={40} className="opacity-60" />
                </div>
                <div className={`absolute -top-2 -right-2 p-2 rounded-full text-white shadow-lg ${THEME_CLASSES.brand.primary}`}>
                  <Sparkles size={14} />
                </div>
            </div>
            <div className="space-y-2">
                <h3 className={`text-2xl font-bold ${THEME_CLASSES.text.primary}`}>All Caught Up!</h3>
                <p className={`text-sm font-medium max-w-sm leading-relaxed ${THEME_CLASSES.text.tertiary}`}>
                  You've completed all your tasks for today.
                </p>
            </div>
            <Link
              to="/create-todo"
              className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wide active:scale-95 transition-all ${THEME_CLASSES.button.primary}`}
            >
              <Plus size={16} /> Add New Task
            </Link>

          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {todayTodos.map((todo) => (
              <TodoCard key={todo.id} todo={todo} />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Today;