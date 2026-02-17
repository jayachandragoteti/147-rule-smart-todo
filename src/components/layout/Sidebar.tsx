import { NavLink } from "react-router-dom";

interface SidebarProps {
  onNavigate?: () => void;
}

const Sidebar = ({ onNavigate }: SidebarProps) => {
  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded-md text-sm font-medium transition
     ${
       isActive
         ? "bg-gray-200 dark:bg-[#1f2937]"
         : "hover:bg-gray-100 dark:hover:bg-[#1f2937]"
     }`;

  return (
    <nav className="space-y-2">
      <NavLink to="/" className={linkStyle} onClick={onNavigate}>
        Dashboard
      </NavLink>

      <NavLink to="/today" className={linkStyle} onClick={onNavigate}>
        Today
      </NavLink>

      <NavLink to="/learning" className={linkStyle} onClick={onNavigate}>
        Learning
      </NavLink>
    </nav>
  );
};

export default Sidebar;
