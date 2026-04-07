import { NavLink } from "react-router-dom";
import { LayoutDashboard, CalendarCheck, ListTodo, PlusCircle } from "lucide-react";
import { THEME_CLASSES } from "../../utils/themeUtils";

interface SidebarProps {
  onNavigate?: () => void;
}

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/today", label: "Today", icon: CalendarCheck },
  { to: "/todos", label: "All Tasks", icon: ListTodo },
  { to: "/create-todo", label: "Add Todo", icon: PlusCircle },
];

const Sidebar = ({ onNavigate }: SidebarProps) => {
  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${THEME_CLASSES.text.primary}
     ${
       isActive
         ? `${THEME_CLASSES.surface.active}`
         : `${THEME_CLASSES.button.hover}`
     }`;

  return (
    <nav className="space-y-1 py-2">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} end={to === "/"} className={linkStyle} onClick={onNavigate}>
          <Icon size={18} className="shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
};

export default Sidebar;