/**
 * StatusDropdown
 *
 * A portal-based status picker that renders at document.body level,
 * so it is never clipped by any ancestor's overflow:hidden.
 *
 * Usage:
 *   <StatusDropdown
 *     currentStatus={todo.status}
 *     isUpdating={updatingId === todo.id}
 *     blocked={hasIncompleteSubtasks}
 *     onChange={(newStatus) => handleStatusChange(todo, newStatus)}
 *   />
 */

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, CheckCircle2, Loader2, Circle, Clock } from "lucide-react";
import { THEME_CLASSES } from "../../utils/themeUtils";
import type { TodoStatus } from "../../types/todo";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: TodoStatus; label: string; dot: string }[] = [
  { value: "pending",    label: "To Do",       dot: "bg-[#606878]" },
  { value: "inprogress", label: "In Progress", dot: "bg-[#f59e0b]" },
  { value: "completed",  label: "Completed",   dot: "bg-[#22c55e]" },
];

const STATUS_STYLE: Record<TodoStatus, string> = {
  pending:    "text-[#606878]  bg-[#606878]/10  border-[#606878]/20",
  inprogress: "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20",
  completed:  "text-[#22c55e] bg-[#22c55e]/10  border-[#22c55e]/20",
};

const STATUS_ICON: Record<TodoStatus, React.ReactNode> = {
  pending:    <Circle size={9} />,
  inprogress: <Clock size={9} />,
  completed:  <CheckCircle2 size={9} />,
};

// ── Component ─────────────────────────────────────────────────────────────────

interface StatusDropdownProps {
  currentStatus: TodoStatus;
  isUpdating?: boolean;
  /** If true, "Completed" option is disabled (pending subtasks) */
  blocked?: boolean;
  onChange: (status: TodoStatus) => void;
  /** Show label text next to icon (default: true on ≥sm) */
  showLabel?: boolean;
}

const DROPDOWN_WIDTH = 160;
const DROPDOWN_ITEM_H = 40;
const DROPDOWN_H = STATUS_OPTIONS.length * DROPDOWN_ITEM_H + 8; // approx

export const StatusDropdown = ({
  currentStatus,
  isUpdating = false,
  blocked = false,
  onChange,
  showLabel = true,
}: StatusDropdownProps) => {
  const [open, setOpen]       = useState(false);
  const [coords, setCoords]   = useState({ top: 0, left: 0 });
  const triggerRef            = useRef<HTMLButtonElement>(null);

  // Position the floating panel next to the trigger button
  const openDropdown = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow > DROPDOWN_H
      ? rect.bottom + 4            // below
      : rect.top - DROPDOWN_H - 4; // above if not enough room

    // Align to right edge of trigger
    const left = Math.min(
      rect.right - DROPDOWN_WIDTH,
      window.innerWidth - DROPDOWN_WIDTH - 8
    );

    setCoords({ top, left: Math.max(8, left) });
    setOpen(true);
  };

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown",   handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown",   handleKey);
    };
  }, [open]);

  const pillStyle = STATUS_STYLE[currentStatus] ?? STATUS_STYLE.pending;

  return (
    <>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        onClick={(e) => { e.stopPropagation(); open ? setOpen(false) : openDropdown(); }}
        disabled={isUpdating}
        className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-[10px] font-semibold border transition-all hover:opacity-80 active:scale-95 disabled:opacity-50 ${pillStyle}`}
        title="Change status"
      >
        {isUpdating
          ? <Loader2 size={9} className="animate-spin" />
          : STATUS_ICON[currentStatus]
        }
        {showLabel && (
          <span className="hidden sm:inline">
            {STATUS_OPTIONS.find(o => o.value === currentStatus)?.label}
          </span>
        )}
        <ChevronDown
          size={9}
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Portal dropdown — renders at document.body, escapes all overflow:hidden */}
      {open && createPortal(
        <div
          style={{
            position: "fixed",
            top:   coords.top,
            left:  coords.left,
            width: DROPDOWN_WIDTH,
            zIndex: 9999,
          }}
          className={`rounded-xl border shadow-2xl overflow-hidden animate-fade-in ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {STATUS_OPTIONS.map((opt) => {
            const isBlocked  = opt.value === "completed" && blocked;
            const isCurrent  = currentStatus === opt.value;
            return (
              <button
                key={opt.value}
                disabled={isBlocked}
                onClick={() => {
                  if (isBlocked) return;
                  onChange(opt.value);
                  setOpen(false);
                }}
                title={isBlocked ? "Complete all subtasks first" : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold transition-all text-left ${
                  isBlocked
                    ? "opacity-40 cursor-not-allowed"
                    : isCurrent
                    ? `${STATUS_STYLE[opt.value]} opacity-90`
                    : `${THEME_CLASSES.text.secondary} ${THEME_CLASSES.button.hover}`
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`} />
                {opt.label}
                {isCurrent && <CheckCircle2 size={10} className="ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
};

export default StatusDropdown;
