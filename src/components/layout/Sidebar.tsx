import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ListTodo,
  RotateCcw,
  Heart,
  StickyNote,
  Settings,
} from "lucide-react";
import { THEME_CLASSES } from "../../utils/themeUtils";

interface SidebarProps {
  onNavigate?: () => void;
}

const navItems = [
  { to: "/",           label: "Dashboard",  icon: LayoutDashboard, end: true },
  { to: "/todos",      label: "Tasks",       icon: ListTodo,        end: false },
  { to: "/learning",   label: "Revisions",  icon: RotateCcw,       end: false },
  { to: "/heartspace", label: "Heartspace", icon: Heart,           end: false },
  { to: "/notes",      label: "Notes",       icon: StickyNote,      end: false },
  { to: "/profile",    label: "Settings",   icon: Settings,        end: false },
];

const Sidebar = ({ onNavigate }: SidebarProps) => {
  return (
    <div className="flex flex-col h-full py-6">
      {/* Logo mark */}
      <div className="px-5 mb-6 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#4f8cff] flex items-center justify-center shadow-[0_0_16px_rgba(79,140,255,0.4)]">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h3l2-5 2 10 2-5h1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <span className={`text-sm font-bold tracking-tight ${THEME_CLASSES.text.primary}`}>TodoSpace</span>
          <span className={`block text-[9px] font-medium uppercase tracking-widest opacity-40 ${THEME_CLASSES.text.tertiary}`}>1 · 3 · 7</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? `${THEME_CLASSES.surface.active} text-[#4f8cff] font-semibold`
                  : `${THEME_CLASSES.text.secondary} hover:${THEME_CLASSES.surface.active} hover:text-gray-900 dark:hover:text-white`
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#4f8cff] rounded-r-full" />
                )}
                <Icon
                  size={17}
                  className={`shrink-0 transition-colors ${
                    isActive ? "text-[#4f8cff]" : "opacity-60 group-hover:opacity-100"
                  }`}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom hint */}
      <div className="px-5 pt-4 border-t border-gray-100 dark:border-white/5">
        <p className={`text-[10px] font-medium ${THEME_CLASSES.text.tertiary}`}>
          Press <kbd className="px-1 py-0.5 text-[9px] rounded bg-gray-100 dark:bg-white/5 font-mono">N</kbd> for new task
        </p>
      </div>
    </div>
  );
};

export default Sidebar;