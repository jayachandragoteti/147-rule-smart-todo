import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { registerThunk } from "../../features/auth/authThunks";
import { useNavigate, Link } from "react-router-dom";
import { THEME_CLASSES } from "../../utils/themeUtils";

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
      <div className={`w-full max-w-md border rounded-2xl shadow-sm p-8 transition-colors duration-300 ${THEME_CLASSES.surface.card}`}>

        {/* Heading */}
        <div className="mb-6 text-center">
          <h2 className={`text-2xl font-semibold tracking-tight ${THEME_CLASSES.text.primary}`}>
            Create Account
          </h2>
          <p className={`text-sm mt-1 ${THEME_CLASSES.text.tertiary}`}>
            Start organizing your learning journey
          </p>
        </div>

        {/* Form */}
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
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${THEME_CLASSES.input.base}`}
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
          <span className={THEME_CLASSES.text.tertiary}>
            Already have an account?
          </span>{" "}
          <Link
            to="/login"
            className={THEME_CLASSES.text.link}
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;