import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { registerThunk } from "../../features/auth/authThunks";
import { useNavigate, Link } from "react-router-dom";
import { THEME_CLASSES } from "../../utils/themeUtils";
import { Mail, Lock, UserPlus, ArrowRight, ShieldCheck } from "lucide-react";

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
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${THEME_CLASSES.surface.secondary}`}>
      <div className={`w-full max-w-md border rounded-[3rem] shadow-2xl p-10 space-y-8 transition-all ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 mx-auto">
                <UserPlus size={32} />
            </div>
            <div className="absolute -top-1 -right-1 p-1.5 bg-blue-500 rounded-full text-white shadow-lg animate-pulse">
                <ShieldCheck size={12} />
            </div>
          </div>
          
          <div className="space-y-1">
            <h2 className={`text-3xl font-bold tracking-tight ${THEME_CLASSES.text.primary}`}>
                Create Account
            </h2>
            <p className={`text-sm font-medium ${THEME_CLASSES.text.tertiary}`}>
                Start your journey with Smart Todo.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className={`block text-[10px] font-bold uppercase tracking-widest ml-1 ${THEME_CLASSES.text.secondary}`}>
              Email ADDRESS
            </label>
            <div className="relative group">
                <Mail size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${THEME_CLASSES.text.tertiary} group-focus-within:text-emerald-500`} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm font-medium transition-all focus:ring-4 focus:ring-emerald-500/10 ${THEME_CLASSES.input.base}`}
                />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className={`block text-[10px] font-bold uppercase tracking-widest ml-1 ${THEME_CLASSES.text.secondary}`}>
              Password
            </label>
            <div className="relative group">
                <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${THEME_CLASSES.text.tertiary} group-focus-within:text-emerald-500`} />
                <input
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm font-medium transition-all focus:ring-4 focus:ring-emerald-500/10 ${THEME_CLASSES.input.base}`}
                />
            </div>
          </div>

          {/* Register Button */}
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Creating account..." : (
                <>
                    Sign Up
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
              Already registered?
            </span>{" "}
            <Link
              to="/login"
              className="text-emerald-500 font-bold hover:underline"
            >
              Login instead
            </Link>
          </p>
          <div className={`text-[9px] font-bold uppercase tracking-wider opacity-30 ${THEME_CLASSES.text.tertiary}`}>
            Secure Signup // 147 Smart Todo
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;