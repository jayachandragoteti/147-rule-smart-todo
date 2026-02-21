import { useNavigate, useParams } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import { useAppSelector } from "../app/hooks";
import { useAppDispatch } from "../app/hooks";
import { updateTodo } from "../features/todos/todoThunks";
import { TODO_STATUS } from "../utils/todoConstants";

const TodoDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const todos = useAppSelector((state) => state.todo.todos);
  const todo = todos.find((t) => t.id === id);
  const dispatch = useAppDispatch();

  const handleMarkComplete = async () => {
    if (!todo) return;
    try {
      // If todo stores seriesDates (single doc series), advance to next date
      if (todo.seriesDates && todo.seriesDates.length > 0) {
        const normalized = todo.seriesDates.map((d) => new Date(d).toISOString());
        const currentISO = new Date(todo.scheduledDate).toISOString();
        const idx = normalized.indexOf(currentISO);
        if (idx >= 0 && idx < normalized.length - 1) {
          const next = normalized[idx + 1];
          await dispatch(updateTodo({ id: todo.id, updates: { scheduledDate: next, status: TODO_STATUS.PENDING } })).unwrap();
          return;
        }

        // Last in series -> mark completed and disable 147
        await dispatch(updateTodo({ id: todo.id, updates: { status: TODO_STATUS.COMPLETED, apply147Rule: false } })).unwrap();
        return;
      }

      // Regular todo (no seriesDates) -> mark completed
      await dispatch(updateTodo({ id: todo.id, updates: { status: TODO_STATUS.COMPLETED } })).unwrap();
    } catch (err) {
      // ignore for now; slice will show error
      // console.error(err);
    }
  };

  if (!todo) {
    return (
      <PageWrapper>
        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f2937] rounded-xl p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Task not found (ID: {id})
          </p>
          <button
            onClick={() => navigate("/todos")}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to All Tasks
          </button>
        </div>
      </PageWrapper>
    );
  }

  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    inprogress: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  };

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/todos")}
          className="mb-6 text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          ← Back to All Tasks
        </button>

        <div className="flex justify-end mb-4">
          <button
            onClick={handleMarkComplete}
            className="px-3 py-1 bg-green-600 text-white rounded-md text-sm"
          >
            Mark Complete
          </button>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f2937] rounded-2xl overflow-hidden">

          {todo.posterImage && (
            <img
              src={todo.posterImage}
              alt={todo.title}
              className="w-full h-80 object-cover"
            />
          )}

          <div className="p-8 space-y-6">

            <div>
              <h2 className="text-3xl font-semibold mb-4">
                {todo.title}
              </h2>

              {/* Status, Action Type, and 147 Rule */}
              <div className="flex gap-3 flex-wrap">
                <span className={`text-sm px-3 py-1 rounded-md ${statusStyles[todo.status]}`}>
                  {todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}
                </span>
                <span className="bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300 text-sm px-3 py-1 rounded-md">
                  {todo.actionType.charAt(0).toUpperCase() + todo.actionType.slice(1)}
                </span>
                {todo.apply147Rule && (
                  <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 text-sm px-3 py-1 rounded-md">
                    🔄 147 Rule Active
                  </span>
                )}
                {todo.seriesDates && todo.seriesDates.length > 0 && (
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm px-3 py-1 rounded-md">
                    <div className="font-medium">Series occurrences</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {todo.seriesDates.map((d, i) => (
                        <span key={i} className="inline-block mr-2">{new Date(d).toLocaleDateString()}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Descriptions */}
            {todo.descriptions.length > 0 && (
              <div className="border-t border-gray-200 dark:border-[#1f2937] pt-6">
                <h3 className="font-semibold mb-4">Description</h3>
                <div className="space-y-4">
                  {todo.descriptions.map((desc, index) => (
                    <p key={index} className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {desc}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {todo.links.length > 0 && (
              <div className="border-t border-gray-200 dark:border-[#1f2937] pt-6">
                <h3 className="font-semibold mb-4">References</h3>
                <div className="space-y-2">
                  {todo.links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-blue-600 dark:text-blue-400 hover:underline text-sm p-3 bg-gray-50 dark:bg-[#0f172a] rounded-lg"
                    >
                      <p className="font-medium">{link.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{link.url}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {todo.galleryImages.length > 0 && (
              <div className="border-t border-gray-200 dark:border-[#1f2937] pt-6">
                <h3 className="font-semibold mb-4">Gallery</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {todo.galleryImages.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt="gallery"
                      className="rounded-lg object-cover h-32 w-full hover:opacity-90 transition-opacity"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Schedule Info */}
            <div className="border-t border-gray-200 dark:border-[#1f2937] pt-6">
              <h3 className="font-semibold mb-2">Schedule</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scheduled: {new Date(todo.scheduledDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {todo.dueDate && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Due: {new Date(todo.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
            {/* Created Info */}
            <div className="border-t border-gray-200 dark:border-[#1f2937] pt-6 text-xs text-gray-500 dark:text-gray-400">
              <p>Created: {new Date(todo.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default TodoDetails;