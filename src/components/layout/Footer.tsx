import { THEME_CLASSES } from "../../utils/themeUtils";
import { Activity } from "lucide-react";

const Footer = () => {
  return (
    <footer className={`py-12 border-t transition-all duration-300 ${THEME_CLASSES.surface.base} ${THEME_CLASSES.border.base}`}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center space-y-8">
        <div className="flex items-center gap-4 opacity-30 select-none">
            <div className="h-[1px] w-12 bg-gray-400" />
            <Activity size={16} />
            <div className="h-[1px] w-12 bg-gray-400" />
        </div>

        <div className="flex flex-col items-center space-y-2 text-center">
            <div className={`text-sm font-black uppercase tracking-[0.3em] ${THEME_CLASSES.text.primary}`}>
                137 MISSION CONTROL
            </div>
            <div className={`text-[10px] font-medium tracking-widest opacity-40 uppercase ${THEME_CLASSES.text.tertiary}`}>
                Syncing Human Potential with Digital Precision
            </div>
        </div>

        <div className="flex items-center gap-2 group">
            <span className={`text-[11px] font-bold ${THEME_CLASSES.text.tertiary}`}>
                © {new Date().getFullYear()} Operational Directive
            </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;