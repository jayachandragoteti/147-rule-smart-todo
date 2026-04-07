import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trash2, ArrowLeft, CheckCircle, AlertTriangle, Copy } from "lucide-react";
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
          className={`border rounded-xl p-8 text-center ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.default}`}
        >
          <p className={`mb-4 ${THEME_CLASSES.text.tertiary}`}>
            Task not found (ID: {id})
          </p>
          <button
            onClick={() => navigate("/todos")}
            className={THEME_CLASSES.text.link}
          >
            Back to All Tasks
          </button>
        </div>
      </PageWrapper>
    );
  }

  const statusStyles: Record<string, string> = {
    pending:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    inprogress:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    completed:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  };

  const isCompleted = todo.status === "completed";
  const seriesLabel =
    todo.seriesDates && todo.seriesDates.length > 0
      ? get147Label(todo.seriesDates, todo.scheduledDate)
      : null;

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <button
            onClick={() => navigate("/todos")}
            className={`flex items-center gap-1.5 hover:underline text-sm ${THEME_CLASSES.text.link}`}
          >
            <ArrowLeft size={16} />
            Back to All Tasks
          </button>

          <div className="flex items-center gap-2">
            {!isCompleted && (
              <button
                onClick={handleMarkComplete}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle size={15} />
                {todo.seriesDates && todo.seriesDates.length > 0
                  ? getNextSeriesDate(todo.seriesDates, todo.scheduledDate)
                    ? "Advance"
                    : "Finish Series"
                  : "Complete"}
              </button>
            )}

            <button
              onClick={handleDuplicate}
              disabled={loading}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm transition-colors disabled:opacity-50 cursor-pointer ${THEME_CLASSES.border.default} ${THEME_CLASSES.button.hover}`}
            >
              <Copy size={15} />
              Duplicate
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
              className={`max-w-sm w-full mx-4 rounded-xl p-6 space-y-4 shadow-2xl ${THEME_CLASSES.surface.card}`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
                </div>
                <h3 className={`font-semibold ${THEME_CLASSES.text.primary}`}>
                  Delete Task?
                </h3>
              </div>
              <p className={`text-sm ${THEME_CLASSES.text.secondary}`}>
                This action cannot be undone. The task "{todo.title}" will be permanently removed.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`px-4 py-2 rounded-lg border text-sm ${THEME_CLASSES.border.default} ${THEME_CLASSES.button.hover}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Card */}
        <div
          className={`border rounded-2xl overflow-hidden shadow-sm ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.default}`}
        >
          {todo.posterImage && (
            <img
              src={todo.posterImage}
              alt={todo.title}
              className="w-full h-80 object-cover"
            />
          )}

          <div className="p-8 space-y-8">
            {/* Title & Badges */}
            <div className="space-y-4">
              <h2
                className={`text-3xl font-bold tracking-tight ${THEME_CLASSES.text.primary}`}
              >
                {todo.title}
              </h2>

              <div className="flex gap-2 flex-wrap">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider ${statusStyles[todo.status] ?? ""}`}
                >
                  {todo.status}
                </span>
                <span className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-xs px-3 py-1 rounded-full font-medium uppercase tracking-wider">
                  {todo.actionType}
                </span>
                {todo.apply147Rule && (
                  <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                    🔄 147 Rule
                  </span>
                )}
                {seriesLabel && (
                  <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                    📍 {seriesLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Series Dates Timeline */}
            {todo.seriesDates && todo.seriesDates.length > 0 && (
              <div
                className={`bg-gray-50 dark:bg-gray-900/40 rounded-xl p-5 border ${THEME_CLASSES.border.default}`}
              >
                <h3
                  className={`text-sm font-semibold mb-4 uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}
                >
                  Series Progress
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {todo.seriesDates.map((d, i) => {
                    const isCurrentDate =
                      new Date(d).toISOString() ===
                      new Date(todo.scheduledDate).toISOString();
                    return (
                      <div
                        key={i}
                        className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                          isCurrentDate
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 font-bold"
                            : `${THEME_CLASSES.border.default} ${THEME_CLASSES.text.secondary} opacity-60`
                        }`}
                      >
                        <div className="uppercase tracking-tighter text-[9px] mb-0.5 opacity-70">
                          {get147Label(todo.seriesDates!, d)}
                        </div>
                        <div>{formatDate(d)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Descriptions */}
            {todo.descriptions.length > 0 && (
              <div className="space-y-4">
                <h3
                  className={`text-sm font-semibold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}
                >
                  Details
                </h3>
                <div className="space-y-4">
                  {todo.descriptions.map((desc, index) => (
                    <p
                      key={index}
                      className={`leading-relaxed text-base ${THEME_CLASSES.text.secondary}`}
                    >
                      {desc}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {todo.links.length > 0 && (
              <div className="space-y-4">
                <h3
                  className={`text-sm font-semibold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}
                >
                  Reference Resources
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {todo.links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`block group/link border p-4 rounded-xl transition-all hover:border-blue-400 hover:shadow-md ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.default}`}
                    >
                      <p className={`font-semibold text-sm mb-1 ${THEME_CLASSES.text.primary} group-hover/link:text-blue-500`}>
                        {link.title}
                      </p>
                      <p
                        className={`text-xs truncate font-mono ${THEME_CLASSES.text.tertiary}`}
                      >
                        {link.url}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Meta row */}
            <div className={`grid grid-cols-2 gap-8 pt-6 border-t ${THEME_CLASSES.divider.default}`}>
                <div>
                    <h4 className={`text-xs font-semibold uppercase tracking-widest mb-2 ${THEME_CLASSES.text.tertiary}`}>Scheduled</h4>
                    <p className={`text-sm font-medium ${THEME_CLASSES.text.secondary}`}>
                        {new Date(todo.scheduledDate).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric"
                        })}
                    </p>
                </div>
                <div>
                    <h4 className={`text-xs font-semibold uppercase tracking-widest mb-2 ${THEME_CLASSES.text.tertiary}`}>Task ID</h4>
                    <p className={`text-xs font-mono truncate ${THEME_CLASSES.text.tertiary}`}>{todo.id}</p>
                </div>
            </div>

            <div className={`pt-4 text-[10px] uppercase tracking-widest text-center ${THEME_CLASSES.text.tertiary}`}>
                Created on {new Date(todo.createdAt).toLocaleDateString()} at {new Date(todo.createdAt).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default TodoDetails;