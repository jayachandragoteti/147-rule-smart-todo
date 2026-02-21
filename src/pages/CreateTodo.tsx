import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { createTodo } from "../features/todos/todoThunks";
import { TODO_ACTION_TYPE, TODO_STATUS } from "../utils/todoConstants";

const CreateTodo = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const loading = useAppSelector(
    (state:any) => state.todo?.loading ?? false
  );

  const error = useAppSelector(
    (state:any) => state.todo?.error ?? null
  );

  const [scheduledDate, setScheduledDate] = useState("");
  const [title, setTitle] = useState("");
  const [descriptions, setDescriptions] = useState<string[]>([""]);
  const [posterImage, setPosterImage] = useState("");
  const [links, setLinks] = useState<{ title: string; url: string }[]>([]);
  const [apply147Rule, setApply147Rule] = useState(false);

  /* ----------------------------
     Description Handlers
  ---------------------------- */
  const addDescription = () => {
    setDescriptions((prev) => [...prev, ""]);
  };

  const updateDescription = (index: number, value: string) => {
    setDescriptions((prev) =>
      prev.map((item, i) => (i === index ? value : item))
    );
  };

  /* ----------------------------
     Link Handlers
  ---------------------------- */
  const addLink = () => {
    setLinks((prev) => [...prev, { title: "", url: "" }]);
  };

  const updateLink = (
    index: number,
    field: "title" | "url",
    value: string
  ) => {
    setLinks((prev) =>
      prev.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      )
    );
  };

  /* ----------------------------
     Submit Handler
  ---------------------------- */
  const handleSubmit = async () => {
    if (!scheduledDate || !title.trim()) {
      alert("Task Date and Title are required.");
      return;
    }
    const resultAction = await dispatch(
      createTodo({
        scheduledDate,
        title: title.trim(),
        descriptions: descriptions.filter((d) => d.trim() !== ""),
        posterImage,
        galleryImages: [],
        links: links
          .filter((l) => l.title.trim() && l.url.trim())
          .map((link, index) => ({
            id: `${Date.now()}-${index}`,
            title: link.title.trim(),
            url: link.url.trim(),
          })),
        status: TODO_STATUS.PENDING,
        actionType: TODO_ACTION_TYPE.LEARNING,
        apply147Rule,
      })
    );
    
    if (createTodo.fulfilled.match(resultAction)) {
      navigate("/todos");
    }
  };

  /* ----------------------------
     147 Preview Dates
  ---------------------------- */
const previewDates = useMemo(() => {
  if (!apply147Rule || !scheduledDate) return [];
  const base = new Date(scheduledDate);
  const day4 = new Date(base);
  day4.setDate(base.getDate() + 4);
  const day7 = new Date(base);
  day7.setDate(base.getDate() + 7);
  return [
    base.toDateString(),
    day4.toDateString(),
    day7.toDateString(),
  ];
}, [apply147Rule, scheduledDate]);
  

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto space-y-8">
        <h2 className="text-2xl font-semibold tracking-tight">
          Create New Todo
        </h2>

        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f2937] rounded-2xl p-6 space-y-6 transition-colors duration-300">

          {/* Scheduled Date */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Task Date *
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#1f2937] bg-gray-50 dark:bg-[#0f172a]"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Task Title *
            </label>
            <input
              type="text"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#1f2937] bg-gray-50 dark:bg-[#0f172a]"
            />
          </div>

          {/* Descriptions */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Descriptions</p>

            {descriptions.map((desc, index) => (
              <textarea
                key={index}
                rows={3}
                value={desc}
                onChange={(e) =>
                  updateDescription(index, e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#1f2937] bg-gray-50 dark:bg-[#0f172a]"
              />
            ))}

            <button
              type="button"
              onClick={addDescription}
              className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer"
            >
              + Add Description
            </button>
          </div>

          {/* Poster Image */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Poster Image (optional)
            </label>
            <input
              type="text"
              placeholder="Image URL"
              value={posterImage}
              onChange={(e) => setPosterImage(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#1f2937] bg-gray-50 dark:bg-[#0f172a]"
            />
          </div>

          {/* Links */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Reference Links</p>

            {links.map((link, index) => (
              <div key={index} className="grid sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Title"
                  value={link.title}
                  onChange={(e) =>
                    updateLink(index, "title", e.target.value)
                  }
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-[#1f2937] bg-gray-50 dark:bg-[#0f172a]"
                />
                <input
                  type="text"
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) =>
                    updateLink(index, "url", e.target.value)
                  }
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-[#1f2937] bg-gray-50 dark:bg-[#0f172a]"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={addLink}
              className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer"
            >
              + Add Link
            </button>
          </div>

          {/* 147 Rule */}
          <div className="flex items-center justify-between border border-gray-200 dark:border-[#1f2937] rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-medium">Apply 147 Rule</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatically repeat on day 4 and day 7.
              </p>
            </div>
            <input
              type="checkbox"
              checked={apply147Rule}
              onChange={() => setApply147Rule((prev) => !prev)}
              className="w-5 h-5 cursor-pointer"
            />
          </div>

          {/* 147 Preview */}
          {previewDates.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-sm">
              <p className="font-medium mb-2">Scheduled Dates:</p>
              <ul className="space-y-1">
                {previewDates.map((date, index) => (
                  <li key={index}>• {date}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate("/todos")}
              className="px-4 py-2 border border-gray-300 dark:border-[#1f2937] rounded-lg hover:bg-gray-100 dark:hover:bg-[#1f2937]"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {loading ? "Saving..." : "Save Task"}
            </button>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
};

export default CreateTodo;