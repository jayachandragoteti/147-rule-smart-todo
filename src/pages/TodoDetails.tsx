import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Trash2, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  Copy, 
  Calendar, 
  Tag, 
  Link as LinkIcon,
  Clock,
  Zap,
  Target,
  Repeat,
  Info,
  type LucideIcon
} from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import { useAppSelector, useAppDispatch, useToast } from "../app/hooks";
import { updateTodo, deleteTodo, createTodo } from "../features/todos/todoThunks";
import { TODO_STATUS } from "../utils/todoConstants";
import { THEME_CLASSES } from "../utils/themeUtils";
import { get147Label, getNextSeriesDate } from "../utils/rule147";
import { formatDate } from "../utils/dateUtils";

const TodoDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const todos = useAppSelector((state) => state.todo.todos);
  const loading = useAppSelector((state) => state.todo.loading);
  const todo = todos.find((t) => t.id === id);
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleMarkComplete = async () => {
    if (!todo) return;
    try {
      if (todo.seriesDates && todo.seriesDates.length > 0) {
        const nextDate = getNextSeriesDate(todo.seriesDates, todo.scheduledDate);
        if (nextDate) {
          await dispatch(
            updateTodo({
              id: todo.id,
              updates: { scheduledDate: nextDate, status: TODO_STATUS.PENDING },
            })
          ).unwrap();
          toast.success(`Advanced to ${get147Label(todo.seriesDates, nextDate)}`);
          return;
        }

        await dispatch(
          updateTodo({
            id: todo.id,
            updates: { status: TODO_STATUS.COMPLETED, apply147Rule: false },
          })
        ).unwrap();
        toast.success("Series completed!");
        return;
      }

      await dispatch(
        updateTodo({ id: todo.id, updates: { status: TODO_STATUS.COMPLETED } })
      ).unwrap();
      toast.success("Task completed!");
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleDuplicate = async () => {
    if (!todo) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _, createdAt: __, ...reproducedData } = todo;
      const today = new Date().toISOString();
      await dispatch(
        createTodo({
          ...reproducedData,
          scheduledDate: today,
          status: TODO_STATUS.PENDING,
        })
      ).unwrap();
      toast.success("Task duplicated for today!");
      navigate("/todos");
    } catch {
      toast.error("Failed to duplicate task");
    }
  };

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

  if (!todo) {
    return (
      <PageWrapper>
        <div
          className={`border rounded-3xl p-12 text-center shadow-lg ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}
        >
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Info size={40} className="text-gray-400" />
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${THEME_CLASSES.text.primary}`}>Task Not Found</h2>
          <p className={`mb-8 ${THEME_CLASSES.text.tertiary}`}>
            The requested task could not be located in your database.
          </p>
          <button
            onClick={() => navigate("/todos")}
            className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
          >
            Back to List
          </button>
        </div>
      </PageWrapper>
    );
  }

  const statusConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
    pending: { label: "Pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", icon: Clock },
    inprogress: { label: "Working", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300", icon: Zap },
    completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", icon: CheckCircle },
  };

  const currentStatus = statusConfig[todo.status] || statusConfig.pending;
  const isCompleted = todo.status === "completed";

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
          <button
            onClick={() => navigate("/todos")}
            className={`flex items-center gap-2 font-bold text-sm transition-colors hover:text-blue-500 ${THEME_CLASSES.text.tertiary}`}
          >
            <ArrowLeft size={18} />
            BACK TO LIST
          </button>

          <div className="flex items-center gap-3">
            {!isCompleted && (
              <button
                onClick={handleMarkComplete}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
              >
                <CheckCircle size={18} />
                {todo.seriesDates && todo.seriesDates.length > 0
                  ? getNextSeriesDate(todo.seriesDates, todo.scheduledDate)
                    ? "NEXT REVIEW"
                    : "FINISH SERIES"
                  : "COMPLETE TASK"}
              </button>
            )}

            <button
              onClick={handleDuplicate}
              disabled={loading}
              className={`flex items-center justify-center p-2.5 border rounded-2xl transition-all hover:border-blue-500 hover:text-blue-500 active:scale-95 disabled:opacity-50 ${THEME_CLASSES.border.base} ${THEME_CLASSES.surface.card}`}
              title="Duplicate Task"
            >
              <Copy size={20} />
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              className="flex items-center justify-center p-2.5 bg-red-50 text-red-600 dark:bg-red-900/20 hover:bg-red-600 hover:text-white rounded-2xl transition-all active:scale-95 disabled:opacity-50"
              title="Delete Task"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div
              className={`max-w-md w-full rounded-[2.5rem] p-10 space-y-6 shadow-2xl border ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-3xl text-red-600">
                  <AlertTriangle size={32} />
                </div>
                <div className="space-y-2">
                    <h3 className={`text-2xl font-black ${THEME_CLASSES.text.primary}`}>
                      Delete Task?
                    </h3>
                    <p className={`text-sm leading-relaxed ${THEME_CLASSES.text.secondary}`}>
                      This action is irreversible. The task "{todo.title}" will be permanently removed.
                    </p>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`flex-1 px-4 py-3 rounded-2xl text-sm font-bold border ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.primary}`}
                >
                  ABORT
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-sm font-bold shadow-xl shadow-red-500/20"
                >
                  {loading ? "DELETING..." : "CONFIRM DELETE"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Main Section */}
            <div className="lg:col-span-2 space-y-8">
                <div className={`border rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-500/5 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
                    {todo.posterImage && (
                        <div className="w-full h-96 relative">
                            <img
                              src={todo.posterImage}
                              alt={todo.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-8 right-8">
                                <h2 className="text-3xl font-black text-white leading-tight drop-shadow-lg">
                                    {todo.title}
                                </h2>
                            </div>
                        </div>
                    )}

                    <div className="p-10 space-y-10">
                        {!todo.posterImage && (
                            <h2 className={`text-4xl font-black tracking-tight leading-tight ${THEME_CLASSES.text.primary}`}>
                                {todo.title}
                            </h2>
                        )}

                        {/* Status Bar */}
                        <div className="flex gap-3 flex-wrap items-center">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest ${currentStatus.color}`}>
                                <currentStatus.icon size={14} />
                                {currentStatus.label}
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-[10px] uppercase tracking-widest">
                                <Target size={14} />
                                {todo.actionType}
                            </div>
                            {todo.apply147Rule && (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-black text-[10px] uppercase tracking-widest">
                                    <Repeat size={14} />
                                    1-4-7 Rule
                                </div>
                            )}
                            {todo.recurrence && todo.recurrence !== 'none' && (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-black text-[10px] uppercase tracking-widest">
                                    <Repeat size={14} />
                                    {todo.recurrence}
                                </div>
                            )}
                        </div>

                        {/* Descriptions */}
                        {todo.descriptions.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <Info size={16} />
                                    </div>
                                    <h3 className={`text-xs font-black uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>Notes</h3>
                                </div>
                                <div className="space-y-6 pl-11">
                                    {todo.descriptions.map((desc, index) => (
                                        <p key={index} className={`text-lg leading-relaxed ${THEME_CLASSES.text.secondary}`}>
                                            {desc}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Links */}
                        {todo.links.length > 0 && (
                            <div className="space-y-6 pt-10 border-t border-dashed">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                        <LinkIcon size={16} />
                                    </div>
                                    <h3 className={`text-xs font-black uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>Links & Assets</h3>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 pl-11">
                                    {todo.links.map((link) => (
                                        <a
                                          key={link.id}
                                          href={link.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className={`block group/link border p-5 rounded-2xl transition-all hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 ${THEME_CLASSES.surface.secondary} ${THEME_CLASSES.border.base}`}
                                        >
                                          <p className={`font-bold text-sm mb-1 line-clamp-1 ${THEME_CLASSES.text.primary} group-hover/link:text-blue-500`}>
                                            {link.title}
                                          </p>
                                          <p className={`text-[10px] truncate font-mono text-blue-500 opacity-60`}>
                                            {link.url}
                                          </p>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side Column */}
            <div className="space-y-8">
                {/* Timeline Panel */}
                <div className={`border rounded-[2.5rem] p-8 shadow-sm ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                            <Calendar size={20} />
                        </div>
                        <h3 className={`text-xs font-black uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>Task Timeline</h3>
                    </div>

                    <div className="space-y-8">
                        <div className="relative pl-6 border-l-2 border-dashed border-gray-100 dark:border-gray-800">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 bg-blue-600 rounded-full border-4 border-white dark:border-gray-900 shadow-md shadow-blue-500/50" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Scheduled Date</p>
                            <p className={`text-base font-bold ${THEME_CLASSES.text.primary}`}>
                                {new Date(todo.scheduledDate).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric"
                                })}
                            </p>
                            <p className={`text-xs ${THEME_CLASSES.text.secondary}`}>
                                {new Date(todo.scheduledDate).toLocaleDateString("en-US", { weekday: "long" })}
                            </p>
                        </div>

                        {todo.seriesDates && todo.seriesDates.length > 0 && (
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                                    <Repeat size={10} /> 1-4-7 Review Schedule
                                </p>
                                <div className="grid grid-cols-1 gap-2">
                                  {todo.seriesDates.map((d, i) => {
                                    const isCurrentDate =
                                      new Date(d).toISOString() ===
                                      new Date(todo.scheduledDate).toISOString();
                                    return (
                                      <div
                                        key={i}
                                        className={`px-4 py-3 rounded-2xl border transition-all flex items-center justify-between ${
                                          isCurrentDate
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500"
                                            : `${THEME_CLASSES.border.base} ${THEME_CLASSES.text.secondary} opacity-50`
                                        }`}
                                      >
                                        <div className="flex flex-col">
                                            <span className="font-bold text-xs">{formatDate(d)}</span>
                                            <span className="uppercase tracking-widest text-[8px] font-black opacity-60">
                                              {get147Label(todo.seriesDates!, d)}
                                            </span>
                                        </div>
                                        {isCurrentDate && <CheckCircle size={14} className="text-blue-500" />}
                                      </div>
                                    );
                                  })}
                                </div>
                            </div>
                        )}
                        
                        <div className="pt-6 border-t border-dashed">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Tag size={12} className={THEME_CLASSES.text.tertiary} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>Category</span>
                                </div>
                                <span className={`text-xs font-bold text-blue-500`}>{todo.category || 'Standard'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Meta data */}
                <div className={`p-6 text-center space-y-2 opacity-50`}>
                    <p className={`text-[9px] font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>Synced ID</p>
                    <p className={`text-[9px] font-mono break-all font-medium ${THEME_CLASSES.text.tertiary}`}>{todo.id}</p>
                    <p className={`text-[9px] pt-4`}>
                        CREATED ON {new Date(todo.createdAt).toLocaleDateString()} AT {new Date(todo.createdAt).toLocaleTimeString()}
                    </p>
                </div>
            </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default TodoDetails;