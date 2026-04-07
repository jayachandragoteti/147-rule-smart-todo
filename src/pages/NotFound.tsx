import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="text-center space-y-6">
        <div className="text-8xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          404
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Page Not Found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <Home size={18} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
