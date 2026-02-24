import PageWrapper from "../components/layout/PageWrapper";
import { THEME_CLASSES } from "../utils/themeUtils";

const Dashboard = () => {
  return (
    <PageWrapper>
      <h2 className={`text-2xl font-semibold tracking-tight ${THEME_CLASSES.text.primary}`}>
        Dashboard
      </h2>

      <div className={`border rounded-xl p-6 transition-colors duration-300 ${THEME_CLASSES.surface.card}`}>
        <p className={`text-sm ${THEME_CLASSES.text.secondary}`}>
          Overview of your tasks and learning progress.
        </p>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;