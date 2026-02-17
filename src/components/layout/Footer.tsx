const Footer = () => {
  return (
    <footer className="h-12 flex items-center justify-center text-sm border-t border-borderColor bg-surface transition-colors duration-300 opacity-70">
      © {new Date().getFullYear()} 147RuleSmartTodo — Built with Focus.
    </footer>
  );
};

export default Footer;
