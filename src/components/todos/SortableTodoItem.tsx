import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TodoCard from "./TodoCard";
import type { Todo } from "../../types/todo";
import { GripVertical } from "lucide-react";

interface Props {
  todo: Todo;
  isDraggable: boolean;
}

export const SortableTodoItem = ({ todo, isDraggable }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/sortable">
      <TodoCard todo={todo} />
      
      {isDraggable && (
        <div 
          {...attributes} 
          {...listeners} 
          className="absolute -left-3 top-1/2 -translate-y-1/2 p-2 bg-white dark:bg-gray-800 shadow-md border rounded-xl opacity-0 group-hover/sortable:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <GripVertical size={16} className="text-gray-400" />
        </div>
      )}
    </div>
  );
};
