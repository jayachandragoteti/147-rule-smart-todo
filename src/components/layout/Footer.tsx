const Footer = () => {
  return (
    <footer className="h-12 flex items-center justify-center text-sm bg-white dark:bg-[#111827] border-t border-gray-200 dark:border-[#1f2937] transition-colors duration-300 text-gray-500 dark:text-gray-400">
      © {new Date().getFullYear()} 147RuleSmartTodo — Built with Focus.
    </footer>
  );
};

export default Footer;