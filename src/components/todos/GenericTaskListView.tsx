import { useEffect, useMemo, useState } from "react";
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  XCircle, 
  ListTodo, 
  Sparkles,
  ArrowUpAz,
  CalendarDays,
  History,
  PlusCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import PageWrapper from "../layout/PageWrapper";
import { SortableTodoItem } from "../todos/SortableTodoItem";
import { useAppDispatch, useAppSelector, useToast } from "../../app/hooks";
import { fetchTodos, updateTodo } from "../../features/todos/todoThunks";
import { THEME_CLASSES } from "../../utils/themeUtils";
import { toDateOnlyString } from "../../utils/dateUtils";
import type { TodoStatus, Todo } from "../../types/todo";

type FilterStatus = TodoStatus | "all";
type SortField = "createdAt" | "scheduledDate" | "title" | "order";
type SortOrder = "asc" | "desc";

interface GenericTaskListViewProps {
  title: string;
  description: string;
  taskFilter: (todo: Todo) => boolean;
}

const GenericTaskListView = ({ title, description, taskFilter }: GenericTaskListViewProps) => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const todos = useAppSelector((state) => state.todo.todos);
  const loading = useAppSelector((state) => state.todo.loading);
  const error = useAppSelector((state) => state.todo.error);
  const isAuthChecked = useAppSelector((state) => state.auth.isAuthChecked);

  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [sortField, setSortField] = useState<SortField>("scheduledDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Local state for instant drag/drop feedback before server sync
  const [optimisticTodos, setOptimisticTodos] = useState<Todo[] | null>(null);
  const [prevTodos, setPrevTodos] = useState(todos);

  // Sync optimistic state when Redux update arrives
  if (todos !== prevTodos) {
    setPrevTodos(todos);
    setOptimisticTodos(null);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (isAuthChecked) {
      dispatch(fetchTodos());
    }
  }, [isAuthChecked, dispatch]);

  const filteredAndSortedTodos = useMemo(() => {
    let result = [...(optimisticTodos || todos)].filter(taskFilter);

    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (dateFilter) {
      result = result.filter((t) => toDateOnlyString(t.scheduledDate) === dateFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
            t.title.toLowerCase().includes(q) ||
            t.descriptions.some((d) => d.toLowerCase().includes(q)) ||
            (t.category && t.category.toLowerCase().includes(q))
      );
    }

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
  }, [todos, optimisticTodos, statusFilter, dateFilter, searchQuery, sortField, sortOrder, taskFilter]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
       const oldIndex = filteredAndSortedTodos.findIndex((t) => t.id === active.id);
       const newIndex = filteredAndSortedTodos.findIndex((t) => t.id === over.id);

       const newOrderedTodos = arrayMove(filteredAndSortedTodos, oldIndex, newIndex);
       
       // Update optimistic state
       setOptimisticTodos(newOrderedTodos);

       // Update order in database (simple swap logic for scaling)
       const activeTodo = filteredAndSortedTodos[oldIndex];
       const overTodo = filteredAndSortedTodos[newIndex];
       
       try {
           // Swap orders
           const tempOrder = activeTodo.order || Date.now();
           await dispatch(updateTodo({ id: active.id as string, updates: { order: overTodo.order || Date.now() } }));
           await dispatch(updateTodo({ id: over.id as string, updates: { order: tempOrder } }));
       } catch {
           toast.error("Failed to reorder tasks.");
           setOptimisticTodos(null); // Revert
       }
    }
  };

  const filterButtons: { label: string; value: FilterStatus }[] = [
    { label: "All Tasks", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "inprogress" },
    { label: "Completed", value: "completed" },
  ];

  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter("");
    setStatusFilter("all");
    setSortField("scheduledDate");
    setSortOrder("desc");
    toast.success("Filters cleared");
  };

  const isFiltered = searchQuery !== "" || statusFilter !== "all" || dateFilter !== "";

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
            <h2 className={`text-3xl font-bold tracking-tight ${THEME_CLASSES.text.primary}`}>
                {title}
            </h2>
            <p className={`text-sm ${THEME_CLASSES.text.tertiary}`}>
                {description}
            </p>
        </div>

        <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
                <ListTodo size={14} className="text-blue-500" />
                <span className={`text-sm font-bold ${THEME_CLASSES.text.primary}`}>
                    {filteredAndSortedTodos.length}
                </span>
                <span className={`text-[10px] uppercase tracking-wider opacity-50`}>Tasks</span>
            </div>
            <Link
              to="/create-todo"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              <PlusCircle size={16} />
              <span className="hidden sm:inline">New Task</span>
            </Link>
            {isFiltered && (
                <button 
                   onClick={clearFilters}
                   className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/50 transition-all active:scale-95"
                >
                    <XCircle size={14} />
                    Reset
                </button>
            )}
        </div>
      </div>

      {/* Control Bar */}
      <div className={`border rounded-xl p-4 space-y-4 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
        <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 group">
                <Search
                    size={18}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${THEME_CLASSES.text.tertiary} group-focus-within:text-blue-500`}
                />
                <input
                    type="text"
                    placeholder="Search tasks by name, notes, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border text-sm transition-all focus:ring-[3px] focus:ring-blue-500/10 shadow-sm ${THEME_CLASSES.input.base}`}
                />
            </div>

            {/* Date Filter */}
            <div className="relative group flex-1 sm:flex-none">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${THEME_CLASSES.text.tertiary} group-focus-within:text-blue-500`}>
                    <CalendarDays size={18} />
                </div>
                <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className={`w-full sm:w-48 pl-10 pr-3 py-2 rounded-lg border text-sm transition-all focus:ring-[3px] focus:ring-blue-500/10 shadow-sm ${THEME_CLASSES.input.base}`}
                    title="Filter by date"
                />
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-3">
                <div className="relative group/sort flex-1 sm:flex-none">
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${THEME_CLASSES.text.tertiary}`}>
                        {sortField === 'title' ? <ArrowUpAz size={16} /> : sortField === 'scheduledDate' ? <CalendarDays size={16} /> : <History size={16} />}
                    </div>
                    <select
                        value={sortField}
                        onChange={(e) => setSortField(e.target.value as SortField)}
                        className={`w-full sm:w-48 pl-9 pr-3 py-2 rounded-lg border text-sm font-medium appearance-none transition-all cursor-pointer focus:ring-[3px] focus:ring-blue-500/10 shadow-sm ${THEME_CLASSES.input.base}`}
                    >
                        <option value="scheduledDate">By Date</option>
                        <option value="createdAt">By Created</option>
                        <option value="title">Alphabetical</option>
                        <option value="order">Custom Order</option>
                    </select>
                </div>
                
                <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className={`p-2 border rounded-lg transition-all active:scale-95 shadow-sm ${THEME_CLASSES.border.base} ${THEME_CLASSES.surface.secondary} ${THEME_CLASSES.button.hover}`}
                    title={sortOrder === "asc" ? "Ascending" : "Descending"}
                >
                    {sortOrder === "asc" ? <SortAsc size={16} className="text-blue-500" /> : <SortDesc size={16} className="text-blue-500" />}
                </button>
            </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter size={14} className={`text-blue-500 shrink-0 mr-1`} />
            {filterButtons.map(({ label, value }) => (
                <button
                    key={value}
                    onClick={() => setStatusFilter(value)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${
                        statusFilter === value
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
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
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-3">
          <XCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-xl p-6 border animate-pulse ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}
            >
              <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-3/4 mb-4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-lg w-full mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-lg w-5/6 mb-6" />
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/3" />
                <div className="h-7 bg-gray-200 dark:bg-gray-800 rounded-lg w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedTodos.length === 0 ? (
        <div className={`border rounded-2xl p-16 text-center ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
          <div className="max-w-sm mx-auto space-y-6">
            <div className="relative inline-block">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-center justify-center mx-auto">
                    <ListTodo size={40} className="text-blue-400 opacity-60" />
                </div>
                <div className="absolute -bottom-2 -right-2 p-1.5 bg-amber-500 rounded-full text-white shadow-lg">
                    <Sparkles size={12} />
                </div>
            </div>
            
            <div className="space-y-2">
                <h3 className={`text-xl font-bold ${THEME_CLASSES.text.primary}`}>
                  {isFiltered ? "No tasks match your filters" : "No tasks yet"}
                </h3>
                <p className={`text-sm leading-relaxed ${THEME_CLASSES.text.tertiary}`}>
                    {isFiltered
                        ? "Try adjusting your search or status filter to find what you're looking for."
                        : "Create your first task and start building productive habits!"}
                </p>
            </div>

            {isFiltered ? (
                <button 
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-bold text-sm active:scale-95"
                >
                    Clear Filters
                </button>
            ) : (
                <Link
                  to="/create-todo"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-bold text-sm active:scale-95"
                >
                    <PlusCircle size={16} />
                    Create First Task
                </Link>
            )}
          </div>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredAndSortedTodos.map(t => t.id)} strategy={rectSortingStrategy}>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedTodos.map((todo) => (
                  <SortableTodoItem key={todo.id} todo={todo} isDraggable={sortField === "order"} />
                ))}
              </div>
            </SortableContext>
        </DndContext>
      )}
    </PageWrapper>
  );
};

export default GenericTaskListView;
