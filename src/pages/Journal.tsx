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
  PenTool,
  Sparkles,
  Link as LinkIcon
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import PageWrapper from "../components/layout/PageWrapper";
import { useAppDispatch, useAppSelector, useToast } from "../app/hooks";
import { fetchJournalEntries, addJournalEntry, updateJournalEntry } from "../features/journal/journalSlice";
import { THEME_CLASSES } from "../utils/themeUtils";
import type { JournalEntry } from "../types";

const Journal = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { entries } = useAppSelector((state) => state.journal);
  const user = useAppSelector((state) => state.auth.user);
  const todos = useAppSelector((state) => state.todo.todos);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAdding, setIsAdding] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  
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
    
    const data = {
      title: title || "Reflection",
      content,
      date: selectedDate.toISOString(),
      todoIds: selectedTodoIds,
    };

    try {
        if (editingEntry || selectedEntry) {
            const id = editingEntry?.id || selectedEntry?.id;
            if (id) {
                await dispatch(updateJournalEntry({ id, data })).unwrap();
                toast.success("Reflection updated");
            }
        } else {
            await dispatch(addJournalEntry({ userId: user.uid, data })).unwrap();
            toast.success("Reflection captured");
        }

        setIsAdding(false);
        setEditingEntry(null);
        setTitle("");
        setContent("");
        setSelectedTodoIds([]);
    } catch (err) {
        toast.error("Failed to save reflection");
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setTitle(entry.title);
    setContent(entry.content);
    setSelectedTodoIds(entry.todoIds || []);
    setEditingEntry(entry);
    setIsAdding(true);
  };

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    });
  }, [currentMonth]);

  return (
    <PageWrapper>
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left Column: Calendar & List */}
        <div className="flex-1 space-y-8">
          <div className="flex flex-col gap-1">
              <h2 className={`text-3xl font-bold tracking-tight ${THEME_CLASSES.text.primary}`}>Daily Reflections</h2>
              <p className={`${THEME_CLASSES.text.secondary}`}>Connect your journey with your missions.</p>
          </div>

          {/* Search */}
          <div className="relative group">
            <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${THEME_CLASSES.text.tertiary} group-focus-within:text-blue-500 transition-colors`} />
            <input
              type="text"
              placeholder="Search through your wisdom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all focus:ring-4 focus:ring-blue-500/10 ${THEME_CLASSES.input.base}`}
            />
          </div>

          {/* Calendar Mini View */}
          <div className={`p-6 border rounded-3xl shadow-sm ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`font-bold text-lg ${THEME_CLASSES.text.primary}`}>{format(currentMonth, "MMMM yyyy")}</h3>
              <div className="flex gap-1">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className={`p-2 rounded-xl border ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover}`}><ChevronLeft size={16} /></button>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className={`p-2 rounded-xl border ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover}`}><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <span key={d} className={`text-[10px] font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary} mb-2`}>{d}</span>
              ))}
              {daysInMonth.map((day: Date, i: number) => {
                const hasEntry = entries.some(e => isSameDay(new Date(e.date), day));
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                return (
                  <button
                    key={i}
                    onClick={() => {
                        setSelectedDate(day);
                        setIsAdding(false);
                    }}
                    className={`aspect-square flex flex-col items-center justify-center rounded-2xl text-sm font-bold transition-all relative ${
                      isSelected 
                        ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900" 
                        : isToday 
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 border border-blue-200 dark:border-blue-800"
                            : `${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.primary}`
                    }`}
                  >
                    {format(day, "d")}
                    {hasEntry && !isSelected && (
                      <span className="absolute bottom-2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Entries List */}
          <div className="space-y-4">
            <h3 className={`font-bold text-xs uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>Recent Reflections</h3>
            <div className="grid gap-4">
              {filteredEntries.slice(0, 3).map(entry => (
                <div 
                  key={entry.id} 
                  onClick={() => {
                      setSelectedDate(new Date(entry.date));
                      setIsAdding(false);
                  }}
                  className={`p-5 border rounded-2xl cursor-pointer transition-all hover:scale-[1.01] hover:shadow-lg ${
                    isSameDay(new Date(entry.date), selectedDate) 
                      ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50/10" 
                      : `${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-bold truncate pr-4 ${THEME_CLASSES.text.primary}`}>{entry.title || "Untitled Reflection"}</h4>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 ${THEME_CLASSES.text.secondary} shrink-0`}>
                      {format(new Date(entry.date), "MMM d, yyyy")}
                    </span>
                  </div>
                  <p className={`text-sm line-clamp-2 leading-relaxed ${THEME_CLASSES.text.secondary}`}>{entry.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Entry Detail / Editor */}
        <div className="lg:w-[480px] space-y-6">
          <div className={`h-full min-h-[600px] border rounded-[2.5rem] p-8 shadow-2xl shadow-blue-500/5 flex flex-col ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
                  <CalendarIcon size={24} />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${THEME_CLASSES.text.primary}`}>{format(selectedDate, "EEEE")}</h3>
                  <p className={`text-sm font-medium ${THEME_CLASSES.text.secondary}`}>{format(selectedDate, "MMMM d, yyyy")}</p>
                </div>
              </div>
              {!isAdding && (
                <button 
                  onClick={() => {
                    if (selectedEntry) {
                      handleEdit(selectedEntry);
                    } else {
                      setIsAdding(true);
                      setTitle("");
                      setContent("");
                      setSelectedTodoIds([]);
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.primary}`}
                >
                   {selectedEntry ? <Edit3 size={20} /> : <Plus size={20} />}
                </button>
              )}
            </div>

            {isAdding ? (
              <div className="space-y-6 flex-1 flex flex-col">
                <input
                  type="text"
                  placeholder="The theme of today..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full bg-transparent text-2xl font-black border-none focus:ring-0 ${THEME_CLASSES.text.primary} placeholder:text-gray-300 dark:placeholder:text-gray-600`}
                />
                <textarea
                  placeholder="Capture your thoughts, victories, and lessons..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`w-full flex-1 bg-transparent border-none focus:ring-0 resize-none text-base leading-relaxed ${THEME_CLASSES.text.secondary} placeholder:text-gray-300 dark:placeholder:text-gray-600 min-h-[300px]`}
                />
                
                {/* Task Linking */}
                <div className="space-y-3 pt-4 border-t border-dashed">
                  <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>
                    <LinkIcon size={12} /> Link Accomplishments
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {todos.slice(0, 6).map(todo => (
                      <button
                        key={todo.id}
                        type="button"
                        onClick={() => {
                          setSelectedTodoIds(prev => 
                            prev.includes(todo.id) ? prev.filter(id => id !== todo.id) : [...prev, todo.id]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          selectedTodoIds.includes(todo.id)
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
                            : `${THEME_CLASSES.border.base} ${THEME_CLASSES.text.secondary} hover:border-blue-400`
                        }`}
                      >
                        {todo.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button 
                    onClick={() => { setIsAdding(false); setEditingEntry(null); }}
                    className={`flex-1 px-4 py-3 rounded-2xl text-sm font-bold border ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.primary} transition-all`}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex-[2] px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                  >
                    Sync Reflection
                  </button>
                </div>
              </div>
            ) : selectedEntry ? (
              <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-2">
                  <h3 className={`text-2xl font-black ${THEME_CLASSES.text.primary}`}>{selectedEntry.title || "Untitled Reflection"}</h3>
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    <div className="flex items-center gap-1.5"><Clock size={12} /> {format(new Date(selectedEntry.createdAt), "h:mm a")}</div>
                    <div className="flex items-center gap-1.5"><Sparkles size={12} className="text-amber-500" /> Reflection</div>
                  </div>
                </div>
                
                <p className={`text-base leading-loose whitespace-pre-wrap ${THEME_CLASSES.text.secondary}`}>
                  {selectedEntry.content}
                </p>

                {selectedEntry.todoIds && selectedEntry.todoIds.length > 0 && (
                  <div className="pt-8 space-y-4 border-t border-dashed">
                    <h4 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${THEME_CLASSES.text.tertiary}`}>
                      <Tag size={12} className="text-blue-500" /> Linked Accomplishments
                    </h4>
                    <div className="space-y-3">
                      {selectedEntry.todoIds.map(todoId => {
                        const todo = todos.find(t => t.id === todoId);
                        if (!todo) return null;
                        return (
                          <div key={todoId} className={`p-4 rounded-2xl border flex items-center justify-between transition-all hover:border-blue-300 ${THEME_CLASSES.surface.secondary} ${THEME_CLASSES.border.base}`}>
                            <div className="flex flex-col">
                                <span className={`text-xs font-bold ${THEME_CLASSES.text.primary}`}>{todo.title}</span>
                                <span className="text-[10px] text-gray-400 font-medium">Synced Mission</span>
                            </div>
                            <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider ${
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
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center -rotate-6 transition-transform hover:rotate-0">
                      <PenTool size={48} className={THEME_CLASSES.text.tertiary} />
                    </div>
                    <div className="absolute -right-2 -top-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
                        <Plus size={16} />
                    </div>
                </div>
                <div className="max-w-[240px] space-y-2">
                  <p className={`text-lg font-bold ${THEME_CLASSES.text.primary}`}>A fresh chapter</p>
                  <p className={`text-sm ${THEME_CLASSES.text.secondary}`}>Empty reflections for this date. What's on your mind?</p>
                </div>
                <button 
                  onClick={() => setIsAdding(true)}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95"
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

export default Journal;

