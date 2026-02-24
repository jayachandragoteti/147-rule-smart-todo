import { NavLink } from "react-router-dom";
import { THEME_CLASSES } from "../../utils/themeUtils";

interface SidebarProps {
  onNavigate?: () => void;
}

const Sidebar = ({ onNavigate }: SidebarProps) => {
  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${THEME_CLASSES.text.primary}
     ${
       isActive
         ? `${THEME_CLASSES.surface.active}`
         : `${THEME_CLASSES.button.hover}`
     }`;

  return (
    <nav className="space-y-2">
      <NavLink to="/" className={linkStyle} onClick={onNavigate}>
        Dashboard
      </NavLink>
      <NavLink to="/today" className={linkStyle} onClick={onNavigate}>
        Today
      </NavLink>
      <NavLink to="/create-todo" className={linkStyle} onClick={onNavigate}>Add todo</NavLink>
      
      <NavLink to="/learning" className={linkStyle} onClick={onNavigate}>
        Learning
      </NavLink>
    </nav>
  );
};

export default Sidebar;