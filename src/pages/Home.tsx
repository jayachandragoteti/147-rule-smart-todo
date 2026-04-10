import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  BookOpen,
  StickyNote,
  Bell,
  Zap,
  Target,
  TrendingUp,
  ArrowRight,
  Calendar,
  ExternalLink,
  ChevronRight,
  Star,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import { useAppDispatch, useAppSelector, useToast } from "../app/hooks";
import { fetchTodos, updateTodo, completeTodo } from "../features/todos/todoThunks";
import { fetchNotes } from "../features/notes/notesSlice";
import { fetchJournalEntries } from "../features/journal/journalSlice";
import { THEME_CLASSES } from "../utils/themeUtils";
import { isTodayDate } from "../utils/dateUtils";
import { openIFrame } from "../features/ui/uiSlice";
import type { TodoStatus, Todo } from "../types/todo";
import { format, isAfter } from "date-fns";
import { get147Label } from "../utils/rule147";
import StatsSection from "../components/dashboard/StatsSection";

const Home = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const todos = useAppSelector((state) => state.todo.todos);
  const loading = useAppSelector((state) => state.todo.loading);
  const notes = useAppSelector((state) => state.notes.notes);
  const journal = useAppSelector((state) => state.journal.entries);
  const user = useAppSelector((state) => state.auth.user);
  const isAuthChecked = useAppSelector((state) => state.auth.isAuthChecked);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [quickTitle, setQuickTitle] = useState("");

  useEffect(() => {
    if (isAuthChecked && user) {
      dispatch(fetchTodos());
      dispatch(fetchNotes());
      dispatch(fetchJournalEntries(user.uid));
    }
  }, [isAuthChecked, user, dispatch]);

  // Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  // Stats
  const stats = useMemo(() => {
    const todayTasks = todos.filter((t) => {
      if (t.seriesDates?.length) return t.seriesDates.some((d) => isTodayDate(d));
      return isTodayDate(t.scheduledDate);
    });
    const completedToday = todayTasks.filter((t) => t.status === "completed").length;
    const pendingToday = todayTasks.filter((t) => t.status !== "completed").length;
    const learningTasks = todos.filter((t) => t.apply147Rule && t.status !== "completed").length;
    const progressPercent = todayTasks.length > 0
      ? Math.round((completedToday / todayTasks.length) * 100)
      : 0;
    return { todayTotal: todayTasks.length, completedToday, pendingToday, learningTasks, progressPercent };
  }, [todos]);

  // Today's tasks (limit 5)
  const todayTodos = useMemo(() =>
    todos.filter((t) => {
      if (t.seriesDates?.length) return t.seriesDates.some((d) => isTodayDate(d));
      return isTodayDate(t.scheduledDate);
    }).slice(0, 5),
    [todos]
  );

  // Upcoming reminders
  const upcomingReminders = useMemo(() => {
    const now = new Date();
    return todos
      .filter((t) => {
        if (t.status === "completed" || !t.reminderEnabled || !t.scheduledTime) return false;
        if (!isTodayDate(t.scheduledDate)) return false;
        const [h, m] = t.scheduledTime.split(":").map(Number);
        const taskTime = new Date();
        taskTime.setHours(h, m, 0);
        return isAfter(taskTime, now);
      })
      .sort((a, b) => (a.scheduledTime ?? "").localeCompare(b.scheduledTime ?? ""))
      .slice(0, 3);
  }, [todos]);

  // 1-4-7 learning tasks due today
  const learningDueToday = useMemo(() =>
    todos.filter((t) => {
      if (!t.apply147Rule || t.status === "completed") return false;
      if (!t.seriesDates?.length) return isTodayDate(t.scheduledDate);
      return t.seriesDates.some((d) => isTodayDate(d));
    }).slice(0, 3),
    [todos]
  );

  const latestDiaryEntry = useMemo(() =>
    journal.length > 0 ? journal[0] : null,
    [journal]
  );

  const latestNote = useMemo(() =>
    notes.find((n) => n.isPinned) || notes[0] || null,
    [notes]
  );

  const handleToggleComplete = async (id: string, currentStatus: string) => {
    setUpdatingId(id);
    try {
      if (currentStatus === "completed") {
        await dispatch(updateTodo({ id, updates: { status: "pending" as any } })).unwrap();
        toast.success("Task reopened");
      } else {
        await dispatch(completeTodo(id)).unwrap();
        toast.success("Task updated");
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleQuickAdd = () => {
    if (quickTitle.trim()) {
      navigate(`/create-todo?title=${encodeURIComponent(quickTitle.trim())}`);
    }
  };

  const StatusIcon = ({ todo }: { todo: Todo }) => {
    if (updatingId === todo.id) {
      return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    }
    switch (todo.status) {
      case "completed":
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case "inprogress":
        return <Clock size={16} className="text-amber-500" />;
      default:
        return (
          <button
            onClick={() => handleToggleComplete(todo.id, todo.status)}
            className="text-gray-300 hover:text-emerald-500 transition-colors"
            title="Mark complete"
          >
            <Circle size={16} />
          </button>
        );
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-8 pb-12">
        {/* Statistics Grid */}
        <StatsSection todos={todos} />

        {/* Quick Capture & Today's Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 p-6 rounded-2xl border flex flex-col md:flex-row items-center gap-4 transition-all hover:shadow-lg ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
             <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
                <Plus size={24} />
             </div>
             <div className="flex-1 w-full space-y-1">
                <h3 className={`text-sm font-bold ${THEME_CLASSES.text.primary}`}>Quick Task Capture</h3>
                <div className="relative group">
                  <input 
                    type="text"
                    placeholder="What needs to be done?"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
                    className={`w-full bg-transparent border-none p-0 focus:ring-0 text-lg placeholder:opacity-30 ${THEME_CLASSES.text.primary}`}
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-focus-within:w-full" />
                </div>
             </div>
             <button 
               onClick={handleQuickAdd}
               disabled={!quickTitle.trim()}
               className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-blue-500/20"
             >
               Add Task
             </button>
          </div>

          <div className={`p-6 rounded-2xl border flex flex-col justify-center gap-3 ${THEME_CLASSES.surface.secondary} ${THEME_CLASSES.border.base}`}>
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
              <span className={THEME_CLASSES.text.tertiary}>Daily Completion</span>
              <span className={THEME_CLASSES.text.primary}>{stats.progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                 style={{ width: `${stats.progressPercent}%` }}
               />
            </div>
            <p className={`text-[10px] italic ${THEME_CLASSES.text.tertiary}`}>
              {stats.progressPercent >= 100 ? "Amazing work today! 👏" : "Keep going, you're doing great!"}
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Tasks */}
          <div className={`lg:col-span-2 border rounded-2xl shadow-sm overflow-hidden ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${THEME_CLASSES.border.base}`}>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" />
                <h2 className={`font-bold ${THEME_CLASSES.text.primary}`}>Today's Tasks</h2>
              </div>
              <Link to="/today" className={`text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all ${THEME_CLASSES.text.link}`}>
                View all <ArrowRight size={12} />
              </Link>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <div className="p-10 text-center opacity-50">Loading assignments...</div>
              ) : todayTodos.length === 0 ? (
                <div className="px-5 py-10 text-center space-y-3 opacity-50">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
                  <p className="text-sm font-medium">All clear for today!</p>
                </div>
              ) : (
                todayTodos.map((todo) => (
                  <div key={todo.id} className="px-5 py-4 flex items-center gap-4 group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <div className="flex-shrink-0">
                      <StatusIcon todo={todo} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/todo/${todo.id}`}>
                        <p className={`text-sm font-semibold truncate group-hover:text-blue-500 transition-colors ${THEME_CLASSES.text.primary} ${todo.status === "completed" ? "line-through opacity-40" : ""}`}>
                          {todo.title}
                        </p>
                      </Link>
                      <p className={`text-[10px] mt-0.5 ${THEME_CLASSES.text.tertiary}`}>
                        {todo.scheduledTime || "No time set"} · {todo.category}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
             <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Tasks", value: todos.length, icon: Target, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
                { label: "Completed", value: todos.filter(t => t.status === "completed").length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className={`p-4 rounded-xl border ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>{label}</span>
                    <div className={`p-1.5 rounded-lg ${bg}`}><Icon size={12} className={color} /></div>
                  </div>
                  <p className={`text-xl font-black ${THEME_CLASSES.text.primary}`}>{value}</p>
                </div>
              ))}
            </div>

            {upcomingReminders.length > 0 && (
              <div className={`border rounded-2xl shadow-sm overflow-hidden ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
                <div className={`flex items-center gap-2 px-4 py-3 border-b ${THEME_CLASSES.border.base}`}>
                  <Bell size={14} className="text-amber-500" />
                  <h3 className={`font-bold text-sm ${THEME_CLASSES.text.primary}`}>Notifications</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {upcomingReminders.map((todo) => (
                    <div key={todo.id} className="px-4 py-3">
                      <p className={`text-xs font-semibold truncate ${THEME_CLASSES.text.primary}`}>{todo.title}</p>
                      <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">{todo.scheduledTime}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {/* 1-4-7 Learning */}
           <div className={`border rounded-2xl shadow-sm ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
             <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
               <div className="flex items-center gap-2">
                 <RefreshCw size={16} className="text-purple-500" />
                 <h3 className="font-bold text-sm">Learning Intervals</h3>
               </div>
               <Link to="/todos" className="text-[10px] font-bold text-purple-600 flex items-center gap-1">All <ChevronRight size={10} /></Link>
             </div>
             <div className="p-4 space-y-3">
                {learningDueToday.length === 0 ? (
                  <p className="text-xs text-center py-4 opacity-50">No learning tasks due</p>
                ) : (
                  learningDueToday.map(todo => (
                    <Link key={todo.id} to={`/todo/${todo.id}`} className={`block p-3 rounded-xl border ${THEME_CLASSES.surface.secondary} ${THEME_CLASSES.border.base} hover:border-purple-300 transition-colors`}>
                      <p className="text-xs font-bold truncate">{todo.title}</p>
                      {todo.seriesDates && <p className="text-[9px] font-black text-purple-500 mt-1 uppercase tracking-tighter">{get147Label(todo.seriesDates, todo.scheduledDate)}</p>}
                    </Link>
                  ))
                )}
             </div>
           </div>

           {/* Heartspace */}
           <div className={`border rounded-2xl shadow-sm ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
             <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
               <div className="flex items-center gap-2">
                 <BookOpen size={16} className="text-rose-500" />
                 <h3 className="font-bold text-sm">Heartspace</h3>
               </div>
               <Link to="/heartspace" className="text-[10px] font-bold text-rose-600 flex items-center gap-1">Open <ChevronRight size={10} /></Link>
             </div>
             <div className="p-5">
               {latestDiaryEntry ? (
                 <div className="space-y-2">
                    <p className="text-[10px] font-bold opacity-40">{format(new Date(latestDiaryEntry.date), "MMMM d")}</p>
                    <p className="text-sm font-bold truncate">{latestDiaryEntry.title}</p>
                    <p className="text-xs line-clamp-2 opacity-60 leading-relaxed">{latestDiaryEntry.content}</p>
                 </div>
               ) : <p className="text-xs text-center py-4 opacity-50">Your sanctuary is quiet.</p>}
             </div>
           </div>

           {/* Notes */}
           <div className={`border rounded-2xl shadow-sm ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
             <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
               <div className="flex items-center gap-2">
                 <StickyNote size={16} className="text-amber-500" />
                 <h3 className="font-bold text-sm">Notes</h3>
               </div>
               <Link to="/notes" className="text-[10px] font-bold text-amber-600 flex items-center gap-1">All <ChevronRight size={10} /></Link>
             </div>
             <div className="p-5">
               {latestNote ? (
                 <div className="space-y-2">
                    <p className="text-sm font-bold truncate">{latestNote.title}</p>
                    <p className="text-xs line-clamp-2 opacity-60 leading-relaxed">{latestNote.content}</p>
                 </div>
               ) : <p className="text-xs text-center py-4 opacity-50">No notes captured.</p>}
             </div>
           </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Home;
