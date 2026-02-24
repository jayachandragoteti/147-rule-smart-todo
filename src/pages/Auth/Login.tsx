import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { loginThunk } from "../../features/auth/authThunks";
import { Link, useNavigate } from "react-router-dom";
import { THEME_CLASSES } from "../../utils/themeUtils";

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const result = await dispatch(loginThunk({ email, password }));
    if (loginThunk.fulfilled.match(result)) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className={`w-full max-w-md border rounded-2xl shadow-sm p-8 transition-colors duration-300 ${THEME_CLASSES.surface.card}`}>

        <div className="mb-6 text-center">
          <h2 className={`text-2xl font-semibold tracking-tight ${THEME_CLASSES.text.primary}`}>
            Welcome Back
          </h2>
          <p className={`text-sm mt-1 ${THEME_CLASSES.text.tertiary}`}>
            Login to continue your productivity journey
          </p>
        </div>

        <div className="space-y-4">

          {/* Email */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${THEME_CLASSES.text.primary}`}>
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${THEME_CLASSES.input.base}`}
            />
          </div>

          {/* Password */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${THEME_CLASSES.text.primary}`}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${THEME_CLASSES.input.base}`}
            />
          </div>

          {/* Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
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
          <span className={THEME_CLASSES.text.tertiary}>
            Don't have an account?
          </span>{" "}
          <Link
            to="/register"
            className={THEME_CLASSES.text.link}
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;