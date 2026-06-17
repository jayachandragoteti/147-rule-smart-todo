import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import { useAppDispatch, useAppSelector, useToast } from "../app/hooks";
import { fetchTodos, completeTodo, updateTodo } from "../features/todos/todoThunks";
import { THEME_CLASSES } from "../utils/themeUtils";
import { get137Label } from "../utils/rule137";
import { isTodayDate } from "../utils/dateUtils";
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  Circle,
  Loader2,
  Plus,
  Target,
} from "lucide-react";
import type { Todo, TodoStatus } from "../types/todo";

const LABEL_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  "Day 1": { color: "text-[#4f8cff]",  bg: "bg-[#4f8cff]/10",  label: "Day 1 – First Study" },
  "Day 3": { color: "text-[#f59e0b]",  bg: "bg-[#f59e0b]/10",  label: "Day 3 – First Review" },
  "Day 7": { color: "text-[#22c55e]",  bg: "bg-[#22c55e]/10",  label: "Day 7 – Final Review" },
  "Series":{ color: "text-[#818cf8]",  bg: "bg-[#818cf8]/10",  label: "Revision" },
};

const Learning = () => {
  const dispatch      = useAppDispatch();
  const toast         = useToast();
  const todos         = useAppSelector((s) => s.todo.todos);
  const loading       = useAppSelector((s) => s.todo.loading);
  const isAuthChecked = useAppSelector((s) => s.auth.isAuthChecked);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthChecked) dispatch(fetchTodos());
  }, [isAuthChecked, dispatch]);

  // All 1-3-7 tasks
  const revisionTodos = todos.filter((t) => t.apply137Rule);

  // Split into today / upcoming / completed
  const dueToday   = revisionTodos.filter((t) => {
    if (t.seriesDates?.length) return t.seriesDates.some((d) => isTodayDate(d));
    return isTodayDate(t.scheduledDate);
  });
  const completed  = revisionTodos.filter((t) => t.status === "completed" && !dueToday.find((d) => d.id === t.id));
  const upcoming   = revisionTodos.filter(
    (t) => !dueToday.find((d) => d.id === t.id) && !completed.find((c) => c.id === t.id)
  );

  const handleCycle = async (todo: Todo) => {
    setUpdatingId(todo.id);
    try {
      if (todo.status === "pending") {
        await dispatch(updateTodo({ id: todo.id, updates: { status: "inprogress" as TodoStatus } })).unwrap();
      } else if (todo.status === "inprogress") {
        await dispatch(completeTodo(todo.id)).unwrap();
        toast.success("Revision completed! 🎉");
      } else {
        await dispatch(updateTodo({ id: todo.id, updates: { status: "pending" as TodoStatus } })).unwrap();
      }
    } catch {
      toast.error("Failed to update revision");
    } finally {
      setUpdatingId(null);
    }
  };

  const RevisionRow = ({ todo }: { todo: Todo }) => {
    const isUpdating = updatingId === todo.id;
    const isDone     = todo.status === "completed";
    const rawLabel   = todo.seriesDates?.length
      ? get137Label(todo.seriesDates, todo.scheduledDate)
      : "Series";
    const cfg        = LABEL_CONFIG[rawLabel] ?? LABEL_CONFIG["Series"];

    return (
      <div
        className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
          isDone ? "opacity-50" : `${THEME_CLASSES.surface.hover}`
        }`}
      >
        {/* Status toggle */}
        <button
          onClick={() => handleCycle(todo)}
          disabled={isUpdating}
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all active:scale-90 ${
            isDone
              ? "border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]"
              : todo.status === "inprogress"
              ? "border-[#f59e0b] bg-[#f59e0b]/10 text-[#f59e0b]"
              : "border-gray-200 dark:border-white/10 hover:border-[#4f8cff] hover:bg-[#4f8cff]/10 hover:text-[#4f8cff] text-transparent"
          }`}
        >
          {isUpdating ? (
            <Loader2 size={12} className="animate-spin text-[#4f8cff]" />
          ) : isDone ? (
            <CheckCircle2 size={13} />
          ) : todo.status === "inprogress" ? (
            <Clock size={12} />
          ) : (
            <Circle size={12} />
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isDone ? "line-through" : THEME_CLASSES.text.primary}`}>
            {todo.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.color} ${cfg.bg}`}>
              {cfg.label}
            </span>
            {todo.category && (
              <span className={`text-[10px] ${THEME_CLASSES.text.tertiary}`}>{todo.category}</span>
            )}
          </div>
        </div>

        {/* Date */}
        <span className={`shrink-0 text-[10px] font-medium ${THEME_CLASSES.text.tertiary}`}>
          {new Date(todo.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>
    );
  };

  const GroupSection = ({
    title, items, emptyText,
  }: { title: string; items: Todo[]; emptyText: string }) =>
    items.length > 0 ? (
      <div className={`rounded-2xl border overflow-hidden ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
        <div className={`px-5 py-3.5 border-b ${THEME_CLASSES.border.base}`}>
          <h2 className={`text-sm font-semibold ${THEME_CLASSES.text.primary}`}>{title}</h2>
          <p className={`text-[11px] ${THEME_CLASSES.text.tertiary}`}>{items.length} revision{items.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="p-2 divide-y divide-gray-50 dark:divide-white/3">
          {items.map((t) => <RevisionRow key={t.id} todo={t} />)}
        </div>
      </div>
    ) : (
      <div className={`rounded-2xl border-2 border-dashed text-center py-8 ${THEME_CLASSES.border.base}`}>
        <p className={`text-sm ${THEME_CLASSES.text.tertiary}`}>{emptyText}</p>
      </div>
    );

  return (
    <PageWrapper>
      <div className="space-y-6 pb-12 animate-fade-in">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 animate-fade-in-up">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-[#818cf8]/10">
                <RotateCcw size={16} className="text-[#818cf8]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#818cf8]">
                Spaced Repetition
              </span>
            </div>
            <h1 className={`text-2xl font-bold tracking-tight ${THEME_CLASSES.text.primary}`}>
              Revisions
            </h1>
            <p className={`text-sm ${THEME_CLASSES.text.tertiary}`}>
              1 → 3 → 7 day spaced repetition for lasting retention.
            </p>
          </div>
          <Link
            to="/create-todo"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 transition-all active:scale-95 ${THEME_CLASSES.button.primary}`}
          >
            <Plus size={16} /> Add Topic
          </Link>
        </div>

        {/* How it works pill row */}
        <div className="flex flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          {[
            { day: "Day 1", label: "First Study",   color: "text-[#4f8cff] bg-[#4f8cff]/10" },
            { day: "Day 3", label: "First Review",  color: "text-[#f59e0b] bg-[#f59e0b]/10" },
            { day: "Day 7", label: "Final Review",  color: "text-[#22c55e] bg-[#22c55e]/10" },
          ].map(({ day, label, color }) => (
            <div key={day} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${color}`}>
              <Target size={10} /> {day}: {label}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-white/3 animate-pulse" />
            ))}
          </div>
        ) : revisionTodos.length === 0 ? (
          <div className={`text-center py-20 rounded-2xl border-2 border-dashed ${THEME_CLASSES.border.base}`}>
            <RotateCcw size={36} className="mx-auto mb-3 text-[#818cf8] opacity-40" />
            <p className={`text-sm font-medium ${THEME_CLASSES.text.secondary}`}>No revision topics yet.</p>
            <p className={`text-xs mt-1 ${THEME_CLASSES.text.tertiary}`}>Create a task and enable the 1-3-7 rule.</p>
            <Link
              to="/create-todo"
              className={`inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${THEME_CLASSES.button.primary}`}
            >
              <Plus size={14} /> Add First Topic
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <GroupSection
              title="📅 Due Today"
              items={dueToday}
              emptyText="No revisions due today — great!"
            />
            <GroupSection
              title="🔜 Upcoming"
              items={upcoming}
              emptyText="No upcoming revisions."
            />
            {completed.length > 0 && (
              <GroupSection
                title="✅ Completed"
                items={completed}
                emptyText=""
              />
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Learning;