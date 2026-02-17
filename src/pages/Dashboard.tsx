import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logoutThunk } from "../features/auth/authThunks";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2">Welcome: {user?.email}</p>

      <button
        onClick={() => dispatch(logoutThunk())}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
