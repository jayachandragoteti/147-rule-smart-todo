import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  BookOpen,
  StickyNote,
  Brain,
  Bell,
  Zap,
  Target,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Calendar,
  ExternalLink,
  ChevronRight,
  Star,
  Mic as LucideMic,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import { useAppDispatch, useAppSelector, useToast } from "../app/hooks";
import { fetchTodos, updateTodo } from "../features/todos/todoThunks";
import { fetchNotes } from "../features/notes/notesSlice";
import { fetchJournalEntries } from "../features/journal/journalSlice";
import { THEME_CLASSES } from "../utils/themeUtils";
import { isTodayDate } from "../utils/dateUtils";
import { openIFrame } from "../features/ui/uiSlice";
import type { TodoStatus, Todo } from "../types/todo";
import { format, isAfter } from "date-fns";
import { get147Label } from "../utils/rule147";
import { parseTask, generateDailyPlan, AISuggestion } from "../services/aiService";
import { createTodo as createTodoThunk } from "../features/todos/todoThunks";

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
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

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

  // Upcoming reminders (next 3 tasks with scheduledTime, sorted by time)
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

  // Latest diary entry
  const latestDiaryEntry = useMemo(() =>
    journal.length > 0 ? journal[0] : null,
    [journal]
  );

  // Latest pinned note
  const latestNote = useMemo(() =>
    notes.find((n) => n.isPinned) || notes[0] || null,
    [notes]
  );

  const handleStatusUpdate = async (id: string, newStatus: TodoStatus) => {
    setUpdatingId(id);
    try {
      await dispatch(updateTodo({ id, updates: { status: newStatus } })).unwrap();
      toast.success(`Task marked as ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleQuickNavigate = () => {
    if (quickTitle.trim()) {
      navigate(`/create-todo?title=${encodeURIComponent(quickTitle.trim())}`);
    }
  };

  const handleSmartTaskAdd = async () => {
    if (!quickTitle.trim()) return;
    setIsParsing(true);
    try {
      const parsed = await parseTask(quickTitle, new Date().toISOString());
      
      const todoData: any = {
        title: parsed.title,
        scheduledDate: parsed.scheduledDate || new Date().toISOString().split("T")[0],
        scheduledTime: parsed.scheduledTime || "09:00",
        priority: parsed.priority || "medium",
        category: parsed.category || "Personal",
        apply147Rule: !!parsed.apply147Rule,
        descriptions: [],
        posterImage: "",
        links: [],
        recurrence: "none",
        reminderEnabled: true,
        notificationSound: "bell",
        order: Date.now(),
        status: "pending",
        galleryImages: [],
      };

      await dispatch(createTodoThunk(todoData)).unwrap();
      toast.success(`AI added task: ${parsed.title}`);
      setQuickTitle("");
    } catch (err: any) {
      toast.error(err.message || "AI parsing failed. Try normal add.");
      handleQuickNavigate();
    } finally {
      setIsParsing(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuickTitle(transcript);
      // Automatically parse voice input
      setTimeout(() => handleSmartTaskAdd(), 500);
    };

    recognition.start();
  };

  const handleGenerateAIPlan = async () => {
    if (todos.length === 0) return;
    setIsGeneratingPlan(true);
    try {
      const suggestions = await generateDailyPlan(todos, new Date().toISOString());
      setAiSuggestions(suggestions);
      toast.success("AI Focus Plan generated!");
    } catch (err) {
      toast.error("Failed to generate AI plan");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  useEffect(() => {
    if (todos.length > 0 && aiSuggestions.length === 0 && !isGeneratingPlan) {
      handleGenerateAIPlan();
    }
  }, [todos.length]);

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
            onClick={() => handleStatusUpdate(todo.id, "completed")}
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
        {/* ─── Hero Header & AI Power Bar ─── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Zap size={16} className="text-white" />
              </div>
              <span className={`text-sm font-bold ${THEME_CLASSES.text.tertiary}`}>
                {format(new Date(), "EEEE, MMMM d")}
              </span>
            </div>
            <h1 className={`text-3xl font-black tracking-tight ${THEME_CLASSES.text.primary}`}>
              {greeting},{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "there"}
              </span>{" "}
              👋
            </h1>
            <p className={`text-sm ${THEME_CLASSES.text.secondary}`}>
              You have{" "}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {stats.pendingToday}
              </span>{" "}
              tasks pending today.{" "}
              {stats.progressPercent > 0 && (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {stats.progressPercent}% done!
                </span>
              )}
            </p>
          </div>

          {/* AI Smart Task Entry */}
          <div className={`flex flex-col gap-2 w-full lg:w-96`}>
            <div className={`flex items-center gap-2 p-2 border rounded-2xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500/20 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <Brain size={18} className="text-blue-500" />
              </div>
              <input
                type="text"
                placeholder="Smart add: 'Study React tomorrow at 3pm'..."
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSmartTaskAdd();
                }}
                className={`flex-1 px-2 py-1.5 text-sm bg-transparent outline-none ${THEME_CLASSES.text.primary}`}
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={handleVoiceInput}
                  disabled={isListening}
                  className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : `hover:${THEME_CLASSES.surface.secondary} ${THEME_CLASSES.text.tertiary}`}`}
                  title="Voice Input"
                >
                  <LucideMic size={16} />
                </button>
                <button
                  onClick={handleSmartTaskAdd}
                  disabled={!quickTitle.trim() || isParsing}
                  className={`p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-all active:scale-95`}
                >
                  {isParsing ? <RefreshCw size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                </button>
              </div>
            </div>
            {isParsing && <p className="text-[10px] text-blue-500 font-bold px-2 flex items-center gap-1"><Sparkles size={8} /> AI is parsing your request...</p>}
          </div>
        </div>

        {/* ─── AI Focus Plan ─── */}
        {aiSuggestions.length > 0 && (
          <div className={`p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 shadow-sm space-y-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm">
                  <Sparkles size={20} className="text-blue-500" />
                </div>
                <div>
                  <h3 className={`text-base font-black ${THEME_CLASSES.text.primary}`}>AI Recommended Focus</h3>
                  <p className={`text-[10px] uppercase tracking-widest font-black text-blue-500`}>Intelligent Daily Plan</p>
                </div>
              </div>
              <button 
                onClick={handleGenerateAIPlan}
                disabled={isGeneratingPlan}
                className={`p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all ${THEME_CLASSES.text.tertiary}`}
              >
                <RefreshCw size={16} className={isGeneratingPlan ? "animate-spin" : ""} />
              </button>
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {aiSuggestions.slice(0, 3).map((suggestion) => {
                const task = todos.find(t => t.id === suggestion.taskId);
                if (!task) return null;
                return (
                  <div 
                    key={suggestion.taskId}
                    onClick={() => navigate(`/todo/${task.id}`)}
                    className={`p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer group`}
                  >
                    <div className="flex items-start justify-between mb-2">
                       <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600`}>
                         Rank #{suggestion.priorityScore}
                       </span>
                       <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-all text-blue-500`} />
                    </div>
                    <p className={`text-sm font-bold truncate mb-1 ${THEME_CLASSES.text.primary}`}>{task.title}</p>
                    <p className={`text-[10px] leading-tight line-clamp-2 ${THEME_CLASSES.text.secondary}`}>{suggestion.reason}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Progress Bar ─── */}
        {stats.todayTotal > 0 && (
          <div className={`p-4 rounded-2xl border ${THEME_CLASSES.surface.secondary} ${THEME_CLASSES.border.base}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>
                Today's Progress
              </span>
              <span className={`text-xs font-bold ${THEME_CLASSES.text.primary}`}>
                {stats.completedToday}/{stats.todayTotal} tasks
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* ─── Main Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Tasks */}
          <div className={`lg:col-span-2 border rounded-2xl shadow-sm overflow-hidden ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${THEME_CLASSES.border.base}`}>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" />
                <h2 className={`font-bold ${THEME_CLASSES.text.primary}`}>Today's Tasks</h2>
                {stats.todayTotal > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-black bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full">
                    {stats.todayTotal}
                  </span>
                )}
              </div>
              <Link
                to="/today"
                className={`text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all ${THEME_CLASSES.text.link}`}
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="px-5 py-4 animate-pulse flex items-center gap-4">
                    <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
                      <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                    </div>
                  </div>
                ))
              ) : todayTodos.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-50">
                    <CheckCircle2 size={32} className="text-emerald-400" />
                    <div>
                      <p className={`text-sm font-bold ${THEME_CLASSES.text.primary}`}>All clear!</p>
                      <p className={`text-xs ${THEME_CLASSES.text.tertiary}`}>No tasks scheduled for today</p>
                    </div>
                  </div>
                  <Link
                    to="/create-todo"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                  >
                    <Plus size={12} /> Add a task
                  </Link>
                </div>
              ) : (
                todayTodos.map((todo) => (
                  <div key={todo.id} className={`px-5 py-4 flex items-center gap-4 group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors`}>
                    <div className="flex-shrink-0">
                      <StatusIcon todo={todo} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/todo/${todo.id}`}>
                        <p className={`text-sm font-semibold truncate transition-colors group-hover:text-blue-500 ${THEME_CLASSES.text.primary} ${todo.status === "completed" ? "line-through opacity-40" : ""}`}>
                          {todo.title}
                        </p>
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        {todo.scheduledTime && (
                          <span className={`flex items-center gap-1 text-[10px] ${THEME_CLASSES.text.tertiary}`}>
                            <Clock size={9} /> {todo.scheduledTime}
                          </span>
                        )}
                        {todo.apply147Rule && todo.seriesDates && (
                          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                            {get147Label(todo.seriesDates, todo.scheduledDate)}
                          </span>
                        )}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 ${THEME_CLASSES.text.tertiary}`}>
                          {todo.category}
                        </span>
                      </div>
                    </div>
                    <Link to={`/todo/${todo.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink size={13} className={THEME_CLASSES.text.tertiary} />
                    </Link>
                  </div>
                ))
              )}
            </div>

            <div className={`px-5 py-3 border-t ${THEME_CLASSES.border.base} ${THEME_CLASSES.surface.secondary}`}>
              <Link
                to="/create-todo"
                className={`flex items-center gap-2 text-xs font-bold ${THEME_CLASSES.text.link} hover:gap-3 transition-all`}
              >
                <Plus size={14} /> Add new task
              </Link>
            </div>
          </div>

          {/* Right Panel: Upcoming Reminders + Stats */}
          <div className="space-y-5">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Tasks", value: todos.length, icon: Target, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
                { label: "Completed", value: todos.filter(t => t.status === "completed").length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                { label: "1-4-7 Rule", value: stats.learningTasks, icon: RefreshCw, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
                { label: "Notes", value: notes.length, icon: StickyNote, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className={`p-3 rounded-xl border ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>
                      {label}
                    </span>
                    <div className={`p-1.5 rounded-lg ${bg}`}>
                      <Icon size={12} className={color} />
                    </div>
                  </div>
                  <p className={`text-xl font-black ${THEME_CLASSES.text.primary}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Upcoming Reminders */}
            {upcomingReminders.length > 0 && (
              <div className={`border rounded-2xl shadow-sm overflow-hidden ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
                <div className={`flex items-center gap-2 px-4 py-3 border-b ${THEME_CLASSES.border.base}`}>
                  <Bell size={14} className="text-amber-500 animate-pulse" />
                  <h3 className={`font-bold text-sm ${THEME_CLASSES.text.primary}`}>Upcoming Reminders</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {upcomingReminders.map((todo) => (
                    <div key={todo.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                        <Clock size={14} className="text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${THEME_CLASSES.text.primary}`}>{todo.title}</p>
                        <p className={`text-[10px] font-bold text-amber-600 dark:text-amber-400`}>{todo.scheduledTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Bottom Row: Learning, Diary, Notes, Quick Links ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* 1-4-7 Learning Panel */}
          <div className={`border rounded-2xl shadow-sm overflow-hidden ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${THEME_CLASSES.border.base} bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10`}>
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-purple-500" />
                <h3 className={`font-bold text-sm ${THEME_CLASSES.text.primary}`}>Learning Today</h3>
              </div>
              <Link to="/todos" className="text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                All <ChevronRight size={10} />
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {learningDueToday.length === 0 ? (
                <div className="py-4 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <Brain size={24} className="text-purple-400" />
                    <p className={`text-xs ${THEME_CLASSES.text.tertiary}`}>No learning tasks today</p>
                  </div>
                  <Link to="/create-todo" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 hover:underline">
                    <Plus size={10} /> Schedule learning
                  </Link>
                </div>
              ) : (
                learningDueToday.map((todo) => (
                  <Link
                    key={todo.id}
                    to={`/todo/${todo.id}`}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm ${THEME_CLASSES.surface.secondary} ${THEME_CLASSES.border.base}`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <RefreshCw size={14} className="text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${THEME_CLASSES.text.primary}`}>{todo.title}</p>
                      {todo.seriesDates && (
                        <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                          {get147Label(todo.seriesDates, todo.scheduledDate)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Diary Entry */}
          <div className={`border rounded-2xl shadow-sm overflow-hidden ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${THEME_CLASSES.border.base} bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/10 dark:to-pink-900/10`}>
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-rose-500" />
                <h3 className={`font-bold text-sm ${THEME_CLASSES.text.primary}`}>Heartspace</h3>
              </div>
              <Link to="/heartspace" className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                Open <ChevronRight size={10} />
              </Link>
            </div>
            <div className="p-4">
              {latestDiaryEntry ? (
                <Link to="/heartspace" className="block space-y-2 group">
                  <p className={`text-xs font-bold ${THEME_CLASSES.text.tertiary}`}>
                    {format(new Date(latestDiaryEntry.date), "MMM d, yyyy")}
                  </p>
                  <p className={`font-semibold text-sm group-hover:text-rose-500 transition-colors ${THEME_CLASSES.text.primary}`}>
                    {latestDiaryEntry.title || "Untitled Entry"}
                  </p>
                  <p className={`text-xs line-clamp-3 leading-relaxed ${THEME_CLASSES.text.secondary}`}>
                    {latestDiaryEntry.content}
                  </p>
                </Link>
              ) : (
                <div className="py-4 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <BookOpen size={24} className="text-rose-400" />
                    <p className={`text-xs ${THEME_CLASSES.text.tertiary}`}>No diary entries yet</p>
                  </div>
                  <Link to="/heartspace" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 hover:underline">
                    <Plus size={10} /> Write your first entry
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Notes Shortcut */}
          <div className={`border rounded-2xl shadow-sm overflow-hidden ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${THEME_CLASSES.border.base} bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10`}>
              <div className="flex items-center gap-2">
                <StickyNote size={16} className="text-amber-500" />
                <h3 className={`font-bold text-sm ${THEME_CLASSES.text.primary}`}>Quick Notes</h3>
              </div>
              <Link to="/notes" className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                All <ChevronRight size={10} />
              </Link>
            </div>
            <div className="p-4">
              {latestNote ? (
                <div className="space-y-3">
                  <Link to="/notes" className="block group">
                    {latestNote.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 dark:text-amber-400 mb-1">
                        <Star size={8} fill="currentColor" /> PINNED
                      </span>
                    )}
                    <p className={`font-semibold text-sm group-hover:text-amber-500 transition-colors ${THEME_CLASSES.text.primary}`}>
                      {latestNote.title}
                    </p>
                    <p className={`text-xs line-clamp-3 leading-relaxed mt-1 ${THEME_CLASSES.text.secondary}`}>
                      {latestNote.content}
                    </p>
                  </Link>
                  {notes.length > 1 && (
                    <Link
                      to="/notes"
                      className={`text-[10px] font-bold flex items-center gap-1 ${THEME_CLASSES.text.link}`}
                    >
                      +{notes.length - 1} more notes <ArrowRight size={10} />
                    </Link>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <StickyNote size={24} className="text-amber-400" />
                    <p className={`text-xs ${THEME_CLASSES.text.tertiary}`}>No notes yet</p>
                  </div>
                  <Link to="/notes" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 hover:underline">
                    <Plus size={10} /> Capture first idea
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Quick Links from Tasks ─── */}
        {todos.some((t) => t.links?.length > 0) && (
          <div className={`border rounded-2xl shadow-sm overflow-hidden ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
            <div className={`flex items-center gap-2 px-5 py-4 border-b ${THEME_CLASSES.border.base}`}>
              <TrendingUp size={16} className="text-blue-500" />
              <h3 className={`font-bold text-sm ${THEME_CLASSES.text.primary}`}>Quick Link Viewer</h3>
              <span className={`text-[10px] ${THEME_CLASSES.text.tertiary}`}>— Open links inline without leaving the app</span>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {todos
                .filter((t) => t.links?.length > 0)
                .flatMap((t) => t.links.slice(0, 2).map((l) => ({ ...l, taskTitle: t.title })))
                .slice(0, 8)
                .map((link) => (
                  <button
                    key={link.id}
                    onClick={() => dispatch(openIFrame({ url: link.url, title: link.title }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all hover:shadow-sm hover:border-blue-400/50 ${THEME_CLASSES.surface.secondary} ${THEME_CLASSES.border.base} ${THEME_CLASSES.text.primary}`}
                  >
                    <ExternalLink size={11} className="text-blue-500 flex-shrink-0" />
                    <span className="truncate max-w-[100px]">{link.title}</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Home;
