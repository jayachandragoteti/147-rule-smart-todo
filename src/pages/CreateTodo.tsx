import { useNavigate, useParams } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import { useAppDispatch, useAppSelector, useToast } from "../app/hooks";
import { createTodo, updateTodo } from "../features/todos/todoThunks";
import { TODO_ACTION_TYPE, TODO_STATUS } from "../utils/todoConstants";
import { VALIDATION, FORM_MESSAGES } from "../utils/constants";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import type { CreateTodoFormValues, TodoPriority, TodoRecurrence, NotificationSound, TodoStatus, TodoActionType } from "../types/todo";
import { SOUND_OPTIONS, previewSound } from "../utils/soundEngine";
import { useState, useEffect, type ReactNode } from "react";
import { THEME_CLASSES } from "../utils/themeUtils";
import { generate137Dates, RULE_137_LABELS } from "../utils/rule137";
import { 
  Clock, Tag, Flag, Bell, Repeat, Plus, Trash2, Calendar, RefreshCcw, AlertCircle, Volume2, ImageIcon,
  type LucideIcon 
} from "lucide-react";

const CreateTodo = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  const loading = useAppSelector((state) => state.todo.loading);
  const error = useAppSelector((state) => state.todo.error);
  const todos = useAppSelector((state) => state.todo.todos);
  const editModeTodo = id ? todos.find((t) => t.id === id) : null;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateTodoFormValues>({
    defaultValues: {
      scheduledDate: new Date().toISOString().split("T")[0],
      scheduledTime: "09:00",
      title: "",
      descriptions: [{ value: "" }],
      posterImage: "",
      links: [],
      apply137Rule: false,
      priority: "medium",
      category: "Personal",
      recurrence: "none",
      reminderEnabled: true,
      notificationSound: "bell" as NotificationSound,
      assignTo: "",
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

  useEffect(() => {
    if (editModeTodo) {
      reset({
        scheduledDate: editModeTodo.scheduledDate ? new Date(editModeTodo.scheduledDate).toISOString().split("T")[0] : "",
        scheduledTime: editModeTodo.scheduledTime || "",
        title: editModeTodo.title || "",
        descriptions: editModeTodo.descriptions?.length ? editModeTodo.descriptions.map(d => ({ value: d })) : [{ value: "" }],
        posterImage: editModeTodo.posterImage || "",
        links: editModeTodo.links || [],
        apply137Rule: editModeTodo.apply137Rule || false,
        priority: editModeTodo.priority || "medium",
        category: editModeTodo.category || "Personal",
        recurrence: editModeTodo.recurrence || "none",
        reminderEnabled: editModeTodo.reminderEnabled ?? true,
        notificationSound: editModeTodo.notificationSound ?? "bell",
        assignTo: editModeTodo.assignTo || "",
      });
      if (editModeTodo.posterImage) {
          handleImageUrlChange(editModeTodo.posterImage);
      }
    }
  }, [editModeTodo, reset]);

  const posterImageUrl = useWatch({ control, name: "posterImage" });

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

  useEffect(() => {
    if (posterImageUrl) {
      handleImageUrlChange(posterImageUrl);
    }
  }, [posterImageUrl]);

  const validateImageUrl = (url: string) => {
    if (!url) return true;
    if (!VALIDATION.URL_PATTERN.test(url)) {
      return FORM_MESSAGES.INVALID_URL;
    }
    return true;
  };

  const onSubmit = async (data: CreateTodoFormValues) => {
    const timestamp = Date.now();
    const todoData = {
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        title: data.title.trim(),
        descriptions: data.descriptions
          .map((d) => d.value)
          .filter((d) => d.trim() !== ""),
        posterImage: data.posterImage && data.posterImage.trim() ? data.posterImage.trim() : "",
        links: data.links
          .filter((l) => l.title.trim() && l.url.trim())
          .map((link, index) => ({
            id: `${timestamp}-${index}`,
            title: link.title.trim(),
            url: link.url.trim(),
          })),
        apply137Rule: data.apply137Rule,
        priority: data.priority,
        category: data.category,
        recurrence: data.recurrence,
        reminderEnabled: data.reminderEnabled,
        notificationSound: data.notificationSound ?? "bell",
        assignTo: data.assignTo?.trim() || "",
    };

    if (id) {
       // Update mode
       const resultAction = await dispatch(updateTodo({ id, updates: todoData }));
       if (updateTodo.fulfilled.match(resultAction)) {
           toast.success("Task updated successfully!");
           navigate(`/todo/${id}`);
       } else {
           toast.error("Failed to update task");
       }
    } else {
       // Create mode
        const createPayload = {
          ...todoData,
          galleryImages: [],
          status: TODO_STATUS.PENDING as TodoStatus,
          actionType: TODO_ACTION_TYPE.LEARNING as TodoActionType,
          order: timestamp,
        };
       const resultAction = await dispatch(createTodo(createPayload));
       if (createTodo.fulfilled.match(resultAction)) {
         toast.success("Task created successfully!");
         navigate("/todos");
       } else {
         toast.error("Failed to create task");
       }
    }
  };

  const scheduledDateValue = useWatch({ control, name: "scheduledDate" });
  const apply137Value = useWatch({ control, name: "apply137Rule" });
  const recurrenceValue = useWatch({ control, name: "recurrence" });

  let previewDates: { label: string; date: string }[] = [];
  if (apply137Value && scheduledDateValue) {
    const base = new Date(scheduledDateValue);
    const dates = generate137Dates(base);
    previewDates = dates.map((d, i) => ({
      label: RULE_137_LABELS[i],
      date: new Date(d).toDateString(),
    }));
  }

  const categories = ["Personal", "Work", "Learning", "Health", "Finances", "Projects"];
  const priorities: { value: TodoPriority; label: string; color: string }[] = [
    { value: "low", label: "Low", color: "text-gray-500" },
    { value: "medium", label: "Medium", color: "text-blue-500" },
    { value: "high", label: "High", color: "text-orange-500" },
    { value: "urgent", label: "Urgent", color: "text-red-500" },
  ];

  const recurrences: { value: TodoRecurrence; label: string; icon: LucideIcon; color: string }[] = [
    { value: "none", label: "Once", icon: Calendar, color: "bg-gray-500" },
    { value: "daily", label: "Daily", icon: RefreshCcw, color: "bg-emerald-500" },
    { value: "weekly", label: "Weekly", icon: RefreshCcw, color: "bg-blue-500" },
    { value: "monthly", label: "Monthly", icon: RefreshCcw, color: "bg-purple-500" },
  ];

  const watchPriority = useWatch({ control, name: "priority" });
  const watchReminder = useWatch({ control, name: "reminderEnabled" });
  const watchSound = useWatch({ control, name: "notificationSound" });

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col gap-2">
            <h2 className={`text-2xl font-bold tracking-tight ${THEME_CLASSES.text.primary}`}>
              {id ? "Edit Task" : "Create New Task"}
            </h2>
            <p className={`text-sm ${THEME_CLASSES.text.secondary}`}>{id ? "Update your task details below." : "Fill in the details to add a task to your schedule."}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className={`lg:col-span-2 space-y-5 p-5 border rounded-xl shadow-sm ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
            {/* Title */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${THEME_CLASSES.text.tertiary}`}>
                Task Title
              </label>
              <input
                type="text"
                placeholder="What needs to be done?"
                {...register("title", {
                  required: FORM_MESSAGES.REQUIRED_TITLE,
                  minLength: { value: VALIDATION.TITLE_MIN_LENGTH, message: FORM_MESSAGES.MIN_TITLE },
                })}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm shadow-sm focus:ring-[3px] focus:ring-blue-500/10 transition-all ${THEME_CLASSES.input.base} ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && <p className="text-xs text-red-500 mt-2 ml-1 font-medium">{errors.title.message as ReactNode}</p>}
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2 ${THEME_CLASSES.text.tertiary}`}>
                    <Clock size={14} /> Scheduled Date
                  </label>
                  <input
                    type="date"
                    {...register("scheduledDate", { required: FORM_MESSAGES.REQUIRED_DATE })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm shadow-sm focus:ring-[3px] focus:ring-blue-500/10 transition-all ${THEME_CLASSES.input.base}`}
                  />
                </div>
                <div>
                  <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2 ${THEME_CLASSES.text.tertiary}`}>
                    <Clock size={14} /> Time
                  </label>
                  <input
                    type="time"
                    {...register("scheduledTime")}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm shadow-sm focus:ring-[3px] focus:ring-blue-500/10 transition-all ${THEME_CLASSES.input.base}`}
                  />
                </div>
            </div>

            {/* Descriptions */}
            <div className="space-y-3">
              <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 ${THEME_CLASSES.text.tertiary}`}>
                Notes & Details
              </label>
              {descFields.map((field, index) => (
                <div key={field.id} className="relative group">
                  <textarea
                    rows={2}
                    {...register(`descriptions.${index}.value` as const)}
                    placeholder="Add a detail..."
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm shadow-sm transition-all focus:ring-[3px] focus:ring-blue-500/10 ${THEME_CLASSES.input.base}`}
                  />
                  {index > 0 && (
                    <button
                        type="button"
                        onClick={() => removeDesc(index)}
                        className="absolute -right-3 -top-3 p-1.5 bg-red-100 dark:bg-red-900/40 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                        <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendDesc({ value: "" })}
                className={`flex items-center gap-2 text-sm font-semibold py-2 px-1 hover:gap-3 transition-all ${THEME_CLASSES.text.link}`}
              >
                <Plus size={16} /> Add Another Point
              </button>
            </div>

            {/* posterImage */}
            <div className="space-y-3">
              <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 ${THEME_CLASSES.text.tertiary}`}>
                <ImageIcon size={14} /> Task Image URL
              </label>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  {...register("posterImage", { validate: validateImageUrl })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm shadow-sm transition-all focus:ring-[3px] focus:ring-blue-500/10 ${THEME_CLASSES.input.base} ${errors.posterImage ? 'border-red-500' : ''}`}
                />
                {errors.posterImage && <p className="text-xs text-red-500 ml-1 font-medium">{errors.posterImage.message as ReactNode}</p>}
                
                {imagePreview && !imageLoadError && (
                  <div className="relative group w-full aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-inner">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-black uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">Image Found</span>
                    </div>
                  </div>
                )}
                {imageLoadError && posterImageUrl && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                    <AlertCircle size={14} /> Failed to load image
                  </div>
                )}
              </div>
            </div>

            {/* Links */}
            <div className="space-y-3">
              <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 ${THEME_CLASSES.text.tertiary}`}>
                Reference Links
              </label>
              {linkFields.map((field, index) => (
                <div key={field.id} className="p-3 border rounded-xl flex flex-col sm:flex-row gap-2 relative group bg-gray-50/50 dark:bg-gray-800/20 border-dashed">
                  <input
                    type="text"
                    placeholder="Label"
                    {...register(`links.${index}.title` as const)}
                    className={`flex-1 px-3 py-2 rounded-lg border-none bg-white dark:bg-gray-800 text-sm ${THEME_CLASSES.text.primary}`}
                  />
                  <input
                    type="text"
                    placeholder="URL"
                    {...register(`links.${index}.url` as const)}
                    className={`flex-[2] px-3 py-2 rounded-lg border-none bg-white dark:bg-gray-800 text-sm ${THEME_CLASSES.text.primary}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendLink({ title: "", url: "" })}
                className={`flex items-center gap-2 text-sm font-semibold py-2 px-1 hover:gap-3 transition-all ${THEME_CLASSES.text.link}`}
              >
                <Plus size={16} /> Add Reference Link
              </button>
            </div>
          </div>

          {/* Sidebar Config */}
          <div className="space-y-6">
             {/* Category & Priority */}
             <div className={`p-5 border rounded-xl shadow-sm space-y-5 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
                <div>
                  <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3 ${THEME_CLASSES.text.tertiary}`}>
                    <Tag size={14} /> Category
                  </label>
                  <select
                    {...register("category")}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm shadow-sm transition-all focus:ring-[3px] focus:ring-blue-500/10 ${THEME_CLASSES.input.base}`}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3 ${THEME_CLASSES.text.tertiary}`}>
                    <Flag size={14} /> Priority Level
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {priorities.map(({ value, label, color }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setValue("priority", value)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                          watchPriority === value
                            ? `${color} border-current bg-current/5 ring-1 ring-current`
                            : `${THEME_CLASSES.border.base} ${THEME_CLASSES.text.secondary} opacity-60`
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
             </div>

              {/* Smart Features */}
             <div className={`p-5 border rounded-xl shadow-sm space-y-4 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
                <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 ${THEME_CLASSES.text.tertiary}`}>
                  Productivity Rules
                </label>
                
                {/* Recurrence Dropdown */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {recurrences.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setValue("recurrence", r.value)}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                          recurrenceValue === r.value
                            ? "bg-blue-500/10 border-blue-500 text-blue-600 ring-1 ring-blue-500"
                            : THEME_CLASSES.border.base
                        }`}
                      >
                        <r.icon size={14} />
                        <span className="text-xs font-bold">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 137 Rule */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setValue("apply137Rule", !apply137Value)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      apply137Value ? "bg-purple-100/50 dark:bg-purple-900/10 border-purple-500 ring-1 ring-purple-500" : THEME_CLASSES.border.base
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${apply137Value ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <Repeat size={16} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${apply137Value ? 'text-purple-700 dark:text-purple-300' : THEME_CLASSES.text.primary}`}>1-3-7 Rule</p>
                      <p className={`text-[10px] leading-tight ${THEME_CLASSES.text.tertiary}`}>Spaced repetition for retention.</p>
                    </div>
                  </button>

                  {/* 137 Previews */}
                  {apply137Value && previewDates.length > 0 && (
                    <div className="px-2 pt-1 space-y-2">
                      <div className="grid gap-2">
                        {previewDates.map((pd, i) => (
                          <div key={i} className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700">
                            <span className="font-bold opacity-60">{pd.label}</span>
                            <span className={`font-black ${THEME_CLASSES.text.primary}`}>{pd.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reminders */}
                <button
                  type="button"
                  onClick={() => setValue("reminderEnabled", !watchReminder)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    watchReminder ? "bg-amber-100/50 dark:bg-amber-900/10 border-amber-500 ring-1 ring-amber-500" : THEME_CLASSES.border.base
                  }`}
                >
                  <div className={`p-2 rounded-lg ${watchReminder ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <Bell size={16} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${watchReminder ? 'text-amber-700 dark:text-amber-300' : THEME_CLASSES.text.primary}`}>Notifications</p>
                    <p className={`text-[10px] leading-tight ${THEME_CLASSES.text.tertiary}`}>Get alerted when it's time.</p>
                  </div>
                </button>

                {/* ── Notification Sound Picker (shown when reminder is on) ── */}
                {watchReminder && (
                  <div className="space-y-2">
                    <label className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>
                      <Volume2 size={10} /> Notification Sound
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {SOUND_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setValue("notificationSound", opt.value as NotificationSound);
                            previewSound(opt.value);
                          }}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all active:scale-95 ${
                            watchSound === opt.value
                              ? "bg-amber-50 dark:bg-amber-900/10 border-amber-500 ring-1 ring-amber-500"
                              : `${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover}`
                          }`}
                        >
                          <span className="text-base leading-none">{opt.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold truncate ${
                              watchSound === opt.value ? "text-amber-700 dark:text-amber-300" : THEME_CLASSES.text.primary
                            }`}>{opt.label}</p>
                            <p className={`text-[9px] truncate ${THEME_CLASSES.text.tertiary}`}>{opt.description}</p>
                          </div>
                          {watchSound === opt.value && (
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                    <p className={`text-[9px] ${THEME_CLASSES.text.tertiary}`}>Click to preview · Selected plays on reminder</p>
                  </div>
                )}

                {/* Collaboration */}
                <div className="space-y-3 pt-2">
                  <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 ${THEME_CLASSES.text.tertiary}`}>
                    Assign To
                  </label>
                  <input
                    type="text"
                    placeholder="teammate@company.com..."
                    {...register("assignTo")}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm shadow-sm transition-all focus:ring-[3px] focus:ring-blue-500/10 ${THEME_CLASSES.input.base}`}
                  />
                  <p className={`text-[10px] leading-tight ${THEME_CLASSES.text.tertiary}`}>Assign this task to another user via email.</p>
                </div>
             </div>

             {/* Error Display */}
             {error && (
                <div className="p-4 rounded-xl bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold leading-relaxed">
                   <div className="flex items-center gap-2 mb-1">
                      <AlertCircle size={14} className="shrink-0" />
                      <span className="uppercase tracking-widest text-[10px]">Error</span>
                   </div>
                   {error}
                </div>
             )}

             {/* Action Buttons */}
             <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 disabled:opacity-50"
                >
                  {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? (id ? "Updating..." : "Creating...") : (id ? "Update Action" : "Deploy Task")}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className={`flex-1 py-3 px-6 rounded-xl font-bold border transition-all hover:shadow-md ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base} ${THEME_CLASSES.text.secondary}`}
                >
                  Discard
                </button>
             </div>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
};

export default CreateTodo;