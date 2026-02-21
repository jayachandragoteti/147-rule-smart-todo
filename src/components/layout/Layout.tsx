import { useState } from "react";
import { Outlet } from "react-router-dom";
import { X } from "lucide-react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Layout = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openSidebar = () => setIsOpen(true);
  const closeSidebar = () => setIsOpen(false);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <Navbar onMenuClick={openSidebar} />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 bg-white dark:bg-[#111827] border-r border-gray-200 dark:border-[#1f2937] transition-colors duration-300">
          <Sidebar />
        </aside>

        {/* Mobile Sidebar */}
        <div
          className={`fixed inset-0 z-[9999] md:hidden ${
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
            className={`absolute left-0 top-0 h-full w-64 bg-white dark:bg-[#111827] shadow-xl transform transition-transform duration-300 ease-in-out ${
              isOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-[#1f2937]">
              <span className="font-semibold text-sm">Menu</span>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#1f2937] transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4">
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