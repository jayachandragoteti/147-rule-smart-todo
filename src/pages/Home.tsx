import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  ArrowRight,
  RotateCcw,
  Target,
  Flame,
  BookOpen,
  StickyNote,
  PlayCircle,
  Edit,
  CheckCheck,
  Loader2,
  Search,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import { useAppDispatch, useAppSelector, useToast } from "../app/hooks";
import { fetchTodos, updateTodo, completeTodo } from "../features/todos/todoThunks";
import { fetchNotes, createNote } from "../features/notes/notesSlice";
import { fetchJournalEntries } from "../features/journal/journalSlice";
import { THEME_CLASSES } from "../utils/themeUtils";
import {
  selectExtendedTaskStats,
  selectTodayTasks,
  selectTodayRevisions,
  selectUpcomingTasks,
} from "../features/todos/todoSelectors";
import { get137Label } from "../utils/rule137";
import type { Todo, TodoStatus } from "../types/todo";

// ─── Motivational quotes ───────────────────────────────────────────────────
const QUOTES = [
  "Small steps every day lead to big results.",
  "Discipline is choosing what you want most over what you want now.",
  "Done is better than perfect.",
  "One task at a time. One day at a time.",
  "Progress, not perfection.",
];

// ─── Status pill styles ────────────────────────────────────────────────────
const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  pending:    { label: "To Do",       className: THEME_CLASSES.status.todo,       icon: <Circle size={11} /> },
  inprogress: { label: "In Progress", className: THEME_CLASSES.status.inprogress, icon: <Clock size={11} /> },
  completed:  { label: "Done",        className: THEME_CLASSES.status.success,    icon: <CheckCircle2 size={11} /> },
};

const priorityDot: Record<string, string> = {
  urgent: "bg-[#ef4444]",
  high:   "bg-orange-400",
  medium: "bg-[#4f8cff]",
  low:    "bg-[#606878]",
};

// ─── Quick-Add tab types ───────────────────────────────────────────────────
type QuickAddTab = "task" | "note" | "journal";

