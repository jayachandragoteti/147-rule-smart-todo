import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Layout = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <Navbar onMenuClick={() => setIsOpen(true)} />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 border-r border-borderColor bg-surface transition-colors duration-300">
          <Sidebar />
        </aside>

        {/* Mobile Sidebar */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="w-64 bg-surface p-4 shadow-lg transition-colors duration-300">
              <Sidebar />
              <button
                onClick={() => setIsOpen(false)}
                className="mt-4 text-sm opacity-70"
              >
                Close
              </button>
            </div>
            <div
              className="flex-1 bg-black/40"
              onClick={() => setIsOpen(false)}
            />
          </div>
        )}

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
