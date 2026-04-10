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
  type LucideIcon
} from "lucide-react";
import { SOUND_OPTIONS } from "../utils/soundEngine";
import PageWrapper from "../components/layout/PageWrapper";
import { useAppSelector, useAppDispatch, useToast } from "../app/hooks";
import { updateTodo, deleteTodo, createTodo, completeTodo } from "../features/todos/todoThunks";
import { TODO_STATUS } from "../utils/todoConstants";
import { THEME_CLASSES } from "../utils/themeUtils";
import { get147Label } from "../utils/rule147";
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
      await dispatch(completeTodo(todo.id)).unwrap();
      toast.success("Task updated!");
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleReopenTask = async () => {
    if (!todo) return;
    try {
      await dispatch(
        updateTodo({ id: todo.id, updates: { status: TODO_STATUS.PENDING } })
      ).unwrap();
      toast.success("Task reopened successfully!");
    } catch {
      toast.error("Failed to reopen task");
    }
  };

  const handleDuplicate = async () => {
    if (!todo) return;
    try {
      // Re-add logic or similar
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
        <div className={`border rounded-3xl p-12 text-center shadow-lg ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <Info size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Task Not Found</h2>
          <p className="mb-8 opacity-50">The requested task could not be located.</p>
          <button onClick={() => navigate("/todos")} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold">Back to List</button>
        </div>
      </PageWrapper>
    );
  }

  const statusConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
    pending: { label: "Pending", color: "bg-amber-100 text-amber-700", icon: Clock },
    inprogress: { label: "Working", color: "bg-blue-100 text-blue-700", icon: Repeat },
    completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  };

  const currentStatus = statusConfig[todo.status] || statusConfig.pending;
  const isCompleted = todo.status === "completed";

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
          <button onClick={() => navigate("/todos")} className={`flex items-center gap-2 font-bold text-sm ${THEME_CLASSES.text.tertiary}`}>
            <ArrowLeft size={18} /> BACK
          </button>

          <div className="flex items-center gap-3">
            {!isCompleted ? (
              <button
                onClick={handleMarkComplete}
                disabled={loading}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold active:scale-95 disabled:opacity-50"
              >
                {todo.seriesDates && todo.seriesDates.length > 0 ? "NEXT REVIEW" : "COMPLETE"}
              </button>
            ) : (
              <button onClick={handleReopenTask} className="px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold active:scale-95">REOPEN</button>
            )}
            <button onClick={handleDuplicate} className="p-2.5 border rounded-xl"><Copy size={16} /></button>
            <button onClick={() => navigate(`/edit-todo/${todo.id}`)} className="p-2.5 border rounded-xl"><Edit3 size={16} /></button>
            <button onClick={() => setShowDeleteConfirm(true)} className="p-2.5 bg-red-50 text-red-500 border border-red-200 rounded-xl"><Trash2 size={16} /></button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className={`max-w-md w-full rounded-3xl p-10 space-y-6 border ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
              <div className="text-center space-y-4">
                <div className="p-4 bg-red-100 text-red-600 rounded-2xl mx-auto w-fit"><AlertTriangle size={32} /></div>
                <h3 className="text-xl font-bold">Delete Task?</h3>
                <p className="text-sm opacity-50">Task "{todo.title}" will be permanently removed.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 border rounded-xl font-bold">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold">Delete</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className={`border rounded-2xl overflow-hidden shadow-sm ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
                    {todo.posterImage && (
                        <div className="w-full h-80 relative">
                            <img src={todo.posterImage} alt={todo.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <h2 className="absolute bottom-6 left-8 text-3xl font-black text-white">{todo.title}</h2>
                        </div>
                    )}

                    <div className="p-8 space-y-8">
                        {!todo.posterImage && <h2 className="text-3xl font-bold">{todo.title}</h2>}

                        <div className="flex gap-3 flex-wrap">
                            <div className={`px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest ${currentStatus.color}`}>{currentStatus.label}</div>
                            <div className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-600 font-bold text-[10px] uppercase tracking-widest">{todo.category}</div>
                            {todo.apply147Rule && <div className="px-4 py-2 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-[10px] uppercase tracking-widest">1-4-7 Rule</div>}
                        </div>

                        {todo.descriptions.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase opacity-40">Notes</h3>
                                <div className="space-y-4 pl-4 border-l-2 border-blue-500/10">
                                    {todo.descriptions.map((desc, i) => <p key={i} className="text-lg leading-relaxed">{desc}</p>)}
                                </div>
                            </div>
                        )}

                        {todo.galleryImages && todo.galleryImages.length > 0 && (
                            <div className="space-y-4 pt-6 border-t border-dashed">
                                <h3 className="text-xs font-black uppercase opacity-40">Gallery</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {todo.galleryImages.map((img, i) => (
                                        <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border">
                                            <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button onClick={() => window.open(img, '_blank')} className="p-2 bg-white rounded-full text-black shadow-lg">
                                                    <ExternalLink size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {todo.links.length > 0 && (
                            <div className="space-y-4 pt-6 border-t border-dashed">
                                <h3 className="text-xs font-black uppercase opacity-40">Links</h3>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {todo.links.map(link => (
                                        <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="block p-4 border rounded-xl hover:border-blue-500 transition-all">
                                            <p className="font-bold text-sm truncate">{link.title}</p>
                                            <p className="text-[10px] font-mono text-blue-500 truncate">{link.url}</p>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div className={`border rounded-2xl p-6 shadow-sm ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
                    <h3 className="text-xs font-black uppercase opacity-40 mb-6 flex items-center gap-2"><Calendar size={14} /> Timeline</h3>
                    <div className="space-y-6">
                        <div className="pl-4 border-l-2 border-blue-500">
                            <p className="text-[10px] font-black uppercase text-blue-600 mb-1">Scheduled Date</p>
                            <p className="text-base font-bold">{formatDate(todo.scheduledDate)}</p>
                        </div>

                        {todo.seriesDates && todo.seriesDates.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase opacity-40">Review Schedule</p>
                                <div className="space-y-2">
                                  {todo.seriesDates.map((d, i) => {
                                    const isCurrent = new Date(d).toISOString() === new Date(todo.scheduledDate).toISOString();
                                    return (
                                      <div key={i} className={`p-3 rounded-xl border text-xs flex justify-between items-center ${isCurrent ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md ring-1 ring-blue-500' : 'opacity-40'}`}>
                                        <div className="flex flex-col">
                                          <span className="font-bold">{formatDate(d)}</span>
                                          <span className="uppercase text-[8px] font-black opacity-60">{get147Label(todo.seriesDates!, d)}</span>
                                        </div>
                                        {isCurrent && <CheckCircle size={14} />}
                                      </div>
                                    );
                                  })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {todo.reminderEnabled && (
                  <div className={`p-6 border rounded-2xl ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
                     <h3 className="text-xs font-black uppercase opacity-40 mb-4 flex items-center gap-2"><Bell size={14} /> Alert</h3>
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-bold">{SOUND_OPTIONS.find(s => s.value === todo.notificationSound)?.label || "Bell"}</span>
                        <span className="text-lg">{SOUND_OPTIONS.find(s => s.value === todo.notificationSound)?.emoji || "🔔"}</span>
                     </div>
                  </div>
                )}
            </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default TodoDetails;