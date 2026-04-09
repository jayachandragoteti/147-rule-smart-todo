import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  CalendarCheck, 
  ListTodo, 
  PlusCircle, 
  Heart, 
  Settings,
  Shield,
  Target
} from "lucide-react";
import { THEME_CLASSES } from "../../utils/themeUtils";
import { useAppSelector } from "../../app/hooks";
import { isTodayDate } from "../../utils/dateUtils";

interface SidebarProps {
  onNavigate?: () => void;
}

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-500", group: "Main" },
  { to: "/today", label: "Today", icon: CalendarCheck, color: "text-amber-500", group: "Main" },
  { to: "/profile", label: "Settings", icon: Settings, color: "text-blue-400", group: "Main" },
  { to: "/todos", label: "All Tasks", icon: ListTodo, color: "text-emerald-500", group: "Tasks" },
  { to: "/create-todo", label: "New Task", icon: PlusCircle, color: "text-indigo-500", group: "Tasks" },
  { to: "/heartspace", label: "Heartspace", icon: Heart, color: "text-rose-400", group: "Personal" },
];

const Sidebar = ({ onNavigate }: SidebarProps) => {
  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group relative overflow-hidden ${
       isActive
         ? `bg-blue-600 shadow-lg shadow-blue-500/20 text-white`
         : `hover:bg-gray-100 dark:hover:bg-gray-800/50 ${THEME_CLASSES.text.primary}`
    }`;

  const todos = useAppSelector((state) => state.todo.todos);
  const activeTasksCount = todos.filter(t => 
    t.status !== 'completed' && 
    (t.seriesDates?.some(d => isTodayDate(d)) || isTodayDate(t.scheduledDate))
  ).length;

  const groups = Array.from(new Set(navItems.map(item => item.group)));

  return (
    <div className="flex flex-col h-full py-8 space-y-8">
      <div className="px-6 flex items-center gap-2 opacity-30 select-none">
          <Shield size={14} className="text-gray-400" />
          <div className="h-[1px] flex-1 bg-gray-400" />
      </div>

      <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
        {groups.map(group => (
            <div key={group} className="space-y-2">
                <div className="px-4 text-[9px] font-bold uppercase tracking-wider opacity-40 mb-2">
                    {group}
                </div>
                {navItems.filter(item => item.group === group).map(({ to, label, icon: Icon, color }) => (
                  <NavLink key={to} to={to} end={to === "/"} className={linkStyle} onClick={onNavigate}>
                    {({ isActive }) => (
                        <>
                            <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg' : `${color} bg-gray-100 dark:bg-gray-800 group-hover:scale-110`}`}>
                                <Icon size={16} className="shrink-0" />
                            </div>
                            <span className="relative z-10">{label}</span>
                            {isActive && (
                                <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                            )}
                        </>
                    )}
                  </NavLink>
                ))}
            </div>
        ))}
      </nav>
      
      <div className="px-4 space-y-4">
          <div className={`p-4 rounded-xl border group transition-all duration-300 hover:border-emerald-500/30 ${THEME_CLASSES.surface.secondary} ${THEME_CLASSES.border.base}`}>
              <div className="space-y-3">
                  <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wide opacity-50">Task Overview</span>
                  </div>
                  <div className="flex items-end justify-between">
                      <div className="space-y-0.5">
                          <div className={`text-xl font-bold ${THEME_CLASSES.text.primary}`}>
                              {activeTasksCount > 0 ? `${activeTasksCount} Active` : "Done"}
                          </div>
                          <div className={`text-[10px] font-medium opacity-50 tracking-tight ${THEME_CLASSES.text.tertiary}`}>
                              {activeTasksCount > 0 ? "Daily Progress" : "All Caught Up"}
                          </div>
                      </div>
                      <Target size={18} className="text-emerald-500 opacity-60" />
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Sidebar;