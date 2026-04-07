import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { createTodo } from "../features/todos/todoThunks";
import { TODO_ACTION_TYPE, TODO_STATUS } from "../utils/todoConstants";
import { VALIDATION, FORM_MESSAGES } from "../utils/constants";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import type { CreateTodoFormValues } from "../types/todo";
import { useState } from "react";
import { THEME_CLASSES } from "../utils/themeUtils";
import { generate147Dates, RULE_147_LABELS } from "../utils/rule147";

const CreateTodo = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  const loading = useAppSelector((state) => state.todo.loading);
  const error = useAppSelector((state) => state.todo.error);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateTodoFormValues>({
    defaultValues: {
      scheduledDate: "",
      title: "",
      descriptions: [],
      posterImage: "",
      links: [],
      apply147Rule: false,
    },
  });

  const {
    fields: descFields,
    append: appendDesc,
    remove: removeDesc,
  } = useFieldArray({ control, name: "descriptions" });

  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({ control, name: "links" });

  /* ----------------------------
     Image URL Handler & Validation
  ---------------------------- */
  const posterImageUrl = useWatch({ control, name: "posterImage" });

  const validateImageUrl = (url: string) => {
    if (!url) return true;
    if (!VALIDATION.URL_PATTERN.test(url)) {
      return FORM_MESSAGES.INVALID_URL;
    }
    return true;
  };

  const handleImageUrlChange = (url: string) => {
    setImageLoadError(false);
    setValue("posterImage", url, { shouldValidate: true });
    if (url && VALIDATION.URL_PATTERN.test(url)) {
      const img = new Image();
      img.onload = () => setImagePreview(url);
      img.onerror = () => setImageLoadError(true);
      img.src = url;
    } else {
      setImagePreview(null);
    }
  };

  const toast = useToast();

  /* ----------------------------
     Submit Handler
  ---------------------------- */
  const onSubmit = async (data: CreateTodoFormValues) => {
    const resultAction = await dispatch(
      createTodo({
        scheduledDate: data.scheduledDate,
        title: data.title.trim(),
        descriptions: data.descriptions
          .map((d) => d.value)
          .filter((d) => d.trim() !== ""),
        posterImage: data.posterImage || undefined,
        galleryImages: [],
        links: data.links
          .filter((l) => l.title.trim() && l.url.trim())
          .map((link, index) => ({
            id: `${Date.now()}-${index}`,
            title: link.title.trim(),
            url: link.url.trim(),
          })),
        status: TODO_STATUS.PENDING,
        actionType: TODO_ACTION_TYPE.LEARNING,
        apply147Rule: data.apply147Rule,
      })
    );
    if (createTodo.fulfilled.match(resultAction)) {
      toast.success("Task created successfully!");
      navigate("/todos");
    } else {
      toast.error("Failed to create task");
    }
  };

  /* ----------------------------
     147 Preview Dates
  ---------------------------- */
  const scheduledDateValue = useWatch({ control, name: "scheduledDate" });
  const apply147Value = useWatch({ control, name: "apply147Rule" });

  let previewDates: { label: string; date: string }[] = [];
  if (apply147Value && scheduledDateValue) {
    const base = new Date(scheduledDateValue);
    const dates = generate147Dates(base);
    previewDates = dates.map((d, i) => ({
      label: RULE_147_LABELS[i],
      date: new Date(d).toDateString(),
    }));
  }

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto space-y-8">
        <h2
          className={`text-2xl font-semibold tracking-tight ${THEME_CLASSES.text.primary}`}
        >
          Create New Todo
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`border rounded-2xl p-6 space-y-6 transition-colors duration-300 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.default}`}
        >
          {/* Scheduled Date */}
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${THEME_CLASSES.text.primary}`}
            >
              Task Date *
            </label>
            <input
              type="date"
              {...register("scheduledDate", {
                required: FORM_MESSAGES.REQUIRED_DATE,
              })}
              className={`w-full px-4 py-2 rounded-lg border ${THEME_CLASSES.input.base}`}
            />
            {errors.scheduledDate && (
              <p className="text-xs text-red-500 mt-1">
                {errors.scheduledDate.message}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${THEME_CLASSES.text.primary}`}
            >
              Task Title *
            </label>
            <input
              type="text"
              placeholder="Enter task title"
              {...register("title", {
                required: FORM_MESSAGES.REQUIRED_TITLE,
                minLength: {
                  value: VALIDATION.TITLE_MIN_LENGTH,
                  message: FORM_MESSAGES.MIN_TITLE,
                },
              })}
              className={`w-full px-4 py-2 rounded-lg border ${THEME_CLASSES.input.base}`}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Descriptions */}
          <div className="space-y-3">
            <p
              className={`text-sm font-medium ${THEME_CLASSES.text.primary}`}
            >
              Descriptions
            </p>

            {descFields.map((field, index) => (
              <div key={field.id} className="relative">
                <textarea
                  rows={3}
                  {...register(`descriptions.${index}.value` as const)}
                  placeholder="Add a description paragraph..."
                  className={`w-full px-4 py-2 rounded-lg border ${THEME_CLASSES.input.base}`}
                />
                <button
                  type="button"
                  onClick={() => removeDesc(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => appendDesc({ value: "" })}
              className={`text-sm cursor-pointer ${THEME_CLASSES.text.link}`}
            >
              + Add Description
            </button>
          </div>

          {/* Poster Image */}
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${THEME_CLASSES.text.primary}`}
            >
              Poster Image (optional)
            </label>
            <input
              type="url"
              placeholder="Image URL (e.g., https://example.com/image.jpg)"
              {...register("posterImage", {
                validate: validateImageUrl,
                onChange: (e) => handleImageUrlChange(e.target.value),
              })}
              className={`w-full px-4 py-2 rounded-lg border ${THEME_CLASSES.input.base}`}
            />
            {errors.posterImage && (
              <p className="text-xs text-red-500 mt-1">
                {errors.posterImage.message}
              </p>
            )}
            {posterImageUrl && imageLoadError && (
              <p className="text-xs text-red-500 mt-1">
                ⚠️ Image URL is not accessible. Check the URL and try again.
              </p>
            )}
            {imagePreview && !imageLoadError && (
              <div className="mt-3">
                <p className={`text-xs mb-2 ${THEME_CLASSES.text.tertiary}`}>
                  ✓ Image Preview:
                </p>
                <img
                  src={imagePreview}
                  alt="Poster preview"
                  className={`max-w-xs h-auto rounded-lg border ${THEME_CLASSES.border.default}`}
                />
              </div>
            )}
          </div>

          {/* Links */}
          <div className="space-y-3">
            <p
              className={`text-sm font-medium ${THEME_CLASSES.text.primary}`}
            >
              Reference Links
            </p>

            {linkFields.map((field, index) => (
              <div key={field.id} className="space-y-2">
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Title"
                    {...register(`links.${index}.title` as const, {
                      minLength: {
                        value: VALIDATION.LINK_TITLE_MIN_LENGTH,
                        message: FORM_MESSAGES.MIN_LINK_TITLE,
                      },
                    })}
                    className={`px-4 py-2 rounded-lg border ${THEME_CLASSES.input.base}`}
                  />
                  <input
                    type="text"
                    placeholder="URL (e.g., https://example.com)"
                    {...register(`links.${index}.url` as const, {
                      pattern: {
                        value: VALIDATION.URL_PATTERN,
                        message: FORM_MESSAGES.INVALID_URL,
                      },
                    })}
                    className={`px-4 py-2 rounded-lg border ${THEME_CLASSES.input.base}`}
                  />
                </div>
                {(errors.links?.[index]?.title ||
                  errors.links?.[index]?.url) && (
                  <div className="text-xs space-y-1">
                    {errors.links?.[index]?.title && (
                      <p className="text-red-500">
                        {errors.links[index].title?.message}
                      </p>
                    )}
                    {errors.links?.[index]?.url && (
                      <p className="text-red-500">
                        {errors.links[index].url?.message}
                      </p>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeLink(index)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Remove Link
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => appendLink({ title: "", url: "" })}
              className={`text-sm cursor-pointer ${THEME_CLASSES.text.link}`}
            >
              + Add Link
            </button>
          </div>

          {/* 147 Rule */}
          <div
            className={`flex items-center justify-between border rounded-lg px-4 py-3 ${THEME_CLASSES.border.default}`}
          >
            <div>
              <p
                className={`text-sm font-medium ${THEME_CLASSES.text.primary}`}
              >
                Apply 147 Rule
              </p>
              <p className={`text-xs ${THEME_CLASSES.text.tertiary}`}>
                Automatically repeat on day 1, day 4, and day 7 for spaced
                repetition.
              </p>
            </div>
            <input
              type="checkbox"
              {...register("apply147Rule")}
              className="w-5 h-5 cursor-pointer accent-purple-600"
            />
          </div>

          {/* 147 Preview */}
          {previewDates.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-sm">
              <p className="font-medium mb-2 text-purple-800 dark:text-purple-200">
                📅 Scheduled Dates (1-4-7 Rule):
              </p>
              <ul className="space-y-1">
                {previewDates.map(({ label, date }, index) => (
                  <li
                    key={index}
                    className="text-purple-700 dark:text-purple-300"
                  >
                    <span className="font-medium">{label}:</span> {date}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/todos")}
              className={`px-4 py-2 border rounded-lg cursor-pointer ${THEME_CLASSES.border.default} ${THEME_CLASSES.button.hover}`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors cursor-pointer"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Saving..." : "Save Task"}
            </button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
};

export default CreateTodo;