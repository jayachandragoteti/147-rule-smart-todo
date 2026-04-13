import { Link } from "react-router-dom";
import { Home, Compass, MoveLeft } from "lucide-react";
import { THEME_CLASSES } from "../utils/themeUtils";

const NotFound = () => {
  return (
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${THEME_CLASSES.surface.secondary}`}>
      <div className="max-w-xl w-full text-center space-y-10 p-12 rounded-[3.5rem] border shadow-2xl shadow-blue-500/[0.03] bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
        <div className="relative inline-block">
            <div className="text-[10rem] font-black leading-none bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent select-none opacity-20">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-blue-500 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 animate-pulse">
                    <Compass size={48} />
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <h1 className={`text-4xl font-black tracking-tight ${THEME_CLASSES.text.primary}`}>
              Page Not Found
            </h1>
            <p className={`text-lg font-medium leading-relaxed max-w-sm mx-auto ${THEME_CLASSES.text.tertiary}`}>
              The page you are looking for doesn't exist or has been moved.
            </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
                onClick={() => window.history.back()}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest border transition-all active:scale-95 ${THEME_CLASSES.border.base} ${THEME_CLASSES.text.primary} ${THEME_CLASSES.button.hover}`}
            >
                <MoveLeft size={18} />
                Go Back
            </button>
            <Link
              to="/"
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95"
            >
              <Home size={18} />
              Go Home
            </Link>
        </div>

        <div className="pt-8 border-t border-dashed border-gray-100 dark:border-gray-800">
            <p className={`text-[10px] uppercase font-black tracking-[0.3em] opacity-30 ${THEME_CLASSES.text.tertiary}`}>
                Error 404 // TodoSpace
            </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