const Home = () => {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const toast      = useToast();

  const loading        = useAppSelector((s) => s.todo.loading);
  const notes          = useAppSelector((s) => s.notes.notes);
  const journal        = useAppSelector((s) => s.journal.entries);
  const user           = useAppSelector((s) => s.auth.user);
  const isAuthChecked  = useAppSelector((s) => s.auth.isAuthChecked);

  const stats          = useAppSelector(selectExtendedTaskStats);
  // Show ALL today's tasks including completed
  const allTodayTasks   = useAppSelector(selectTodayTasks);
  const todayRevisions  = useAppSelector(selectTodayRevisions);
  const upcomingTasks   = useAppSelector(selectUpcomingTasks);

  const [updatingId,       setUpdatingId]       = useState<string | null>(null);
  const [quickTab,         setQuickTab]         = useState<QuickAddTab>("task");
  const [quickText,        setQuickText]        = useState("");
  const [savingNote,       setSavingNote]       = useState(false);
  const [taskSearch,       setTaskSearch]       = useState("");
  const [showAllUpcoming,  setShowAllUpcoming]  = useState(false);

  const quote = useMemo(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (isAuthChecked && user) {
      dispatch(fetchTodos());
      dispatch(fetchNotes());
      dispatch(fetchJournalEntries(user.uid));
    }
  }, [isAuthChecked, user, dispatch]);

  const latestJournal = useMemo(
    () => (journal.length > 0 ? journal[0] : null),
    [journal]
  );

  // Filter today's tasks by search (non-revision only shown here)
  const filteredTodayTasks = useMemo(() => {
    const regularTasks = allTodayTasks.filter((t) => !t.apply137Rule);
    if (!taskSearch.trim()) return regularTasks;
    const q = taskSearch.toLowerCase();
    return regularTasks.filter(
      (t) => t.title.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q)
    );
  }, [allTodayTasks, taskSearch]);

  // ── Date group label for upcoming tasks ────────────────────────────────────
  const getDateGroupLabel = (dateStr: string): string => {
    const today    = new Date(); today.setHours(0,0,0,0);
    const target   = new Date(dateStr); target.setHours(0,0,0,0);
    const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 7)  return target.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    if (diffDays <= 30) return "Next " + target.toLocaleDateString("en-US", { weekday: "long" });
    return target.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  };

  // Group upcoming tasks by date label
  const groupedUpcoming = useMemo(() => {
    const map: Record<string, typeof upcomingTasks> = {};
    const displayList = showAllUpcoming ? upcomingTasks : upcomingTasks.slice(0, 10);
    for (const t of displayList) {
      const label = getDateGroupLabel(t.scheduledDate);
      if (!map[label]) map[label] = [];
      map[label].push(t);
    }
    return map;
  }, [upcomingTasks, showAllUpcoming]);


  // ── Greeting ─────────────────────────────────────────────────────────────
  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();

  const firstName =
    user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // ── Status cycle ──────────────────────────────────────────────────────────
  const handleCycleStatus = async (todo: Todo) => {
    setUpdatingId(todo.id);
    try {
      if (todo.status === "pending") {
        await dispatch(updateTodo({ id: todo.id, updates: { status: "inprogress" as TodoStatus } })).unwrap();
      } else if (todo.status === "inprogress") {
        await dispatch(completeTodo(todo.id)).unwrap();
        toast.success("Task completed! 🎉");
      } else {
        await dispatch(updateTodo({ id: todo.id, updates: { status: "pending" as TodoStatus } })).unwrap();
      }
    } catch {
      toast.error("Failed to update task");
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Quick Add ─────────────────────────────────────────────────────────────
  const handleQuickAdd = async () => {
    if (!quickText.trim()) return;

    if (quickTab === "task") {
      navigate(`/create-todo?title=${encodeURIComponent(quickText.trim())}`);
      setQuickText("");
    } else if (quickTab === "note") {
      setSavingNote(true);
      try {
        await dispatch(
          createNote({ title: quickText.trim(), content: "", tags: [], isPinned: false })
        ).unwrap();
        toast.success("Note saved!");
        setQuickText("");
      } catch {
        toast.error("Failed to save note");
      } finally {
        setSavingNote(false);
      }
    } else {
      navigate("/heartspace");
      setQuickText("");
    }
  };

  // ── Task row ──────────────────────────────────────────────────────────────
  const TaskRow = ({ todo, isRevision }: { todo: Todo; isRevision?: boolean }) => {
    const isUpdating = updatingId === todo.id;
    const isDone     = todo.status === "completed";
    const cfg        = statusConfig[todo.status] ?? statusConfig.pending;
    const revLabel   = isRevision && todo.seriesDates?.length
      ? get137Label(todo.seriesDates, todo.scheduledDate)
      : null;

    return (
      <div
        className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isDone
            ? `opacity-50 ${THEME_CLASSES.surface.hover}`
            : `${THEME_CLASSES.surface.hover} hover:shadow-sm`
        }`}
      >
        {/* Status cycle button */}
        <button
          onClick={() => handleCycleStatus(todo)}
          disabled={isUpdating}
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all active:scale-90 ${
            isDone
              ? "border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]"
              : todo.status === "inprogress"
              ? "border-[#f59e0b] bg-[#f59e0b]/10 text-[#f59e0b]"
              : "border-gray-200 dark:border-white/10 hover:border-[#4f8cff] hover:bg-[#4f8cff]/10 text-transparent hover:text-[#4f8cff]"
          }`}
          title={`Status: ${cfg.label} — click to advance`}
        >
          {isUpdating ? (
            <Loader2 size={12} className="animate-spin text-[#4f8cff]" />
          ) : isDone ? (
            <CheckCircle2 size={14} />
          ) : todo.status === "inprogress" ? (
            <Clock size={12} />
          ) : (
            <Circle size={13} />
          )}
        </button>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium truncate ${
                isDone ? `line-through ${THEME_CLASSES.text.tertiary}` : THEME_CLASSES.text.primary
              }`}
            >
              {todo.title}
            </span>
            {/* Priority dot */}
            <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${priorityDot[todo.priority] ?? priorityDot.medium}`} />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {todo.scheduledTime && (
              <span className={`text-[10px] flex items-center gap-1 ${THEME_CLASSES.text.tertiary}`}>
                <Clock size={9} /> {todo.scheduledTime}
              </span>
            )}
            {todo.category && (
              <span className={`text-[10px] ${THEME_CLASSES.text.tertiary}`}>{todo.category}</span>
            )}
            {revLabel && (
              <span className="text-[10px] font-semibold text-[#818cf8] bg-[#818cf8]/10 px-1.5 py-0.5 rounded-full">
                {revLabel} Revision
              </span>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className={`status-pill ${cfg.className} gap-1`}>
            {cfg.icon} {cfg.label}
          </span>
          <Link
            to={`/todo/${todo.id}`}
            className={`p-1.5 rounded-lg ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.tertiary} hover:text-[#4f8cff] transition-colors`}
            title="View details"
          >
            <Edit size={13} />
          </Link>
        </div>

        {/* Always-visible actions for mobile */}
        <div className="sm:hidden flex items-center gap-1 shrink-0">
          <span className={`status-pill ${cfg.className}`}>{cfg.label}</span>
        </div>
      </div>
    );
  };

  // ── Section wrapper ────────────────────────────────────────────────────────
  const Section = ({
    title, icon, href, hrefLabel, children, empty, emptyText,
  }: {
    title: string;
    icon: React.ReactNode;
    href?: string;
    hrefLabel?: string;
    children: React.ReactNode;
    empty?: boolean;
    emptyText?: string;
  }) => (
    <div className={`rounded-2xl border overflow-hidden ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
      <div className={`flex items-center justify-between px-5 py-3.5 border-b ${THEME_CLASSES.border.base}`}>
        <div className="flex items-center gap-2">
          <span className="text-[#4f8cff]">{icon}</span>
          <h2 className={`text-sm font-semibold ${THEME_CLASSES.text.primary}`}>{title}</h2>
        </div>
        {href && (
          <Link
            to={href}
            className={`text-[11px] font-medium flex items-center gap-1 transition-all ${THEME_CLASSES.text.link} hover:gap-1.5`}
          >
            {hrefLabel ?? "View all"} <ArrowRight size={11} />
          </Link>
        )}
      </div>
      {empty ? (
        <div className="px-5 py-10 text-center">
          <p className={`text-sm ${THEME_CLASSES.text.tertiary}`}>{emptyText ?? "Nothing here yet"}</p>
        </div>
      ) : (
        <div className="p-2">{children}</div>
      )}
    </div>
  );

  return (
    <PageWrapper>
      <div className="space-y-5 pb-12 animate-fade-in">

        {/* ── Welcome Header ── */}
        <div className="space-y-0.5 animate-fade-in-up">
          <p className={`text-xs font-semibold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>
            {dateLabel}
          </p>
          <h1 className={`text-2xl font-bold tracking-tight ${THEME_CLASSES.text.primary}`}>
            {greeting},{" "}
            <span className="text-[#4f8cff]">{firstName}</span> 👋
          </h1>
          <p className={`text-sm italic ${THEME_CLASSES.text.tertiary}`}>"{quote}"</p>
        </div>

        {/* ── Quick Add Area ── */}
        <div
          className={`rounded-2xl border p-4 space-y-3 animate-fade-in-up ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}
          style={{ animationDelay: "40ms" }}
        >
          {/* Tabs */}
          <div className="flex gap-1">
            {(["task", "note", "journal"] as QuickAddTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => { setQuickTab(tab); setQuickText(""); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  quickTab === tab
                    ? "bg-[#4f8cff] text-white shadow-[0_0_12px_rgba(79,140,255,0.3)]"
                    : `${THEME_CLASSES.text.tertiary} ${THEME_CLASSES.button.hover}`
                }`}
              >
                {tab === "task"    && <Target size={11} />}
                {tab === "note"    && <StickyNote size={11} />}
                {tab === "journal" && <BookOpen size={11} />}
                {tab}
              </button>
            ))}
          </div>

          {/* Input row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Plus size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${THEME_CLASSES.text.tertiary}`} />
              <input
                type="text"
                placeholder={
                  quickTab === "task"
                    ? "What do you need to do today?"
                    : quickTab === "note"
                    ? "Capture a quick note…"
                    : "Start today's journal entry…"
                }
                value={quickText}
                onChange={(e) => setQuickText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
                className={`w-full pl-8 pr-4 py-2.5 rounded-xl text-sm ${THEME_CLASSES.input.base}`}
              />
            </div>
            <button
              onClick={handleQuickAdd}
              disabled={!quickText.trim() || savingNote}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-40 ${THEME_CLASSES.button.primary}`}
            >
              {savingNote ? <Loader2 size={14} className="animate-spin" /> : "Add"}
            </button>
          </div>
        </div>

        {/* ── Today's Tasks (ALL including completed) ── */}
        <div className="animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          <div className={`rounded-2xl border overflow-hidden ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
            {/* Section header */}
            <div className={`flex items-center justify-between px-5 py-3.5 border-b ${THEME_CLASSES.border.base}`}>
              <div className="flex items-center gap-2">
                <span className="text-[#4f8cff]"><Target size={15} /></span>
                <h2 className={`text-sm font-semibold ${THEME_CLASSES.text.primary}`}>Today's Tasks</h2>
                {/* Count badges */}
                <div className="flex items-center gap-1 ml-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${THEME_CLASSES.status.todo}`}>
                    {filteredTodayTasks.filter(t => t.status === "pending").length} pending
                  </span>
                  {filteredTodayTasks.filter(t => t.status === "inprogress").length > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${THEME_CLASSES.status.inprogress}`}>
                      {filteredTodayTasks.filter(t => t.status === "inprogress").length} active
                    </span>
                  )}
                  {filteredTodayTasks.filter(t => t.status === "completed").length > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${THEME_CLASSES.status.success}`}>
                      {filteredTodayTasks.filter(t => t.status === "completed").length} done
                    </span>
                  )}
                </div>
              </div>
              <Link
                to="/todos"
                className={`text-[11px] font-medium flex items-center gap-1 transition-all ${THEME_CLASSES.text.link} hover:gap-1.5`}
              >
                All tasks <ArrowRight size={11} />
              </Link>
            </div>

            {/* Search bar — always visible */}
            <div className={`px-4 py-2.5 border-b ${THEME_CLASSES.border.base}`}>
              <div className="relative">
                <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${THEME_CLASSES.text.tertiary}`} />
                <input
                  type="text"
                  placeholder="Search today's tasks…"
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2 rounded-xl text-xs ${THEME_CLASSES.input.base}`}
                />
              </div>
            </div>

            {/* Task list */}
            {loading ? (
              <div className="space-y-2 p-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-white/3 animate-pulse" />
                ))}
              </div>
            ) : filteredTodayTasks.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <CheckCircle2 size={28} className="mx-auto mb-2 text-[#22c55e] opacity-40" />
                <p className={`text-sm ${THEME_CLASSES.text.tertiary}`}>
                  {taskSearch ? "No tasks match your search" : "No tasks scheduled for today. Add one above!"}
                </p>
              </div>
            ) : (
              <div className="p-2 divide-y divide-gray-50 dark:divide-white/3">
                {/* Active tasks first */}
                {filteredTodayTasks
                  .filter((t) => t.status !== "completed")
                  .map((todo) => (
                    <TaskRow key={todo.id} todo={todo} />
                  ))}
                {/* Completed tasks below with subtle separator */}
                {filteredTodayTasks.filter((t) => t.status === "completed").length > 0 && (
                  <>
                    {filteredTodayTasks.filter((t) => t.status !== "completed").length > 0 && (
                      <div className={`flex items-center gap-2 px-4 py-2`}>
                        <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
                        <span className={`text-[10px] font-semibold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>
                          Completed
                        </span>
                        <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
                      </div>
                    )}
                    {filteredTodayTasks
                      .filter((t) => t.status === "completed")
                      .map((todo) => (
                        <TaskRow key={todo.id} todo={todo} />
                      ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Today's Revisions (1-3-7) ── */}
        <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <Section
            title="Today's Revisions (1-3-7)"
            icon={<RotateCcw size={15} />}
            href="/learning"
            hrefLabel="All revisions"
            empty={!loading && todayRevisions.length === 0}
            emptyText="No revisions scheduled for today. Great — enjoy the break!"
          >
            {loading ? (
              <div className="space-y-2 p-1">
                {[1, 2].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-white/3 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-white/3">
                {todayRevisions.map((todo) => (
                  <TaskRow key={todo.id} todo={todo} isRevision />
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* ── Upcoming & Scheduled Tasks ── */}
        <div className="animate-fade-in-up" style={{ animationDelay: "140ms" }}>
          <div className={`rounded-2xl border overflow-hidden ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-5 py-3.5 border-b ${THEME_CLASSES.border.base}`}>
              <div className="flex items-center gap-2">
                <span className="text-[#818cf8]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </span>
                <h2 className={`text-sm font-semibold ${THEME_CLASSES.text.primary}`}>Upcoming &amp; Scheduled</h2>
                {upcomingTasks.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#818cf8]/10 text-[#818cf8]">
                    {upcomingTasks.length}
                  </span>
                )}
              </div>
              <Link
                to="/todos"
                className={`text-[11px] font-medium flex items-center gap-1 transition-all ${THEME_CLASSES.text.link} hover:gap-1.5`}
              >
                All tasks <ArrowRight size={11} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-2 p-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-xl bg-gray-100 dark:bg-white/3 animate-pulse" />
                ))}
              </div>
            ) : upcomingTasks.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className={`text-sm ${THEME_CLASSES.text.tertiary}`}>No upcoming scheduled tasks.</p>
              </div>
            ) : (
              <div className="p-3 space-y-4">
                {Object.entries(groupedUpcoming).map(([dateLabel, tasks]) => (
                  <div key={dateLabel}>
                    {/* Date group label */}
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>
                        {dateLabel}
                      </span>
                      <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
                    </div>

                    {/* Tasks under this date */}
                    <div className="space-y-0.5">
                      {tasks.map((todo) => {
                        const isUpdating = updatingId === todo.id;
                        const isDone     = todo.status === "completed";
                        const cfg        = statusConfig[todo.status] ?? statusConfig.pending;

                        // Schedule type badge
                        const scheduleBadge = todo.apply137Rule
                          ? { label: "1-3-7", color: "text-[#818cf8] bg-[#818cf8]/10" }
                          : todo.recurrence === "daily"
                          ? { label: "Daily", color: "text-[#22c55e] bg-[#22c55e]/10" }
                          : todo.recurrence === "weekly"
                          ? { label: "Weekly", color: "text-[#4f8cff] bg-[#4f8cff]/10" }
                          : todo.recurrence === "monthly"
                          ? { label: "Monthly", color: "text-[#f59e0b] bg-[#f59e0b]/10" }
                          : null;

                        return (
                          <div
                            key={todo.id}
                            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                              isDone ? "opacity-50" : THEME_CLASSES.surface.hover
                            }`}
                          >
                            {/* Status toggle */}
                            <button
                              onClick={() => handleCycleStatus(todo)}
                              disabled={isUpdating}
                              className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all active:scale-90 ${
                                isDone
                                  ? "border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]"
                                  : todo.status === "inprogress"
                                  ? "border-[#f59e0b] bg-[#f59e0b]/10 text-[#f59e0b]"
                                  : "border-gray-200 dark:border-white/10 hover:border-[#4f8cff] hover:bg-[#4f8cff]/10 hover:text-[#4f8cff] text-transparent"
                              }`}
                              title={`${cfg.label} — click to advance`}
                            >
                              {isUpdating ? (
                                <Loader2 size={11} className="animate-spin text-[#4f8cff]" />
                              ) : isDone ? (
                                <CheckCircle2 size={12} />
                              ) : todo.status === "inprogress" ? (
                                <Clock size={11} />
                              ) : (
                                <Circle size={11} />
                              )}
                            </button>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-sm font-medium truncate ${isDone ? `line-through ${THEME_CLASSES.text.tertiary}` : THEME_CLASSES.text.primary}`}>
                                  {todo.title}
                                </span>
                                {scheduleBadge && (
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${scheduleBadge.color}`}>
                                    {scheduleBadge.label}
                                  </span>
                                )}
                                <span className={`shrink-0 w-1 h-1 rounded-full ${priorityDot[todo.priority] ?? priorityDot.medium}`} />
                              </div>
                              {(todo.scheduledTime || todo.category) && (
                                <div className={`flex items-center gap-1.5 mt-0.5 text-[10px] ${THEME_CLASSES.text.tertiary}`}>
                                  {todo.scheduledTime && (
                                    <span className="flex items-center gap-0.5"><Clock size={9} /> {todo.scheduledTime}</span>
                                  )}
                                  {todo.category && <span>· {todo.category}</span>}
                                </div>
                              )}
                            </div>

                            {/* Hover actions */}
                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className={`status-pill ${cfg.className}`}>{cfg.label}</span>
                              <Link
                                to={`/todo/${todo.id}`}
                                className={`p-1.5 rounded-lg ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.tertiary} hover:text-[#4f8cff]`}
                              >
                                <Edit size={12} />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Show more/less toggle */}
                {upcomingTasks.length > 10 && (
                  <button
                    onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                    className={`w-full py-2 text-xs font-semibold rounded-xl transition-all ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.tertiary} hover:text-[#4f8cff]`}
                  >
                    {showAllUpcoming
                      ? "Show less ↑"
                      : `Show all ${upcomingTasks.length} upcoming tasks ↓`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Daily Stats (moved below tasks) ── */}
        <div className="animate-fade-in-up" style={{ animationDelay: "160ms" }}>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total",       value: stats.total,      icon: <Target size={15} />,      color: "text-[#4f8cff] bg-[#4f8cff]/10" },
              { label: "Completed",   value: stats.completed,   icon: <CheckCheck size={15} />,  color: "text-[#22c55e] bg-[#22c55e]/10" },
              { label: "In Progress", value: stats.inProgress,  icon: <PlayCircle size={15} />,  color: "text-[#f59e0b] bg-[#f59e0b]/10" },
              { label: "Pending",     value: stats.pending,     icon: <Flame size={15} />,       color: "text-[#a0a6b5] bg-white/5" },
            ].map(({ label, value, icon, color }) => (
              <div
                key={label}
                className={`flex items-center gap-3 p-3.5 rounded-xl border ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}
              >
                <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
                <div>
                  <p className={`text-xl font-bold leading-none ${THEME_CLASSES.text.primary}`}>{value}</p>
                  <p className={`text-[10px] mt-0.5 font-medium ${THEME_CLASSES.text.tertiary}`}>{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[11px] font-medium ${THEME_CLASSES.text.tertiary}`}>
                Today's progress
              </span>
              <span className={`text-[11px] font-bold ${THEME_CLASSES.text.primary}`}>
                {stats.progressPercent}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#4f8cff] to-[#22c55e] rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Recent Journal Entry ── */}
        {latestJournal && (
          <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <Section
              title="Recent Journal Entry"
              icon={<BookOpen size={15} />}
              href="/heartspace"
              hrefLabel="Open Heartspace"
            >
              <div className="px-2 py-1">
                <p className={`text-xs font-semibold mb-1 ${THEME_CLASSES.text.primary}`}>
                  {latestJournal.title || "Untitled entry"}
                </p>
                <p className={`text-xs leading-relaxed line-clamp-2 ${THEME_CLASSES.text.secondary}`}>
                  {latestJournal.content || "No content."}
                </p>
                <p className={`text-[10px] mt-2 ${THEME_CLASSES.text.tertiary}`}>
                  {new Date(latestJournal.date).toLocaleDateString("en-US", {
                    weekday: "short", month: "short", day: "numeric",
                  })}
                </p>
              </div>
            </Section>
          </div>
        )}

        {/* ── Notes shortcut ── */}
        {notes.length > 0 && (
          <div className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
            <Link
              to="/notes"
              className={`flex items-center justify-between px-5 py-3.5 rounded-2xl border transition-all group ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base} hover:border-[#4f8cff]/30`}
            >
              <div className="flex items-center gap-3">
                <StickyNote size={15} className="text-[#f59e0b]" />
                <span className={`text-sm font-medium ${THEME_CLASSES.text.secondary}`}>
                  {notes.length} note{notes.length !== 1 ? "s" : ""} saved
                </span>
              </div>
              <ArrowRight size={14} className={`${THEME_CLASSES.text.tertiary} group-hover:text-[#4f8cff] group-hover:translate-x-0.5 transition-all`} />
            </Link>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Home;
