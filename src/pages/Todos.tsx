import { useEffect, useMemo, useState } from "react";
import { Search, Filter, SortAsc, SortDesc, XCircle } from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import TodoCard from "../components/todos/TodoCard";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchTodos } from "../features/todos/todoThunks";
import { THEME_CLASSES } from "../utils/themeUtils";
import type { TodoStatus } from "../types/todo";

type FilterStatus = TodoStatus | "all";
type SortField = "createdAt" | "scheduledDate" | "title";
type SortOrder = "asc" | "desc";

const Todos = () => {
  const dispatch = useAppDispatch();
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

  const filterButtons: { label: string; value: FilterStatus }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "inprogress" },
    { label: "Completed", value: "completed" },
  ];

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortField("scheduledDate");
    setSortOrder("desc");
  };

  const isFiltered = searchQuery !== "" || statusFilter !== "all";

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h2 className={`text-2xl font-bold tracking-tight ${THEME_CLASSES.text.primary}`}>
                All Tasks
            </h2>
            <p className={`text-sm ${THEME_CLASSES.text.tertiary}`}>
                Manage and organize your learning journey
            </p>
        </div>

        <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 ${THEME_CLASSES.text.secondary}`}>
                {filteredAndSortedTodos.length} Results
            </span>
            {isFiltered && (
                <button 
                   onClick={clearFilters}
                   className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors font-medium border border-red-200 dark:border-red-900/50 px-2 py-1 rounded-lg"
                >
                    <XCircle size={12} />
                    Clear
                </button>
            )}
        </div>
      </div>

      {/* Control Bar */}
      <div className={`border rounded-2xl p-4 space-y-4 shadow-sm ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.default}`}>
        <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 group">
                <Search
                    size={18}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${THEME_CLASSES.text.tertiary} group-focus-within:text-blue-500`}
                />
                <input
                    type="text"
                    placeholder="Search by title, description, or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-blue-500/20 ${THEME_CLASSES.input.base}`}
                />
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
                <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as SortField)}
                    className={`pl-3 pr-8 py-2.5 rounded-xl border text-sm appearance-none bg-no-repeat bg-[right_0.5rem_center] ${THEME_CLASSES.input.base}`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '1rem' }}
                >
                    <option value="scheduledDate">Sort by Date</option>
                    <option value="createdAt">Sort by Created</option>
                    <option value="title">Sort by Title</option>
                </select>
                
                <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className={`p-2.5 border rounded-xl transition-all ${THEME_CLASSES.border.default} ${THEME_CLASSES.button.hover}`}
                    title={sortOrder === "asc" ? "Sort Ascending" : "Sort Descending"}
                >
                    {sortOrder === "asc" ? <SortAsc size={18} /> : <SortDesc size={18} />}
                </button>
            </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            <Filter size={14} className={`mr-1 shrink-0 ${THEME_CLASSES.text.tertiary}`} />
            {filterButtons.map(({ label, value }) => (
                <button
                    key={value}
                    onClick={() => setStatusFilter(value)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                        statusFilter === value
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
                            : `${THEME_CLASSES.border.default} ${THEME_CLASSES.text.secondary} hover:border-gray-400 dark:hover:border-gray-500`
                    }`}
                >
                    {label}
                </button>
            ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-100 flex items-center gap-3">
          <XCircle size={18} />
          <span>Error loading tasks: {error}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-2xl p-5 border animate-pulse ${THEME_CLASSES.surface.card}`}
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-6" />
              <div className="flex justify-between items-center">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedTodos.length === 0 ? (
        <div
          className={`border rounded-2xl p-16 text-center shadow-inner ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.default} ${THEME_CLASSES.text.tertiary}`}
        >
          <div className="max-w-xs mx-auto space-y-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto opacity-50">
                <Search size={32} />
            </div>
            <p className="text-lg font-medium">No tasks found</p>
            <p className="text-sm">
                {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your filters or search query to find what you're looking for."
                    : "Your task list is empty. Create your first spaced-repetition task to get started!"}
            </p>
            {isFiltered && (
                <button 
                  onClick={clearFilters}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-medium text-sm"
                >
                    Clear All Filters
                </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedTodos.map((todo) => (
            <TodoCard key={todo.id} todo={todo} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default Todos;