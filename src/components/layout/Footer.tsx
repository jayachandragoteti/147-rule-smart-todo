import { THEME_CLASSES } from "../../utils/themeUtils";

const Footer = () => {
  return (
    <footer className={`h-12 flex items-center justify-center text-sm border-t transition-colors duration-300 ${THEME_CLASSES.surface.base} ${THEME_CLASSES.border.base} ${THEME_CLASSES.text.tertiary}`}>
      © {new Date().getFullYear()} 147RuleSmartTodo — Built with Focus.
    </footer>
  );
};

export default Footer;