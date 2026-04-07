import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

/**
 * Wraps protected routes. Redirects to /login if unauthenticated.
 * Uses <Outlet /> so it can be used as a layout route wrapper.
 */
export default function ProtectedRoute() {
  const { user, isAuthChecked } = useAppSelector((state) => state.auth);

  // Wait until Firebase finishes checking auth state
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
