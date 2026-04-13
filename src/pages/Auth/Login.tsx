import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { loginThunk } from "../../features/auth/authThunks";
import { Link, useNavigate } from "react-router-dom";
import { THEME_CLASSES } from "../../utils/themeUtils";
import { Mail, Lock, LogIn, Sparkles, ArrowRight } from "lucide-react";

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) return;
    const result = await dispatch(loginThunk({ email, password }));
    if (loginThunk.fulfilled.match(result)) {
      navigate("/");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${THEME_CLASSES.surface.secondary}`}>
      <div className={`w-full max-w-md border rounded-[3rem] shadow-2xl p-10 space-y-8 transition-all ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 mx-auto">
                <LogIn size={32} />
            </div>
            <div className="absolute -top-1 -right-1 p-1.5 bg-amber-500 rounded-full text-white shadow-lg animate-bounce">
                <Sparkles size={12} />
            </div>
          </div>
          
          <div className="space-y-1">
            <h2 className={`text-2xl font-bold tracking-tight ${THEME_CLASSES.text.primary}`}>
                Welcome Back
            </h2>
            <p className={`text-sm font-medium ${THEME_CLASSES.text.tertiary}`}>
                Sign in to access your tasks.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className={`block text-[10px] font-bold uppercase tracking-widest ml-1 ${THEME_CLASSES.text.secondary}`}>
              Email Address
            </label>
            <div className="relative group">
                <Mail size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${THEME_CLASSES.text.tertiary} group-focus-within:text-blue-500`} />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm font-medium transition-all focus:ring-4 focus:ring-blue-500/10 ${THEME_CLASSES.input.base}`}
                />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className={`block text-[10px] font-bold uppercase tracking-widest ml-1 ${THEME_CLASSES.text.secondary}`}>
              Password
            </label>
            <div className="relative group">
                <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${THEME_CLASSES.text.tertiary} group-focus-within:text-blue-500`} />
                <input
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm font-medium transition-all focus:ring-4 focus:ring-blue-500/10 ${THEME_CLASSES.input.base}`}
                />
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Logging in..." : (
                <>
                    Login
                    <ArrowRight size={18} />
                </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl animate-shake">
                <p className="text-xs text-red-600 dark:text-red-400 font-bold text-center">
                  {error}
                </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-dashed border-gray-100 dark:border-gray-800 text-center space-y-3">
          <p className="text-sm font-medium">
            <span className={THEME_CLASSES.text.tertiary}>
              New here?
            </span>{" "}
            <Link
              to="/register"
              className="text-blue-500 font-bold hover:underline"
            >
              Create Account
            </Link>
          </p>
          <div className={`text-[9px] font-medium uppercase tracking-wider opacity-30 ${THEME_CLASSES.text.tertiary}`}>
            Secure · TodoSpace
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;