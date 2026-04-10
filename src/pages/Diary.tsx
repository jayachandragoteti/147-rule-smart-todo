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
  BookOpen
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
import { fetchJournalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } from "../features/journal/journalSlice";
import { THEME_CLASSES } from "../utils/themeUtils";
import type { JournalEntry, CreateJournalFormValues } from "../types";

const Diary = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { entries, loading } = useAppSelector((state) => state.journal);
  const user = useAppSelector((state) => state.auth.user);
  const todos = useAppSelector((state) => state.todo.todos);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAdding, setIsAdding] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTodoIds, setSelectedTodoIds] = useState<string[]>([]);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (user) {
      dispatch(fetchJournalEntries(user.uid));
    }
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

  const selectedEntry = useMemo(() => {
    return entries.find((e) => isSameDay(new Date(e.date), selectedDate));
  }, [entries, selectedDate]);

  const handleSave = async () => {
    if (!user) return;
    if (!title.trim() && !content.trim()) {
        toast.error("Please add a title or some content");
        return;
    }
    
    const data: CreateJournalFormValues = {
      title: title || "New Entry",
      content,
      date: selectedDate.toISOString(),
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

      setIsAdding(false);
      setEditingEntry(null);
      setTitle("");
      setContent("");
      setSelectedTodoIds([]);
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
  };

  const handleDelete = async (entryId: string) => {
    if (!user) return;
    try {
      await dispatch(deleteJournalEntry({ id: entryId, userId: user.uid })).unwrap();
      toast.success("Entry removed");
      setShowDeleteConfirm(null);
      if (isAdding) {
        setIsAdding(false);
        setEditingEntry(null);
      }
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingEntry(null);
    setTitle("");
    setContent("");
    setSelectedTodoIds([]);
  };

  // Build calendar days with proper week start
  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    });
  }, [currentMonth]);

  const firstDayOfWeek = startOfWeek(startOfMonth(currentMonth)).getDay();

  const entryDates = useMemo(() => 
    new Set(entries.map(e => format(new Date(e.date), "yyyy-MM-dd"))),
    [entries]
  );

  return (
    <PageWrapper>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Calendar & List */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col gap-1">
              <h2 className={`text-3xl font-bold tracking-tight ${THEME_CLASSES.text.primary}`}>Heartspace</h2>
              <p className={`text-sm ${THEME_CLASSES.text.secondary}`}>Your private sanctuary for stories, ideas, and memories.</p>
          </div>

          <div className="relative group">
            <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${THEME_CLASSES.text.tertiary} group-focus-within:text-blue-500 transition-colors`} />
            <input
              type="text"
              placeholder="Search your entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all focus:ring-4 focus:ring-blue-500/10 ${THEME_CLASSES.input.base}`}
            />
          </div>

          <div className={`p-5 border rounded-2xl shadow-sm ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold text-base ${THEME_CLASSES.text.primary}`}>{format(currentMonth, "MMMM yyyy")}</h3>
              <div className="flex gap-1">
                <button 
                  onClick={() => {
                    const today = new Date();
                    setCurrentMonth(today);
                    setSelectedDate(today);
                  }} 
                  className={`px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100 dark:border-blue-900/30 hover:bg-blue-100 transition-colors mr-1`}
                >
                  TODAY
                </button>
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className={`p-1.5 rounded-lg border ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover}`}><ChevronLeft size={14} /></button>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className={`p-1.5 rounded-lg border ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover}`}><ChevronRight size={14} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                <span key={d} className={`text-[10px] font-bold uppercase ${THEME_CLASSES.text.tertiary}`}>{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {daysInMonth.map((day: Date, i: number) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const isFuture = day > new Date() && !isToday;
                const hasEntry = entryDates.has(format(day, "yyyy-MM-dd"));
                return (
                  <button
                    key={i}
                    disabled={isFuture}
                    onClick={() => {
                        setSelectedDate(day);
                        setIsAdding(false);
                        setEditingEntry(null);
                    }}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-all relative ${
                      isFuture
                        ? "opacity-20 cursor-not-allowed"
                        : isSelected 
                            ? "bg-blue-600 text-white shadow-md scale-105 z-10" 
                            : isToday 
                                ? "bg-blue-50 dark:bg-blue-900/10 text-blue-600 border border-blue-200 dark:border-blue-800"
                                : `${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.primary}`
                    }`}
                  >
                    {format(day, "d")}
                    {hasEntry && (
                      <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-400'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className={`font-bold text-xs uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>
              {searchQuery ? `Results (${filteredEntries.length})` : "Recent Entries"}
            </h3>
            {loading ? (
              <div className="p-10 text-center opacity-50">Loading Heartspace...</div>
            ) : filteredEntries.length === 0 ? (
              <div className={`p-6 text-center border-2 border-dashed rounded-2xl ${THEME_CLASSES.border.base} ${THEME_CLASSES.text.tertiary}`}>
                <p className="text-sm">No entries found</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredEntries.slice(0, 5).map(entry => (
                  <div 
                    key={entry.id} 
                    onClick={() => {
                        setSelectedDate(new Date(entry.date));
                        setIsAdding(false);
                        setEditingEntry(null);
                    }}
                    className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-sm ${
                      isSameDay(new Date(entry.date), selectedDate) 
                        ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50/30 dark:bg-blue-900/10" 
                        : `${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base} hover:border-blue-300 dark:hover:border-blue-700`
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-semibold text-sm truncate pr-4 ${THEME_CLASSES.text.primary}`}>{entry.title || "Untitled Entry"}</h4>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 ${THEME_CLASSES.text.secondary} shrink-0`}>
                        {format(new Date(entry.date), "MMM d")}
                      </span>
                    </div>
                    <p className={`text-xs line-clamp-2 leading-relaxed ${THEME_CLASSES.text.secondary}`}>{entry.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Entry Detail / Editor */}
        <div className="lg:w-[460px]">
          <div className={`min-h-[560px] border rounded-2xl p-6 shadow-sm flex flex-col ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-rose-400 to-pink-500 text-white rounded-xl shadow-sm">
                  <CalendarIcon size={18} />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${THEME_CLASSES.text.primary}`}>{format(selectedDate, "EEEE")}</h3>
                  <p className={`text-xs font-medium ${THEME_CLASSES.text.secondary}`}>{format(selectedDate, "MMMM d, yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedEntry && !isAdding && (
                  <>
                    <button 
                      onClick={() => setShowDeleteConfirm(selectedEntry.id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleEdit(selectedEntry)}
                      className={`p-2 rounded-lg border transition-all ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.primary}`}
                    >
                      <Edit3 size={16} />
                    </button>
                  </>
                )}
                {!isAdding && !selectedEntry && (
                  <button 
                    onClick={() => {
                      setIsAdding(true);
                      setTitle("");
                      setContent("");
                      setSelectedTodoIds([]);
                    }}
                    className={`p-2 rounded-lg border transition-all ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.primary}`}
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
            </div>

            {showDeleteConfirm && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl space-y-3">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">Delete this entry? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowDeleteConfirm(null)} className={`flex-1 py-2 text-xs font-bold border rounded-lg ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover}`}>Cancel</button>
                  <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-[2] py-2 text-xs font-bold bg-red-600 text-white rounded-lg">Delete</button>
                </div>
              </div>
            )}

            {isAdding ? (
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Entry Title</label>
                    <input
                      type="text"
                      placeholder="Title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={`w-full bg-transparent text-xl font-bold border-none focus:ring-0 outline-none ${THEME_CLASSES.text.primary}`}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Entry Date</label>
                    <input
                      type="date"
                      value={format(selectedDate, "yyyy-MM-dd")}
                      max={format(new Date(), "yyyy-MM-dd")}
                      onChange={(e) => setSelectedDate(new Date(e.target.value))}
                      className={`w-full p-2.5 rounded-xl border text-sm ${THEME_CLASSES.input.base}`}
                    />
                  </div>
                </div>
                <textarea
                  placeholder="Capture your thoughts..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`w-full flex-1 bg-transparent border-none focus:ring-0 resize-none text-sm leading-relaxed outline-none ${THEME_CLASSES.text.secondary} min-h-[220px]`}
                />
                
                {todos.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-dashed border-gray-100 dark:border-gray-800">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-1.5">
                      <LinkIcon size={10} /> Link Tasks
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {todos.slice(0, 6).map(todo => (
                        <button
                          key={todo.id}
                          type="button"
                          onClick={() => {
                            setSelectedTodoIds(prev => 
                              prev.includes(todo.id) ? prev.filter(id => id !== todo.id) : [...prev, todo.id]
                            );
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                            selectedTodoIds.includes(todo.id)
                              ? "bg-blue-600 border-blue-600 text-white"
                              : `${THEME_CLASSES.border.base} ${THEME_CLASSES.text.secondary}`
                          }`}
                        >
                          {todo.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <button onClick={handleCancel} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold border ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover}`}>Cancel</button>
                  <button onClick={handleSave} className="flex-[2] px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                    {editingEntry ? "Update Entry" : "Save Entry"}
                  </button>
                </div>
              </div>
            ) : selectedEntry ? (
              <div className="space-y-6 flex-1 overflow-y-auto pr-1">
                <div className="space-y-1.5">
                  <h3 className={`text-xl font-bold ${THEME_CLASSES.text.primary}`}>{selectedEntry.title || "Untitled Entry"}</h3>
                  <div className="flex items-center gap-3 text-[10px] font-medium text-gray-400">
                    <div className="flex items-center gap-1"><Clock size={10} /> {format(new Date(selectedEntry.createdAt), "h:mm a")}</div>
                    <div className="flex items-center gap-1"><BookOpen size={10} className="text-rose-400" /> Heartspace</div>
                  </div>
                </div>
                
                <p className={`text-sm leading-loose whitespace-pre-wrap ${THEME_CLASSES.text.secondary}`}>
                  {selectedEntry.content}
                </p>

                {selectedEntry.todoIds && selectedEntry.todoIds.length > 0 && (
                  <div className="pt-4 space-y-3 border-t border-dashed border-gray-100 dark:border-gray-800">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-1.5">
                      <Tag size={10} className="text-blue-500" /> Linked Tasks
                    </h4>
                    <div className="space-y-2">
                      {selectedEntry.todoIds.map(todoId => {
                        const todo = todos.find(t => t.id === todoId);
                        if (!todo) return null;
                        return (
                          <div key={todoId} className={`p-3 rounded-xl border flex items-center justify-between ${THEME_CLASSES.surface.secondary} ${THEME_CLASSES.border.base}`}>
                            <span className="text-xs font-medium">{todo.title}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                todo.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                            }`}>{todo.status}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-5 py-8">
                <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/10 rounded-2xl flex items-center justify-center text-rose-400">
                  <Heart size={32} />
                </div>
                <div>
                  <p className={`text-base font-bold ${THEME_CLASSES.text.primary}`}>A fresh chapter</p>
                  <p className="text-xs opacity-50">Capture your moments for today.</p>
                </div>
                <button 
                  onClick={() => setIsAdding(true)}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
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
