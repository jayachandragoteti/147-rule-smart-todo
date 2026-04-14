import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Target,
  ArrowRight,
  Calendar,
  Bell,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import NotesWidget from "../components/dashboard/NotesWidget";
import HeartspaceWidget from "../components/dashboard/HeartspaceWidget";
import LearningWidget from "../components/dashboard/LearningWidget";
import { useAppDispatch, useAppSelector, useToast } from "../app/hooks";
import { fetchTodos, updateTodo, completeTodo, toggleSubtaskStatus } from "../features/todos/todoThunks";
import { fetchNotes } from "../features/notes/notesSlice";
import { fetchJournalEntries } from "../features/journal/journalSlice";
import { THEME_CLASSES } from "../utils/themeUtils";
import { isTodayDate, isFutureDate } from "../utils/dateUtils";
import type { Todo, TodoStatus } from "../types/todo";
import { isAfter } from "date-fns";
import {
  selectTaskStats,
  selectTodayTasks,
} from "../features/todos/todoSelectors";

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

  // Stats
  const stats = useAppSelector(selectTaskStats);

  // Today's tasks (show all)
  const todayTasks = useAppSelector(selectTodayTasks);
  const todayTodos = todayTasks;

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

  // 1-3-7 learning tasks due today (show all)
  const learningDueToday = useMemo(() =>
    todos.filter((t) => {
      if (!t.apply137Rule) return false;
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
        const todoToUpdate = todos.find(t => t.id === id);
        const resetSubtasks = todoToUpdate?.subtasks?.map(st => ({ ...st, completed: false })) || [];
        await dispatch(updateTodo({ id, updates: { status: "pending" as TodoStatus, subtasks: resetSubtasks } })).unwrap();
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

  const handleToggleSubtask = async (todoId: string, subtaskId: string) => {
    try {
      await dispatch(toggleSubtaskStatus({ todoId, subtaskId })).unwrap();
    } catch {
      toast.error("Failed to update subtask");
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
    
    const isDone = todo.status === "completed" || 
                  (todo.seriesDates?.length ? isFutureDate(todo.scheduledDate) : false) ||
                  (todo.recurrence !== "none" ? isFutureDate(todo.scheduledDate) : false);

    if (isDone) {
      return <CheckCircle2 size={16} className="text-emerald-500" />;
    }

    switch (todo.status) {
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
        {/* Greeting Header */}
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-widest opacity-40 ${THEME_CLASSES.text.tertiary}`}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
              <h1 className={`text-2xl font-black tracking-tight leading-tight ${THEME_CLASSES.text.primary}`}>
                {(() => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; })()},{" "}
                <span className="text-blue-500">{user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "there"}</span> 👋
              </h1>
            </div>
            <span className={`text-2xl font-black tabular-nums ${THEME_CLASSES.text.primary}`}>{stats.progressPercent}%</span>
          </div>
          {/* Today's Progress Bar */}
          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
          <p className={`text-[10px] font-medium opacity-40 ${THEME_CLASSES.text.tertiary}`}>
            {stats.completedToday} of {stats.todayTotal} tasks done today
          </p>
        </div>

        {/* Quick Task Capture — compact single row */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <Plus size={16} />
          </div>
          <div className="relative flex-1 group">
            <input
              type="text"
              placeholder="Capture a task quickly…"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
              className={`w-full bg-transparent border-none p-0 focus:ring-0 text-sm placeholder:opacity-30 ${THEME_CLASSES.text.primary}`}
            />
            <div className="absolute bottom-0 left-0 w-0 h-px bg-blue-500 transition-all duration-300 group-focus-within:w-full" />
          </div>
          <button
            onClick={handleQuickAdd}
            disabled={!quickTitle.trim()}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs transition-all active:scale-95 shadow-md shadow-blue-500/20 shrink-0"
          >
            Add
          </button>
        </div>

        {/* Main Grid — Today's Tasks + Notifications (Todo) */}
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
                  <div key={todo.id} className="flex flex-col border-b last:border-b-0 border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <div className="px-5 py-4 flex items-center gap-4 group">
                      <div className="flex-shrink-0">
                        <StatusIcon todo={todo} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link to={`/todo/${todo.id}`}>
                          <p className={`text-sm font-semibold truncate group-hover:text-blue-500 transition-colors ${THEME_CLASSES.text.primary} ${(todo.status === "completed" || (todo.seriesDates?.length && isFutureDate(todo.scheduledDate))) ? "line-through opacity-40" : ""}`}>
                            {todo.title}
                          </p>
                        </Link>
                        <p className={`text-[10px] mt-0.5 ${THEME_CLASSES.text.tertiary}`}>
                          {todo.scheduledTime || "No time set"} · {todo.category}
                        </p>
                      </div>
                    </div>
                    {/* Render Subtasks */}
                    {todo.subtasks && todo.subtasks.length > 0 && (
                      <div className="pl-14 pr-5 pb-3 space-y-1">
                         {todo.subtasks.map(subtask => (
                           <div key={subtask.id} className="flex items-center gap-3">
                             <button
                               onClick={() => handleToggleSubtask(todo.id, subtask.id)}
                               className={`transition-colors flex-shrink-0 ${subtask.completed ? "text-emerald-500" : "text-gray-300 hover:text-emerald-500"}`}
                             >
                               {subtask.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                             </button>
                             <span className={`text-xs truncate ${subtask.completed ? "line-through opacity-40 " + THEME_CLASSES.text.tertiary : THEME_CLASSES.text.secondary}`}>
                               {subtask.title}
                             </span>
                           </div>
                         ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-6">
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

        {/* Task Summary */}
        <div className="grid grid-cols-2 gap-3 pb-2">
          {[
            { label: "Total Tasks", value: todos.length, icon: Target, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
            { label: "Completed", value: todos.filter(t => t.status === "completed").length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`p-4 rounded-xl border flex items-center gap-3 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
              <div className={`p-2 rounded-xl ${bg}`}><Icon size={14} className={color} /></div>
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest opacity-50 ${THEME_CLASSES.text.tertiary}`}>{label}</p>
                <p className={`text-xl font-black leading-tight ${THEME_CLASSES.text.primary}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Learning */}
        <LearningWidget learningDueToday={learningDueToday} />

        {/* Notes */}
        <NotesWidget latestNote={latestNote} />





        {/* Heartspace - Moved to Bottom Area */}
        <HeartspaceWidget latestDiaryEntry={latestDiaryEntry} />
      </div>
    </PageWrapper>
  );
};

export default Home;
