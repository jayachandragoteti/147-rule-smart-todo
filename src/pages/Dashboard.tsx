import PageWrapper from "../components/layout/PageWrapper";

const Dashboard = () => {
  return (
    <PageWrapper>
      <h2 className="text-2xl font-semibold tracking-tight">
        Dashboard
      </h2>

      <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f2937] rounded-xl p-6 transition-colors duration-300">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Overview of your tasks and learning progress.
        </p>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;