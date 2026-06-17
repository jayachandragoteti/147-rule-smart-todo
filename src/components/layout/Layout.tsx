import { Outlet } from "react-router-dom";
import { THEME_CLASSES } from "../../utils/themeUtils";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import NotificationManager from "../notifications/NotificationManager";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <NotificationManager />
      <Navbar />

      <div className="flex flex-1 items-start">
        {/* Desktop Sidebar — hidden on mobile */}
        <aside
          className={`hidden md:block w-64 border-r sticky top-14 h-[calc(100vh-3.5rem)] overflow-hidden ${THEME_CLASSES.surface.base} ${THEME_CLASSES.border.base}`}
        >
          <Sidebar />
        </aside>

        {/* Main Content — extra bottom padding on mobile for the bottom nav bar */}
        <main className="flex-1 px-4 sm:px-8 py-6 pb-20 md:pb-6 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Desktop footer — hidden on mobile (bottom nav takes that space) */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Mobile bottom tab navigation */}
      <BottomNav />
    </div>
  );
};

export default Layout;