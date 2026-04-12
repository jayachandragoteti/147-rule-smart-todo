import { useState } from "react";
import { Outlet } from "react-router-dom";
import { X } from "lucide-react";
import { THEME_CLASSES } from "../../utils/themeUtils";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import NotificationManager from "../notifications/NotificationManager";

const Layout = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openSidebar = () => setIsOpen(true);
  const closeSidebar = () => setIsOpen(false);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <NotificationManager />
      <Navbar onMenuClick={openSidebar} />

      <div className="flex flex-1 items-start">
        {/* Desktop Sidebar */}
        <aside className={`hidden md:block w-64 border-r sticky top-16 h-[calc(100vh-4rem)] overflow-hidden ${THEME_CLASSES.surface.base} ${THEME_CLASSES.border.base}`}>
          <Sidebar />
        </aside>

        {/* Mobile Sidebar */}
        <div
          className={`fixed inset-0 z-50 md:hidden ${
            isOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <div
            onClick={closeSidebar}
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          />

          <div
            className={`absolute left-0 top-0 h-full w-64 flex flex-col ${THEME_CLASSES.surface.base} shadow-xl transform transition-transform duration-300 ease-in-out ${
              isOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className={`flex items-center justify-between px-4 py-4 border-b ${THEME_CLASSES.border.base}`}>
              <span className="font-semibold text-sm">Menu</span>
              <button
                onClick={closeSidebar}
                className={`p-2 rounded-md transition cursor-pointer ${THEME_CLASSES.surface.hover}`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 flex-1 h-[calc(100%-4rem)] overflow-hidden">
              <Sidebar onNavigate={closeSidebar} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Layout;