import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import { useAppDispatch, useAppSelector, useToast } from "../app/hooks";
import { fetchTodos, updateTodo, completeTodo } from "../features/todos/todoThunks";
import { deleteTodo } from "../features/todos/todoThunks";
import { THEME_CLASSES } from "../utils/themeUtils";
import { toTitleCase } from "../utils/textUtils";
import {
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit,
  ChevronDown,
  ListFilter,
  Eye,
  AlertTriangle,
} from "lucide-react";
import StatusDropdown from "../components/ui/StatusDropdown";
import { getOverdueDays } from "../utils/dateUtils";
import type { Todo, TodoPriority, TodoStatus } from "../types/todo";

type FilterStatus   = "all" | TodoStatus;
type FilterPriority = "all" | TodoPriority;
type SortKey        = "date" | "priority" | "status";

const priorityOrder: Record<TodoPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
const statusOrder:   Record<TodoStatus, number>   = { inprogress: 0, pending: 1, completed: 2 };

const Todos = () => {
  const dispatch  = useAppDispatch();
  const toast     = useToast();
  const todos     = useAppSelector((s) => s.todo.todos);
  const loading   = useAppSelector((s) => s.todo.loading);
  const isAuthChecked = useAppSelector((s) => s.auth.isAuthChecked);

  const [search,          setSearch]          = useState("");
  const [filterStatus,    setFilterStatus]    = useState<FilterStatus>("all");
  const [filterPriority,  setFilterPriority]  = useState<FilterPriority>("all");
  const [sortKey,         setSortKey]         = useState<SortKey>("date");
  const [updatingId,       setUpdatingId]       = useState<string | null>(null);
  const [deleteConfirmId,  setDeleteConfirmId]  = useState<string | null>(null);
  const [showFilters,      setShowFilters]      = useState(false);

  useEffect(() => {
    if (isAuthChecked) dispatch(fetchTodos());
  }, [isAuthChecked, dispatch]);

  const filtered = useMemo(() => {
    let list = [...todos];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) => t.title.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "all")   list = list.filter((t) => t.status === filterStatus);
    if (filterPriority !== "all") list = list.filter((t) => t.priority === filterPriority);

    list.sort((a, b) => {
      if (sortKey === "priority") return priorityOrder[a.priority] - priorityOrder[b.priority];
      if (sortKey === "status")   return statusOrder[a.status]   - statusOrder[b.status];
      return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
    });

    return list;
  }, [todos, search, filterStatus, filterPriority, sortKey]);



  const handleStatusChange = async (todo: Todo, newStatus: TodoStatus) => {
    if (newStatus === "completed") {
      const pendingSubtasks = todo.subtasks?.filter((st) => !st.completed) ?? [];
      if (pendingSubtasks.length > 0) {
        toast.error(`Complete all subtasks first (${pendingSubtasks.length} remaining)`);
        return;
      }
      setUpdatingId(todo.id);
      try {
        await dispatch(completeTodo(todo.id)).unwrap();
        toast.success("Task completed successfully. 🎉");
      } catch { toast.error("Failed to update"); } finally { setUpdatingId(null); }
      return;
    }
    if (todo.status === newStatus) return;
    setUpdatingId(todo.id);
    try {
      await dispatch(updateTodo({ id: todo.id, updates: { status: newStatus } })).unwrap();
    } catch { toast.error("Failed to update task"); } finally { setUpdatingId(null); }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteTodo(id)).unwrap();
      toast.success("Task deleted successfully.");
      setDeleteConfirmId(null);
    } catch {
      toast.error("Unable to delete task.");
    }
  };

  const priorityDot: Record<string, string> = {
    urgent: "bg-[#ef4444]",
    high:   "bg-orange-400",
    medium: "bg-[#4f8cff]",
    low:    "bg-[#606878]",
  };

  const SelectFilter = ({
    value, onChange, options, label,
  }: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    label: string;
  }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none pl-3 pr-7 py-2 rounded-xl text-xs font-medium border cursor-pointer ${THEME_CLASSES.input.base}`}
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${THEME_CLASSES.text.tertiary}`} />
    </div>
  );

  return (
    <PageWrapper>
      <div className="space-y-5 pb-12 animate-fade-in">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${THEME_CLASSES.text.primary}`}>
              All Tasks
            </h1>
            <p className={`text-sm mt-0.5 ${THEME_CLASSES.text.tertiary}`}>
              {todos.length} total · {todos.filter((t) => t.status === "completed").length} done
            </p>
          </div>
          <Link
            to="/create-todo"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 transition-all active:scale-95 ${THEME_CLASSES.button.primary}`}
          >
            <Plus size={16} /> New Task
          </Link>
        </div>

        {/* Search + Filter row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${THEME_CLASSES.text.tertiary}`} />
            <input
              type="text"
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm ${THEME_CLASSES.input.base}`}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              showFilters
                ? "bg-[#4f8cff]/10 border-[#4f8cff]/30 text-[#4f8cff]"
                : `${THEME_CLASSES.border.base} ${THEME_CLASSES.text.secondary} ${THEME_CLASSES.button.hover}`
            }`}
          >
            <ListFilter size={13} />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 animate-fade-in">
            <SelectFilter
              value={filterStatus}
              onChange={(v) => setFilterStatus(v as FilterStatus)}
              label="Filter by status"
              options={[
                { value: "all",        label: "All Statuses" },
                { value: "pending",    label: "To Do" },
                { value: "inprogress", label: "In Progress" },
                { value: "completed",  label: "Done" },
              ]}
            />
            <SelectFilter
              value={filterPriority}
              onChange={(v) => setFilterPriority(v as FilterPriority)}
              label="Filter by priority"
              options={[
                { value: "all",    label: "All Priorities" },
                { value: "urgent", label: "Urgent" },
                { value: "high",   label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low",    label: "Low" },
              ]}
            />
            <SelectFilter
              value={sortKey}
              onChange={(v) => setSortKey(v as SortKey)}
              label="Sort by"
              options={[
                { value: "date",     label: "Sort: Date" },
                { value: "priority", label: "Sort: Priority" },
                { value: "status",   label: "Sort: Status" },
              ]}
            />
          </div>
        )}

        {/* Task list */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-white/3 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className={`text-center py-20 rounded-2xl border-2 border-dashed ${THEME_CLASSES.border.base}`}
          >
            <CheckCircle2 size={36} className="mx-auto mb-3 text-[#22c55e] opacity-40" />
            <p className={`text-sm font-medium ${THEME_CLASSES.text.tertiary}`}>
              {search || filterStatus !== "all" || filterPriority !== "all"
                ? "No tasks match your current filters."
                : "No tasks yet. Create your first one."}
            </p>
            {!(search || filterStatus !== "all" || filterPriority !== "all") && (
              <Link
                to="/create-todo"
                className={`inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${THEME_CLASSES.button.primary}`}
              >
                <Plus size={14} /> New Task
              </Link>
            )}
          </div>
        ) : (
          <div className={`rounded-2xl border overflow-hidden ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
            <div className="divide-y divide-gray-50 dark:divide-white/3">
              {filtered.map((todo) => {
                const isDone     = todo.status === "completed";
                const overdueDays = getOverdueDays(todo);
                const isOverdue = overdueDays > 0;

                return (
                  <div
                    key={todo.id}
                    className={`group flex items-center gap-3 px-4 py-3.5 transition-all hover:bg-gray-50 dark:hover:bg-white/2 ${
                      isDone ? "opacity-50" : ""
                    } ${isOverdue ? "bg-red-50/70 dark:bg-red-950/20" : ""}`}
                  >
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/todo/${todo.id}`}
                          className={`text-sm font-medium truncate hover:text-[#4f8cff] transition-colors ${
                            isDone ? THEME_CLASSES.text.tertiary : THEME_CLASSES.text.primary
                          }`}
                        >
                          {toTitleCase(todo.title)}
                        </Link>
                        <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${priorityDot[todo.priority] ?? priorityDot.medium}`} />
                        {todo.apply137Rule && (
                          <span className="shrink-0 text-[10px] font-semibold text-[#818cf8] bg-[#818cf8]/10 px-1.5 py-0.5 rounded-full">
                            1-3-7
                          </span>
                        )}
                        {isOverdue && (
                          <span className="shrink-0 text-[10px] font-semibold text-red-600 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded-full">
                            <AlertTriangle size={10} className="inline mr-1" /> Overdue by {overdueDays} day{overdueDays === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>
                      <div className={`flex items-center gap-2 mt-0.5 text-[10px] ${THEME_CLASSES.text.tertiary}`}>
                        <span>{new Date(todo.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        {todo.scheduledTime && <span>· {todo.scheduledTime}</span>}
                        {todo.category && <span>· {todo.category}</span>}
                      </div>
                    </div>

                    {/* Status dropdown + actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Status dropdown */}
                      <StatusDropdown
                        currentStatus={todo.status}
                        isUpdating={updatingId === todo.id}
                        blocked={todo.subtasks?.some((st) => !st.completed) ?? false}
                        onChange={(status) => handleStatusChange(todo, status)}
                      />

                      {/* hover actions */}
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/todo/${todo.id}`}
                          className={`p-1.5 rounded-lg ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.tertiary} hover:text-[#4f8cff] transition-colors`}
                          title="View details"
                        >
                          <Eye size={13} />
                        </Link>
                        <Link
                          to={`/edit-todo/${todo.id}`}
                          className={`p-1.5 rounded-lg ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.tertiary} hover:text-[#4f8cff] transition-colors`}
                          title="Edit"
                        >
                          <Edit size={13} />
                        </Link>
                        {deleteConfirmId === todo.id ? (
                          <>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className={`px-2 py-1 text-[10px] font-semibold rounded-lg ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.tertiary}`}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDelete(todo.id)}
                              className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-[#ef4444]/10 text-[#ef4444]"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(todo.id)}
                            className={`p-1.5 rounded-lg ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.tertiary} hover:text-[#ef4444] transition-colors`}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Todos;