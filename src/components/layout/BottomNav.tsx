/**
 * BottomNav — Mobile bottom tab bar
 * Shown only on mobile (md:hidden). Replaces the hamburger drawer pattern.
 */
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ListTodo,
  StickyNote,
  RotateCcw,
  Heart,
  Settings,
} from "lucide-react";
import { THEME_CLASSES } from "../../utils/themeUtils";

const tabs = [
  { to: "/",           label: "Home",      icon: LayoutDashboard, end: true  },
  { to: "/todos",      label: "Tasks",     icon: ListTodo,        end: false },
  { to: "/notes",      label: "Notes",     icon: StickyNote,      end: false },
  { to: "/learning",   label: "Revisions", icon: RotateCcw,       end: false },
  { to: "/heartspace", label: "Heart",     icon: Heart,           end: false },
];

const BottomNav = () => (
  <nav
    className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md ${THEME_CLASSES.surface.navbar} ${THEME_CLASSES.border.base}`}
    style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
  >
    <div className="flex items-stretch h-14">
      {tabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-150 relative ${
              isActive ? "text-[#4f8cff]" : THEME_CLASSES.text.tertiary
            }`
          }
        >
          {({ isActive }) => (
            <>
              {/* Active pill indicator */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#4f8cff] rounded-b-full" />
              )}
              <div
                className={`flex items-center justify-center w-8 h-6 rounded-xl transition-all duration-150 ${
                  isActive ? "bg-[#4f8cff]/10" : ""
                }`}
              >
                <Icon
                  size={isActive ? 18 : 17}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </div>
              <span
                className={`text-[9px] font-semibold leading-none tracking-tight ${
                  isActive ? "text-[#4f8cff]" : "opacity-50"
                }`}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  </nav>
);

export default BottomNav;
