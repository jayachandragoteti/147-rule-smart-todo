import { Link } from "react-router-dom";
import { StickyNote, ChevronRight } from "lucide-react";
import { THEME_CLASSES } from "../../utils/themeUtils";
import type { Note } from "../../types";

interface Props {
  latestNote: Note | null;
}

const NotesWidget = ({ latestNote }: Props) => {
  return (
    <div className={`border rounded-2xl shadow-sm ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <StickyNote size={16} className="text-amber-500" />
          <h3 className="font-bold text-sm">Notes</h3>
        </div>
        <Link to="/notes" className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
          All <ChevronRight size={10} />
        </Link>
      </div>
      <div className="p-5">
        {latestNote ? (
          <div className="space-y-2">
            <p className="text-sm font-bold truncate">{latestNote.title}</p>
            <p className="text-xs line-clamp-2 opacity-60 leading-relaxed">{latestNote.content}</p>
          </div>
        ) : (
          <p className="text-xs text-center py-4 opacity-50">No notes captured.</p>
        )}
      </div>
    </div>
  );
};

export default NotesWidget;
