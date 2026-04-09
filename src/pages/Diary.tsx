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
  Smile,
  Meh,
  Frown,
  Zap,
  RefreshCw,
  Sparkles as SparklesIcon
} from "lucide-react";
import { analyzeMood, summarizeContent } from "../services/aiService";
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
import { BookOpen } from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import { useAppDispatch, useAppSelector, useToast } from "../app/hooks";
import { fetchJournalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } from "../features/journal/journalSlice";
import { THEME_CLASSES } from "../utils/themeUtils";
import type { JournalEntry } from "../types";

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
  const [isAiProcessing, setIsAiProcessing] = useState(false);

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
    
    const data: any = {
      title: title || "New Entry",
      content,
      date: selectedDate.toISOString(),
      todoIds: selectedTodoIds,
    };

    setIsAiProcessing(true);
    try {
      // AI Enhancement
      if (content.length > 50) {
        const [moodResult, summary] = await Promise.all([
          analyzeMood(content),
          summarizeContent(content)
        ]);
        data.mood = moodResult.mood;
        data.aiSummary = summary;
      }
      
      if (editingEntry || selectedEntry) {
        const id = editingEntry?.id || selectedEntry?.id;
        if (id) {
          await dispatch(updateJournalEntry({ id, userId: user.uid, data })).unwrap();
          toast.success("Entry updated & analyzed ✓");
        }
      } else {
        await dispatch(addJournalEntry({ userId: user.uid, data })).unwrap();
        toast.success("Entry saved & analyzed ✓");
      }

      setIsAdding(false);
      setEditingEntry(null);
      setTitle("");
      setContent("");
      setSelectedTodoIds([]);
    } catch {
      toast.error("Failed to save entry");
    } finally {
      setIsAiProcessing(false);
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

  // Entries that have dates for the calendar dot indicator
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

          {/* Search */}
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

          {/* Calendar Mini View */}
          <div className={`p-5 border rounded-2xl shadow-sm ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold text-base ${THEME_CLASSES.text.primary}`}>{format(currentMonth, "MMMM yyyy")}</h3>
              <div className="flex gap-1">
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
              {/* Empty cells for first day offset */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {daysInMonth.map((day: Date, i: number) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const hasEntry = entryDates.has(format(day, "yyyy-MM-dd"));
                return (
                  <button
                    key={i}
                    onClick={() => {
                        setSelectedDate(day);
                        setIsAdding(false);
                        setEditingEntry(null);
                    }}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-all relative ${
                      isSelected 
                        ? "bg-blue-600 text-white shadow-md" 
                        : isToday 
                            ? "bg-blue-50 dark:bg-blue-900/10 text-blue-600 border border-blue-200 dark:border-blue-800"
                            : `${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.primary}`
                    }`}
                  >
                    {format(day, "d")}
                    {hasEntry && (
                      <div className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-400'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Entries List */}
          <div className="space-y-3">
            <h3 className={`font-bold text-xs uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>
              {searchQuery ? `Results (${filteredEntries.length})` : "Recent Entries"}
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className={`p-4 border rounded-xl animate-pulse ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className={`p-6 text-center border-2 border-dashed rounded-2xl ${THEME_CLASSES.border.base} ${THEME_CLASSES.text.tertiary}`}>
                <p className="text-sm">{searchQuery ? "No entries found" : "No diary entries yet"}</p>
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
                      title="Delete entry"
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

            {/* Delete Confirm */}
            {showDeleteConfirm && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl space-y-3">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">Delete this diary entry? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowDeleteConfirm(null)} className={`flex-1 py-2 text-xs font-bold border rounded-lg ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.primary}`}>
                    Cancel
                  </button>
                  <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-[2] py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                    Delete Entry
                  </button>
                </div>
              </div>
            )}

            {isAdding ? (
              <div className="space-y-4 flex-1 flex flex-col">
                <input
                  type="text"
                  placeholder="Give this page a title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full bg-transparent text-xl font-bold border-none focus:ring-0 outline-none ${THEME_CLASSES.text.primary} placeholder:text-gray-300 dark:placeholder:text-gray-700`}
                />
                <div className="w-full h-px bg-gray-100 dark:bg-gray-800" />
                <textarea
                  placeholder="What's on your mind today? ✍️"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`w-full flex-1 bg-transparent border-none focus:ring-0 resize-none text-sm leading-relaxed outline-none ${THEME_CLASSES.text.secondary} placeholder:text-gray-300 dark:placeholder:text-gray-700 min-h-[220px]`}
                />
                
                {/* Task Linking */}
                {todos.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-dashed border-gray-100 dark:border-gray-800">
                    <label className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>
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
                              : `${THEME_CLASSES.border.base} ${THEME_CLASSES.text.secondary} hover:border-blue-400`
                          }`}
                        >
                          {todo.title.length > 20 ? todo.title.slice(0, 20) + "…" : todo.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <button 
                    onClick={handleCancel}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold border ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.primary} transition-all`}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isAiProcessing}
                    className="flex-[2] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAiProcessing ? <RefreshCw size={16} className="animate-spin" /> : null}
                    {editingEntry ? "Update Entry" : "Save Entry"}
                  </button>
                </div>
                {isAiProcessing && (
                  <p className="text-[10px] text-blue-500 font-bold text-center animate-pulse flex items-center justify-center gap-1.5">
                    <SparklesIcon size={10} /> AI is analyzing your thoughts and mood...
                  </p>
                )}
              </div>
            ) : selectedEntry ? (
              <div className="space-y-6 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                <div className="space-y-1.5">
                  <h3 className={`text-xl font-bold ${THEME_CLASSES.text.primary}`}>{selectedEntry.title || "Untitled Entry"}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-medium text-gray-400">
                    <div className="flex items-center gap-1"><Clock size={10} /> {format(new Date(selectedEntry.createdAt), "h:mm a")}</div>
                    <div className="flex items-center gap-1"><BookOpen size={10} className="text-rose-400" /> Heartspace</div>
                    {selectedEntry.mood && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                        {selectedEntry.mood === 'happy' && <Smile size={10} />}
                        {selectedEntry.mood === 'neutral' && <Meh size={10} />}
                        {(selectedEntry.mood === 'sad' || selectedEntry.mood === 'stressed') && <Frown size={10} />}
                        {selectedEntry.mood === 'focused' && <Zap size={10} />}
                        <span className="uppercase tracking-widest">{selectedEntry.mood}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedEntry.aiSummary && (
                   <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1 flex items-center gap-1">
                        <SparklesIcon size={10} /> AI Summary
                      </p>
                      <p className={`text-xs italic leading-relaxed ${THEME_CLASSES.text.secondary}`}>
                        "{selectedEntry.aiSummary}"
                      </p>
                   </div>
                )}
                
                <p className={`text-sm leading-loose whitespace-pre-wrap ${THEME_CLASSES.text.secondary}`}>
                  {selectedEntry.content}
                </p>

                {selectedEntry.todoIds && selectedEntry.todoIds.length > 0 && (
                  <div className="pt-4 space-y-3 border-t border-dashed border-gray-100 dark:border-gray-800">
                    <h4 className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${THEME_CLASSES.text.tertiary}`}>
                      <Tag size={10} className="text-blue-500" /> Linked Tasks
                    </h4>
                    <div className="space-y-2">
                      {selectedEntry.todoIds.map(todoId => {
                        const todo = todos.find(t => t.id === todoId);
                        if (!todo) return null;
                        return (
                          <div key={todoId} className={`p-3 rounded-xl border flex items-center justify-between ${THEME_CLASSES.surface.secondary} ${THEME_CLASSES.border.base}`}>
                            <span className={`text-xs font-medium ${THEME_CLASSES.text.primary}`}>{todo.title}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                todo.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600'
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
                <div className="relative">
                    <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/10 rounded-2xl flex items-center justify-center -rotate-3 transition-transform hover:rotate-0">
                      <Heart size={36} className="text-rose-400" />
                    </div>
                    <div className="absolute -right-1 -top-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg">
                        <Plus size={14} />
                    </div>
                </div>
                <div className="max-w-[200px] space-y-1.5">
                  <p className={`text-base font-bold ${THEME_CLASSES.text.primary}`}>A fresh chapter</p>
                  <p className={`text-xs ${THEME_CLASSES.text.secondary}`}>
                    {format(selectedDate, "MMMM d")} is blank. {isSameDay(selectedDate, new Date()) ? "What made today special?" : "Add a memory for this day."}
                  </p>
                </div>
                <button 
                  onClick={() => setIsAdding(true)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
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
