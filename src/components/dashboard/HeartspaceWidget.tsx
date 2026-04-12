import { Link } from "react-router-dom";
import { BookOpen, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { THEME_CLASSES } from "../../utils/themeUtils";
import type { JournalEntry } from "../../types";

interface Props {
  latestDiaryEntry: JournalEntry | null;
}

const HeartspaceWidget = ({ latestDiaryEntry }: Props) => {
  return (
    <div className={`border rounded-2xl shadow-sm ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-rose-500" />
          <h3 className="font-bold text-sm">Heartspace</h3>
        </div>
        <Link to="/heartspace" className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
          Open <ChevronRight size={10} />
        </Link>
      </div>
      <div className="p-5">
        {latestDiaryEntry ? (
          <div className="space-y-4">
             <p className="text-[10px] font-bold opacity-40">{format(new Date(latestDiaryEntry.date), "MMMM d")}</p>
             <p className="text-lg font-bold truncate">{latestDiaryEntry.title}</p>
             <p className="text-sm line-clamp-3 opacity-60 leading-relaxed">{latestDiaryEntry.content}</p>
          </div>
        ) : (
          <p className="text-xs text-center py-4 opacity-50">Your sanctuary is quiet.</p>
        )}
      </div>
    </div>
  );
};

export default HeartspaceWidget;
