import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { registerThunk } from "../../features/auth/authThunks";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    const result = await dispatch(registerThunk({ email, password }));

    if (registerThunk.fulfilled.match(result)) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f2937] rounded-2xl shadow-sm p-8 transition-colors duration-300">

        {/* Heading */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Create Account
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Start organizing your learning journey
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#1f2937] bg-gray-50 dark:bg-[#0f172a] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#1f2937] bg-gray-50 dark:bg-[#0f172a] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Register Button */}
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Register"}
          </button>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 text-center mt-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Already have an account?
          </span>{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline dark:text-blue-400 cursor-pointer"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;