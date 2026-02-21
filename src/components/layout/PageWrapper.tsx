const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="space-y-6 transition-colors duration-300">
      {children}
    </div>
  );
};

export default PageWrapper;