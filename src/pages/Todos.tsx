import { useEffect, useMemo, useState } from "react";
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  XCircle, 
  Layers, 
  Sparkles,
  ArrowUpAz,
  CalendarDays,
  History
} from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import TodoCard from "../components/todos/TodoCard";
import { useAppDispatch, useAppSelector, useToast } from "../app/hooks";
import { fetchTodos } from "../features/todos/todoThunks";
import { THEME_CLASSES } from "../utils/themeUtils";
import type { TodoStatus } from "../types/todo";

type FilterStatus = TodoStatus | "all";
type SortField = "createdAt" | "scheduledDate" | "title";
type SortOrder = "asc" | "desc";

const Todos = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const todos = useAppSelector((state) => state.todo.todos);
  const loading = useAppSelector((state) => state.todo.loading);
  const error = useAppSelector((state) => state.todo.error);
  const isAuthChecked = useAppSelector((state) => state.auth.isAuthChecked);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [sortField, setSortField] = useState<SortField>("scheduledDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    if (isAuthChecked) {
      dispatch(fetchTodos());
    }
  }, [isAuthChecked, dispatch]);

  const filteredAndSortedTodos = useMemo(() => {
    let result = [...todos];

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
            t.title.toLowerCase().includes(q) ||
            t.descriptions.some((d) => d.toLowerCase().includes(q)) ||
            t.actionType.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
        const valA = a[sortField] || "";
        const valB = b[sortField] || "";
        
        if (typeof valA === "string" && typeof valB === "string") {
            return sortOrder === "asc" 
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        }
        return 0;
    });

    return result;
  }, [todos, statusFilter, searchQuery, sortField, sortOrder]);

  const filterButtons: { label: string; value: FilterStatus; color: string }[] = [
    { label: "All Missions", value: "all", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
    { label: "Pending", value: "pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
    { label: "In Progress", value: "inprogress", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
    { label: "Completed", value: "completed", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  ];

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortField("scheduledDate");
    setSortOrder("desc");
    toast.success("Filters cleared");
  };

  const isFiltered = searchQuery !== "" || statusFilter !== "all";

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 px-2">
        <div className="space-y-1">
            <h2 className={`text-4xl font-black tracking-tight ${THEME_CLASSES.text.primary}`}>
                Task Pipeline
            </h2>
            <p className={`text-base font-medium ${THEME_CLASSES.text.tertiary}`}>
                Optimize and manage your synchronized mission grid.
            </p>
        </div>

        <div className="flex items-center gap-4">
            <div className={`flex items-center gap-3 px-5 py-2.5 rounded-[1.25rem] border shadow-sm transition-all hover:shadow-md ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
                <div className="p-1.5 bg-blue-500 rounded-lg text-white shadow-lg shadow-blue-500/20">
                    <Layers size={14} />
                </div>
                <span className={`text-sm font-black ${THEME_CLASSES.text.primary}`}>
                    {filteredAndSortedTodos.length} <span className="opacity-50 text-[10px] uppercase tracking-widest ml-1">Total Hits</span>
                </span>
            </div>
            {isFiltered && (
                <button 
                   onClick={clearFilters}
                   className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 px-4 py-2.5 rounded-2xl border border-red-200 dark:border-red-900/50 transition-all active:scale-95"
                >
                    <XCircle size={14} />
                    Reset
                </button>
            )}
        </div>
      </div>

      {/* Control Bar */}
      <div className={`border rounded-[2.5rem] p-8 space-y-8 shadow-2xl shadow-blue-500/[0.03] transition-all ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="relative flex-1 group">
                <Search
                    size={20}
                    className={`absolute left-5 top-1/2 -translate-y-1/2 transition-all ${THEME_CLASSES.text.tertiary} group-focus-within:text-blue-500 group-focus-within:scale-110`}
                />
                <input
                    type="text"
                    placeholder="Search your mission archive..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-14 pr-6 py-4 rounded-[1.5rem] border text-base font-medium transition-all focus:ring-4 focus:ring-blue-500/10 ${THEME_CLASSES.input.base}`}
                />
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-3">
                <div className="relative group/sort flex-1 sm:flex-none">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${THEME_CLASSES.text.tertiary}`}>
                        {sortField === 'title' ? <ArrowUpAz size={18} /> : sortField === 'scheduledDate' ? <CalendarDays size={18} /> : <History size={18} />}
                    </div>
                    <select
                        value={sortField}
                        onChange={(e) => setSortField(e.target.value as SortField)}
                        className={`w-full sm:w-56 pl-12 pr-10 py-4 rounded-[1.5rem] border text-sm font-bold appearance-none transition-all cursor-pointer focus:ring-4 focus:ring-blue-500/10 ${THEME_CLASSES.input.base} group-hover/sort:border-blue-400`}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '1.25rem', backgroundPosition: 'calc(100% - 1rem) center' }}
                    >
                        <option value="scheduledDate">Scheduled Date</option>
                        <option value="createdAt">Created Date</option>
                        <option value="title">Alphabetical</option>
                    </select>
                </div>
                
                <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className={`p-4 border rounded-[1.5rem] transition-all shadow-sm active:scale-95 ${THEME_CLASSES.border.base} ${THEME_CLASSES.surface.secondary} ${THEME_CLASSES.button.hover}`}
                    title={sortOrder === "asc" ? "Sort Ascending" : "Sort Descending"}
                >
                    {sortOrder === "asc" ? <SortAsc size={20} className="text-blue-500" /> : <SortDesc size={20} className="text-blue-500" />}
                </button>
            </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 mr-2">
                <Filter size={16} className={`text-blue-500 shrink-0`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>Status</span>
            </div>
            {filterButtons.map(({ label, value }) => (
                <button
                    key={value}
                    onClick={() => setStatusFilter(value)}
                    className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                        statusFilter === value
                            ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20 scale-105"
                            : `${THEME_CLASSES.border.base} ${THEME_CLASSES.text.secondary} hover:bg-gray-50 dark:hover:bg-gray-800`
                    }`}
                >
                    {label}
                </button>
            ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl p-6 text-sm text-red-600 dark:text-red-400 font-bold flex items-center gap-4 animate-shake">
          <XCircle size={24} />
          <div className="flex flex-col">
              <span className="uppercase text-[10px] tracking-widest">Pipeline Error</span>
              <span>{error}</span>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-[2.5rem] p-8 border animate-pulse ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}
            >
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-3/4 mb-6" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-lg w-full mb-3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-lg w-5/6 mb-8" />
              <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/3" />
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedTodos.length === 0 ? (
        <div
          className={`border rounded-[3rem] p-24 text-center shadow-inner ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}
        >
          <div className="max-w-md mx-auto space-y-8">
            <div className="relative inline-block">
                <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] flex items-center justify-center mx-auto transition-transform hover:scale-110">
                    <Search size={48} className="text-blue-500 opacity-60" />
                </div>
                <div className="absolute -bottom-2 -right-2 p-2 bg-amber-500 rounded-full text-white shadow-lg">
                    <Sparkles size={16} />
                </div>
            </div>
            
            <div className="space-y-3">
                <h3 className={`text-2xl font-black ${THEME_CLASSES.text.primary}`}>Zero hits matching criteria</h3>
                <p className={`text-base font-medium leading-relaxed ${THEME_CLASSES.text.tertiary}`}>
                    {searchQuery || statusFilter !== "all"
                        ? "The mission coordinates you provided yielded no results. Revise your sync filters and try again."
                        : "Your mission pipeline is currently empty. Initialize a new mission sequence to begin."}
                </p>
            </div>

            {isFiltered && (
                <button 
                  onClick={clearFilters}
                  className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-xl shadow-blue-500/20 font-black text-sm uppercase tracking-widest active:scale-95"
                >
                    Reset Pipeline Grid
                </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedTodos.map((todo) => (
            <TodoCard key={todo.id} todo={todo} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default Todos;