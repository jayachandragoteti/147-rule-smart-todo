import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded-md text-sm font-medium transition
     ${
       isActive
         ? "bg-black/5 dark:bg-white/10"
         : "hover:bg-black/5 dark:hover:bg-white/10"
     }`;

  return (
    <nav className="p-4 space-y-2">
      <NavLink to="/" className={linkStyle}>
        Dashboard
      </NavLink>

      <NavLink to="/today" className={linkStyle}>
        Today
      </NavLink>

      <NavLink to="/learning" className={linkStyle}>
        Learning
      </NavLink>
    </nav>
  );
};

export default Sidebar;
