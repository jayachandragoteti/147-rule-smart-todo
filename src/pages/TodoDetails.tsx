import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Trash2,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Copy,
  Calendar,
  Clock,
  Repeat,
  Info,
  Edit3,
  Bell,
  ExternalLink,
  Circle,
  type LucideIcon,
} from "lucide-react";
import { SOUND_OPTIONS } from "../utils/soundEngine";
import PageWrapper from "../components/layout/PageWrapper";
import { useAppSelector, useAppDispatch, useToast } from "../app/hooks";
import {
  updateTodo,
  deleteTodo,
  createTodo,
  completeTodo,
  toggleSubtaskStatus,
} from "../features/todos/todoThunks";
import StatusDropdown from "../components/ui/StatusDropdown";
import { TODO_STATUS } from "../utils/todoConstants";
import { THEME_CLASSES } from "../utils/themeUtils";
import { get137Label } from "../utils/rule137";
import { formatDate } from "../utils/dateUtils";
import type { TodoStatus } from "../types/todo";

const TodoDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const todos   = useAppSelector((state) => state.todo.todos);
  const todo    = todos.find((t) => t.id === id);
  const dispatch = useAppDispatch();
  const toast    = useToast();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // ── Status change ──────────────────────────────────────────────────────────
  const handleStatusChange = async (newStatus: TodoStatus) => {
    if (!todo) return;

    // Subtask guard: can't complete if subtasks are pending
    if (newStatus === "completed") {
      const pendingSubtasks = todo.subtasks?.filter((st) => !st.completed) ?? [];
      if (pendingSubtasks.length > 0) {
        toast.error(
          `Complete all subtasks first (${pendingSubtasks.length} remaining)`
        );
        return;
      }
      // Use completeTodo for 1-3-7 rule advancement
      setUpdatingStatus(true);
      try {
        await dispatch(completeTodo(todo.id)).unwrap();
        toast.success(
          todo.seriesDates?.length ? "Revision advanced! ✨" : "Task completed! 🎉"
        );
      } catch {
        toast.error("Failed to update task");
      } finally {
        setUpdatingStatus(false);
      }
      return;
    }

    setUpdatingStatus(true);
    try {
      await dispatch(
        updateTodo({ id: todo.id, updates: { status: newStatus } })
      ).unwrap();
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ── Subtask toggle ─────────────────────────────────────────────────────────
  const handleToggleSubtask = async (subtaskId: string) => {
    if (!todo) return;
    try {
      await dispatch(toggleSubtaskStatus({ todoId: todo.id, subtaskId })).unwrap();
    } catch {
      toast.error("Failed to toggle subtask");
    }
  };

  // ── Reopen ─────────────────────────────────────────────────────────────────
  const handleReopenTask = async () => {
    if (!todo) return;
    try {
      const resetSubtasks = todo.subtasks?.map((st) => ({ ...st, completed: false })) || [];
      await dispatch(
        updateTodo({ id: todo.id, updates: { status: TODO_STATUS.PENDING, subtasks: resetSubtasks } })
      ).unwrap();
      toast.success("Task reopened!");
    } catch {
      toast.error("Failed to reopen task");
    }
  };

  // ── Duplicate ──────────────────────────────────────────────────────────────
  const handleDuplicate = async () => {
    if (!todo) return;
    try {
      const { id: _, createdAt: __, ...reproducedData } = todo;
      await dispatch(
        createTodo({
          ...reproducedData,
          scheduledDate: new Date().toISOString(),
          status: TODO_STATUS.PENDING,
        })
      ).unwrap();
      toast.success("Task duplicated for today!");
      navigate("/todos");
    } catch {
      toast.error("Failed to duplicate task");
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!todo) return;
    try {
      await dispatch(deleteTodo(todo.id)).unwrap();
      toast.success("Task deleted");
      navigate("/todos");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!todo) {
    return (
      <PageWrapper>
        <div className={`border rounded-3xl p-12 text-center shadow-lg ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
          <div className="w-20 h-20 bg-gray-100 dark:bg-[#1e2230] rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
            <Info size={40} />
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${THEME_CLASSES.text.primary}`}>Task Not Found</h2>
          <p className={`mb-8 text-sm ${THEME_CLASSES.text.tertiary}`}>The requested task could not be located.</p>
          <button
            onClick={() => navigate("/todos")}
            className={`px-8 py-3 rounded-2xl font-bold text-white ${THEME_CLASSES.button.primary}`}
          >
            Back to List
          </button>
        </div>
      </PageWrapper>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const isCompleted = todo.status === "completed";
  const subtasksDone   = todo.subtasks?.filter((st) => st.completed).length ?? 0;
  const subtasksTotal  = todo.subtasks?.length ?? 0;
  const allSubtasksDone = subtasksTotal === 0 || subtasksDone === subtasksTotal;

  const statusConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
    pending:    { label: "To Do",       color: THEME_CLASSES.status.todo,       icon: Clock },
    inprogress: { label: "In Progress", color: THEME_CLASSES.status.inprogress, icon: Repeat },
    completed:  { label: "Completed",   color: THEME_CLASSES.status.success,    icon: CheckCircle },
  };
  const currentStatus = statusConfig[todo.status] ?? statusConfig.pending;
  const StatusIcon    = currentStatus.icon;

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* ── Topbar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 text-sm font-semibold transition-all hover:text-[#4f8cff] ${THEME_CLASSES.text.tertiary}`}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <StatusDropdown
              currentStatus={todo.status}
              isUpdating={updatingStatus}
              blocked={todo.subtasks?.some((st) => !st.completed) ?? false}
              onChange={handleStatusChange}
            />

            <button
              title="Duplicate task"
              onClick={handleDuplicate}
              className={`p-2 border rounded-xl transition-all ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.secondary}`}
            >
              <Copy size={15} />
            </button>
            <button
              title="Edit task"
              onClick={() => navigate(`/edit-todo/${todo.id}`)}
              className={`p-2 border rounded-xl transition-all ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.secondary}`}
            >
              <Edit3 size={15} />
            </button>
            {isCompleted && (
              <button
                onClick={handleReopenTask}
                className="px-3 py-2 bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 rounded-xl text-xs font-semibold transition-all hover:bg-[#f59e0b]/20"
              >
                Reopen
              </button>
            )}
            <button
              title="Delete task"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 bg-[#ef4444]/5 text-[#ef4444] border border-[#ef4444]/20 rounded-xl transition-all hover:bg-[#ef4444]/10"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* ── Delete confirm modal ── */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className={`max-w-md w-full rounded-2xl p-8 space-y-6 border shadow-2xl ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
              <div className="text-center space-y-3">
                <div className="p-4 bg-[#ef4444]/10 text-[#ef4444] rounded-2xl mx-auto w-fit">
                  <AlertTriangle size={28} />
                </div>
                <h3 className={`text-lg font-bold ${THEME_CLASSES.text.primary}`}>Delete Task?</h3>
                <p className={`text-sm ${THEME_CLASSES.text.tertiary}`}>
                  "{todo.title}" will be permanently removed.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`flex-1 py-2.5 border rounded-xl font-semibold text-sm ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.secondary}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-[2] py-2.5 bg-[#ef4444] text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Main content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: details */}
          <div className="lg:col-span-2 space-y-5">
            <div className={`border rounded-2xl overflow-hidden ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
              {/* Poster image */}
              {todo.posterImage && (
                <div className="w-full h-56 relative">
                  <img src={todo.posterImage} alt={todo.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <h1 className="absolute bottom-5 left-6 text-2xl font-black text-white">{todo.title}</h1>
                </div>
              )}

              <div className="p-6 space-y-6">
                {!todo.posterImage && (
                  <h1 className={`text-2xl font-bold ${THEME_CLASSES.text.primary}`}>{todo.title}</h1>
                )}

                {/* Status + Category badges */}
                <div className="flex flex-wrap gap-2">
                  <span className={`status-pill text-[10px] ${currentStatus.color} whitespace-normal break-words`}>
                    <StatusIcon size={10} /> {currentStatus.label}
                  </span>
                  <span className={`status-pill text-[10px] ${THEME_CLASSES.status.todo} whitespace-normal break-words`}>
                    {todo.category}
                  </span>
                  {todo.apply137Rule && (
                    <span className="status-pill text-[10px] text-[#818cf8] bg-[#818cf8]/10 whitespace-normal break-words">
                      1-3-7 Rule
                    </span>
                  )}
                  {todo.recurrence !== "none" && (
                    <span className="status-pill text-[10px] text-[#4f8cff] bg-[#4f8cff]/10 whitespace-normal break-words">
                      <Repeat size={9} /> {todo.recurrence}
                    </span>
                  )}
                  {todo.recurrence === "weekly" && todo.weeklyDays && todo.weeklyDays.length > 0 && (
                    <span className="status-pill text-[10px] text-[#4f8cff] bg-[#4f8cff]/10 whitespace-normal break-words max-w-full">
                      {`Every ${todo.weeklyDays.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")}`}
                    </span>
                  )}
                </div>

                {/* Descriptions */}
                {todo.descriptions?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className={`text-[10px] font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>Notes</h3>
                    <div className={`space-y-2 pl-4 border-l-2 border-[#4f8cff]/20`}>
                      {todo.descriptions.map((desc, i) => (
                        <p key={i} className={`text-sm leading-relaxed ${THEME_CLASSES.text.secondary}`}>{desc}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subtasks */}
                {todo.subtasks && todo.subtasks.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-dashed border-gray-100 dark:border-white/5">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-[10px] font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>
                        Subtasks
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${allSubtasksDone ? "text-[#22c55e]" : THEME_CLASSES.text.tertiary}`}>
                          {subtasksDone} / {subtasksTotal} done
                        </span>
                        {!allSubtasksDone && !isCompleted && (
                          <span className="text-[10px] text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 rounded-full font-semibold">
                            Complete all to finish task
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress bar for subtasks */}
                    <div className="h-1 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#4f8cff] to-[#22c55e] rounded-full transition-all duration-500"
                        style={{ width: `${subtasksTotal ? (subtasksDone / subtasksTotal) * 100 : 0}%` }}
                      />
                    </div>

                    <div className="space-y-2">
                      {todo.subtasks.map((subtask) => (
                        <div
                          key={subtask.id}
                          className={`flex items-center gap-3 p-3 border rounded-xl transition-all ${
                            subtask.completed
                              ? `opacity-60 ${THEME_CLASSES.surface.secondary} ${THEME_CLASSES.border.base}`
                              : `${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base} hover:border-[#4f8cff]/30`
                          }`}
                        >
                          <button
                            onClick={() => handleToggleSubtask(subtask.id)}
                            className={`shrink-0 transition-colors ${
                              subtask.completed ? "text-[#22c55e]" : `${THEME_CLASSES.text.tertiary} hover:text-[#22c55e]`
                            }`}
                          >
                            {subtask.completed ? <CheckCircle size={18} /> : <Circle size={18} />}
                          </button>
                          <span
                            className={`text-sm font-medium flex-1 ${
                              subtask.completed ? `line-through ${THEME_CLASSES.text.tertiary}` : THEME_CLASSES.text.primary
                            }`}
                          >
                            {subtask.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gallery */}
                {todo.galleryImages?.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-dashed border-gray-100 dark:border-white/5">
                    <h3 className={`text-[10px] font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>Gallery</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {todo.galleryImages.map((img, i) => (
                        <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-100 dark:border-white/5">
                          <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          <button
                            onClick={() => window.open(img, "_blank")}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <ExternalLink size={18} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                {todo.links.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-dashed border-gray-100 dark:border-white/5">
                    <h3 className={`text-[10px] font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>Reference Links</h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {todo.links.map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className={`block p-3 border rounded-xl transition-all hover:border-[#4f8cff]/40 ${THEME_CLASSES.surface.secondary} ${THEME_CLASSES.border.base}`}
                        >
                          <p className={`font-semibold text-sm truncate ${THEME_CLASSES.text.primary}`}>{link.title}</p>
                          <p className="text-[10px] font-mono text-[#4f8cff] truncate">{link.url}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: timeline + meta */}
          <div className="space-y-5">
            {/* Timeline card */}
            <div className={`border rounded-2xl p-5 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
              <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-5 flex items-center gap-2 ${THEME_CLASSES.text.tertiary}`}>
                <Calendar size={12} /> Timeline
              </h3>
              <div className="space-y-4">
                <div className="pl-3 border-l-2 border-[#4f8cff]">
                  <p className="text-[10px] font-bold uppercase text-[#4f8cff] mb-0.5">Scheduled Date</p>
                  <p className={`text-sm font-bold ${THEME_CLASSES.text.primary}`}>{formatDate(todo.scheduledDate)}</p>
                  {todo.scheduledTime && (
                    <p className={`text-[10px] mt-0.5 ${THEME_CLASSES.text.tertiary}`}>
                      <Clock size={9} className="inline mr-1" />{todo.scheduledTime}
                    </p>
                  )}
                </div>

                {todo.seriesDates && todo.seriesDates.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>Review Schedule</p>
                    {todo.seriesDates.map((d, i) => {
                      const isCurrent = new Date(d).toISOString() === new Date(todo.scheduledDate).toISOString();
                      return (
                        <div
                          key={i}
                          className={`p-2.5 rounded-xl border text-xs flex justify-between items-center transition-all ${
                            isCurrent
                              ? "border-[#4f8cff] bg-[#4f8cff]/5 text-[#4f8cff]"
                              : `opacity-40 ${THEME_CLASSES.border.base}`
                          }`}
                        >
                          <div>
                            <span className={`font-bold block ${THEME_CLASSES.text.primary}`}>{formatDate(d)}</span>
                            <span className={`text-[9px] uppercase font-bold opacity-60`}>{get137Label(todo.seriesDates!, d)}</span>
                          </div>
                          {isCurrent && <CheckCircle size={13} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Reminder card */}
            {todo.reminderEnabled && (
              <div className={`p-5 border rounded-2xl ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
                <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${THEME_CLASSES.text.tertiary}`}>
                  <Bell size={12} /> Alert
                </h3>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-semibold ${THEME_CLASSES.text.primary}`}>
                    {SOUND_OPTIONS.find((s) => s.value === todo.notificationSound)?.label || "Bell"}
                  </span>
                  <span className="text-xl">
                    {SOUND_OPTIONS.find((s) => s.value === todo.notificationSound)?.emoji || "🔔"}
                  </span>
                </div>
              </div>
            )}

            {/* Priority + Created */}
            <div className={`p-5 border rounded-2xl ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>Priority</span>
                <span className={`status-pill text-[10px] ${
                  todo.priority === "urgent" ? THEME_CLASSES.status.danger :
                  todo.priority === "high"   ? THEME_CLASSES.priority.high :
                  todo.priority === "medium" ? THEME_CLASSES.priority.medium :
                  THEME_CLASSES.priority.low
                }`}>
                  {todo.priority}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>Created</span>
                <span className={`text-xs font-semibold ${THEME_CLASSES.text.secondary}`}>
                  {formatDate(todo.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default TodoDetails;