import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Calendar as CalendarIcon,
  Edit3,
  Tag,
  Clock,
  ChevronLeft,
  ChevronRight,
  Heart,
  Link as LinkIcon,
  Trash2,
  BookOpen,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
} from "date-fns";
import PageWrapper from "../components/layout/PageWrapper";
import { useAppDispatch, useAppSelector, useToast } from "../app/hooks";
import {
  fetchJournalEntries,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "../features/journal/journalSlice";
import { THEME_CLASSES } from "../utils/themeUtils";
import type { JournalEntry, CreateJournalFormValues } from "../types";

// Optional mood emojis
const MOODS = ["😊", "😐", "😔", "🔥", "✨", "🌧️", "💪"];

const Diary = () => {
  const dispatch = useAppDispatch();
  const toast    = useToast();
  const { entries, loading } = useAppSelector((s) => s.journal);
  const user     = useAppSelector((s) => s.auth.user);
  const todos    = useAppSelector((s) => s.todo.todos);

  const [searchQuery,      setSearchQuery]      = useState("");
  const [selectedDate,     setSelectedDate]     = useState(new Date());
  const [isAdding,         setIsAdding]         = useState(false);
  const [editingEntry,     setEditingEntry]     = useState<JournalEntry | null>(null);
  const [showDeleteConfirm,setShowDeleteConfirm]= useState<string | null>(null);
  const [currentMonth,     setCurrentMonth]     = useState(new Date());

  // Form state
  const [title,           setTitle]           = useState("");
  const [content,         setContent]         = useState("");
  const [selectedTodoIds, setSelectedTodoIds] = useState<string[]>([]);
  const [mood,            setMood]            = useState<string>("");

  useEffect(() => {
    if (user) dispatch(fetchJournalEntries(user.uid));
  }, [user, dispatch]);

  const filteredEntries = useMemo(() => {
    let result = [...entries];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) => e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, searchQuery]);

  const selectedEntry = useMemo(
    () => entries.find((e) => isSameDay(new Date(e.date), selectedDate)),
    [entries, selectedDate]
  );

  const handleSave = async () => {
    if (!user) return;
    if (!title.trim() && !content.trim()) {
      toast.error("Please add a title or some content");
      return;
    }

    const data: CreateJournalFormValues = {
      title:   title || "New Entry",
      content: mood ? `${mood} ${content}` : content,
      date:    selectedDate.toISOString(),
      todoIds: selectedTodoIds,
    };

    try {
      if (editingEntry || selectedEntry) {
        const id = editingEntry?.id || selectedEntry?.id;
        if (id) {
          await dispatch(updateJournalEntry({ id, userId: user.uid, data })).unwrap();
          toast.success("Entry updated");
        }
      } else {
        await dispatch(addJournalEntry({ userId: user.uid, data })).unwrap();
        toast.success("Entry saved");
      }
      resetForm();
    } catch {
      toast.error("Failed to save entry");
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setTitle(entry.title);
    setContent(entry.content);
    setSelectedTodoIds(entry.todoIds || []);
    setEditingEntry(entry);
    setIsAdding(true);
    setMood("");
  };

  const handleDelete = async (entryId: string) => {
    if (!user) return;
    try {
      await dispatch(deleteJournalEntry({ id: entryId, userId: user.uid })).unwrap();
      toast.success("Entry removed");
      setShowDeleteConfirm(null);
      if (isAdding) resetForm();
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingEntry(null);
    setTitle("");
    setContent("");
    setSelectedTodoIds([]);
    setMood("");
  };

  // Calendar
  const daysInMonth     = useMemo(() =>
    eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) }),
    [currentMonth]
  );
  const firstDayOfWeek  = startOfWeek(startOfMonth(currentMonth)).getDay();
  const entryDates      = useMemo(
    () => new Set(entries.map((e) => format(new Date(e.date), "yyyy-MM-dd"))),
    [entries]
  );

  return (
    <PageWrapper>
      <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">
        {/* ── Left Column ── */}
        <div className="flex-1 space-y-5">
          {/* Header */}
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-rose-500/10">
                <Heart size={16} className="text-rose-500" />
              </div>
              <h1 className={`text-2xl font-bold tracking-tight ${THEME_CLASSES.text.primary}`}>
                Heartspace
              </h1>
            </div>
            <p className={`text-sm ${THEME_CLASSES.text.tertiary}`}>
              Your private sanctuary for thoughts, reflections, and memories.
            </p>
          </div>

          {/* Search */}
          <div className="relative group animate-fade-in-up" style={{ animationDelay: "60ms" }}>
            <Search
              size={15}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${THEME_CLASSES.text.tertiary} group-focus-within:text-[#4f8cff] transition-colors`}
            />
            <input
              type="text"
              placeholder="Search your entries…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm ${THEME_CLASSES.input.base}`}
            />
          </div>

          {/* Calendar */}
          <div
            className={`p-5 border rounded-2xl ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base} animate-fade-in-up`}
            style={{ animationDelay: "120ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold text-sm ${THEME_CLASSES.text.primary}`}>
                {format(currentMonth, "MMMM yyyy")}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { const t = new Date(); setCurrentMonth(t); setSelectedDate(t); }}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg text-[#4f8cff] bg-[#4f8cff]/10 hover:bg-[#4f8cff]/20 transition-colors mr-1`}
                >
                  TODAY
                </button>
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className={`p-1.5 rounded-lg border ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover}`}
                >
                  <ChevronLeft size={13} />
                </button>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className={`p-1.5 rounded-lg border ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover}`}
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <span key={d} className={`text-[10px] font-bold uppercase ${THEME_CLASSES.text.tertiary}`}>{d}</span>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
              {daysInMonth.map((day: Date, i: number) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday    = isSameDay(day, new Date());
                const isFuture   = day > new Date() && !isToday;
                const hasEntry   = entryDates.has(format(day, "yyyy-MM-dd"));
                return (
                  <button
                    key={i}
                    disabled={isFuture}
                    onClick={() => { setSelectedDate(day); setIsAdding(false); setEditingEntry(null); }}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-all relative ${
                      isFuture
                        ? "opacity-20 cursor-not-allowed"
                        : isSelected
                        ? "bg-[#4f8cff] text-white shadow-[0_0_12px_rgba(79,140,255,0.4)] scale-105 z-10"
                        : isToday
                        ? "bg-[#4f8cff]/10 text-[#4f8cff] border border-[#4f8cff]/20"
                        : `${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.primary}`
                    }`}
                  >
                    {format(day, "d")}
                    {hasEntry && (
                      <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-rose-400"}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent entries */}
          <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "180ms" }}>
            <h3 className={`text-[11px] font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>
              {searchQuery ? `Results (${filteredEntries.length})` : "Recent Entries"}
            </h3>
            {loading ? (
              <div className="p-8 text-center opacity-40">Loading…</div>
            ) : filteredEntries.length === 0 ? (
              <div className={`p-6 text-center border-2 border-dashed rounded-2xl ${THEME_CLASSES.border.base} ${THEME_CLASSES.text.tertiary}`}>
                <p className="text-sm">No entries found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEntries.slice(0, 6).map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => { setSelectedDate(new Date(entry.date)); setIsAdding(false); setEditingEntry(null); }}
                    className={`p-3.5 border rounded-xl cursor-pointer transition-all hover:shadow-sm ${
                      isSameDay(new Date(entry.date), selectedDate)
                        ? "ring-1 ring-[#4f8cff] border-[#4f8cff]/30 bg-[#4f8cff]/5"
                        : `${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base} hover:border-[#4f8cff]/20`
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-semibold text-sm truncate pr-4 ${THEME_CLASSES.text.primary}`}>
                        {entry.title || "Untitled Entry"}
                      </h4>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0 ${THEME_CLASSES.status.todo}`}>
                        {format(new Date(entry.date), "MMM d")}
                      </span>
                    </div>
                    <p className={`text-xs line-clamp-1 leading-relaxed ${THEME_CLASSES.text.secondary}`}>
                      {entry.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Entry editor/viewer ── */}
        <div className="lg:w-[460px] animate-fade-in-up" style={{ animationDelay: "90ms" }}>
          <div
            className={`min-h-[560px] border rounded-2xl p-6 shadow-sm flex flex-col ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-rose-400 to-pink-500 text-white rounded-xl shadow-sm">
                  <CalendarIcon size={16} />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${THEME_CLASSES.text.primary}`}>
                    {format(selectedDate, "EEEE")}
                  </h3>
                  <p className={`text-xs ${THEME_CLASSES.text.tertiary}`}>
                    {format(selectedDate, "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedEntry && !isAdding && (
                  <>
                    <button
                      onClick={() => setShowDeleteConfirm(selectedEntry.id)}
                      className="p-2 rounded-lg text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      onClick={() => handleEdit(selectedEntry)}
                      className={`p-2 rounded-lg border transition-all ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover}`}
                    >
                      <Edit3 size={15} />
                    </button>
                  </>
                )}
                {!isAdding && !selectedEntry && (
                  <button
                    onClick={() => setIsAdding(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${THEME_CLASSES.button.primary}`}
                  >
                    <Plus size={13} /> Write
                  </button>
                )}
              </div>
            </div>

            {/* Delete confirm */}
            {showDeleteConfirm && (
              <div className="mb-4 p-4 bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-xl space-y-3">
                <p className="text-sm font-medium text-[#ef4444]">Delete this entry? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowDeleteConfirm(null)} className={`flex-1 py-2 text-xs font-semibold border rounded-lg ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover}`}>
                    Cancel
                  </button>
                  <button onClick={() => handleDelete(showDeleteConfirm!)} className="flex-[2] py-2 text-xs font-semibold bg-[#ef4444] text-white rounded-lg">
                    Delete
                  </button>
                </div>
              </div>
            )}

            {isAdding ? (
              /* ── Editor ── */
              <div className="space-y-4 flex-1 flex flex-col">
                {/* Mood selector */}
                <div>
                  <label className={`text-[10px] font-bold uppercase tracking-widest opacity-50 block mb-2`}>
                    How are you feeling?
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {MOODS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMood(mood === m ? "" : m)}
                        className={`text-xl p-1.5 rounded-xl transition-all ${
                          mood === m
                            ? "bg-[#4f8cff]/10 ring-1 ring-[#4f8cff]/40 scale-110"
                            : "hover:bg-white/5 hover:scale-110"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 block mb-1.5">Title</label>
                  <input
                    type="text"
                    placeholder="Entry title…"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full bg-transparent text-lg font-semibold border-none focus:ring-0 outline-none ${THEME_CLASSES.text.primary}`}
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 block mb-1.5">Date</label>
                  <input
                    type="date"
                    value={format(selectedDate, "yyyy-MM-dd")}
                    max={format(new Date(), "yyyy-MM-dd")}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className={`w-full p-2.5 rounded-xl border text-sm ${THEME_CLASSES.input.base}`}
                  />
                </div>

                {/* Content */}
                <textarea
                  placeholder="Capture your thoughts, ideas, and reflections…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`w-full flex-1 bg-transparent border-none focus:ring-0 resize-none text-sm leading-loose outline-none ${THEME_CLASSES.text.secondary} min-h-[180px]`}
                />

                {/* Link tasks */}
                {todos.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-dashed border-gray-100 dark:border-white/5">
                    <label className={`text-[10px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-1.5`}>
                      <LinkIcon size={10} /> Link Tasks
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {todos.slice(0, 8).map((todo) => (
                        <button
                          key={todo.id}
                          type="button"
                          onClick={() =>
                            setSelectedTodoIds((prev) =>
                              prev.includes(todo.id)
                                ? prev.filter((id) => id !== todo.id)
                                : [...prev, todo.id]
                            )
                          }
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                            selectedTodoIds.includes(todo.id)
                              ? "bg-[#4f8cff] border-[#4f8cff] text-white"
                              : `${THEME_CLASSES.border.base} ${THEME_CLASSES.text.secondary} hover:border-[#4f8cff]/40`
                          }`}
                        >
                          {todo.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3">
                  <button
                    onClick={resetForm}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className={`flex-[2] px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${THEME_CLASSES.button.primary}`}
                  >
                    {editingEntry ? "Update Entry" : "Save Entry"}
                  </button>
                </div>
              </div>
            ) : selectedEntry ? (
              /* ── Entry viewer ── */
              <div className="space-y-5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                <div className="space-y-1">
                  <h3 className={`text-xl font-bold ${THEME_CLASSES.text.primary}`}>
                    {selectedEntry.title || "Untitled Entry"}
                  </h3>
                  <div className={`flex items-center gap-3 text-[10px] font-medium ${THEME_CLASSES.text.tertiary}`}>
                    <span className="flex items-center gap-1"><Clock size={10} /> {format(new Date(selectedEntry.createdAt), "h:mm a")}</span>
                    <span className="flex items-center gap-1"><BookOpen size={10} className="text-rose-400" /> Heartspace</span>
                  </div>
                </div>

                <p className={`text-sm leading-loose whitespace-pre-wrap ${THEME_CLASSES.text.secondary}`}>
                  {selectedEntry.content}
                </p>

                {selectedEntry.todoIds && selectedEntry.todoIds.length > 0 && (
                  <div className="pt-4 space-y-2 border-t border-dashed border-gray-100 dark:border-white/5">
                    <h4 className={`text-[10px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-1.5`}>
                      <Tag size={10} className="text-[#4f8cff]" /> Linked Tasks
                    </h4>
                    <div className="space-y-1.5">
                      {selectedEntry.todoIds.map((todoId) => {
                        const t = todos.find((x) => x.id === todoId);
                        if (!t) return null;
                        return (
                          <div key={todoId} className={`p-2.5 rounded-xl border flex items-center justify-between ${THEME_CLASSES.surface.secondary} ${THEME_CLASSES.border.base}`}>
                            <span className={`text-xs font-medium ${THEME_CLASSES.text.primary}`}>{t.title}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              t.status === "completed" ? THEME_CLASSES.status.success : THEME_CLASSES.status.inprogress
                            }`}>{t.status}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Empty state ── */
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8">
                <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center">
                  <Heart size={28} className="text-rose-400" />
                </div>
                <div>
                  <p className={`text-base font-semibold ${THEME_CLASSES.text.primary}`}>A fresh chapter</p>
                  <p className={`text-xs mt-1 ${THEME_CLASSES.text.tertiary}`}>Capture your moments for today.</p>
                </div>
                <button
                  onClick={() => setIsAdding(true)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${THEME_CLASSES.button.primary}`}
                >
                  Start Writing
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Diary;
