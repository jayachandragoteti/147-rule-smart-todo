import { User, Mail, Shield, Zap, LogOut } from "lucide-react";
import { useAppDispatch, useAppSelector, useToast } from "../app/hooks";
import PageWrapper from "../components/layout/PageWrapper";
import { THEME_CLASSES } from "../utils/themeUtils";
import { logoutThunk } from "../features/auth/authThunks";

const Profile = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const toast = useToast();

  const handleLogout = () => {
    dispatch(logoutThunk());
    toast.success("Successfully logged out");
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="space-y-2">
          <h2 className={`text-4xl font-black tracking-tight ${THEME_CLASSES.text.primary}`}>Operative Profile</h2>
          <p className={`${THEME_CLASSES.text.tertiary}`}>Management of your unique operational identity and grid access.</p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Identity Card */}
          <div className={`md:col-span-1 p-8 rounded-[3rem] border flex flex-col items-center text-center space-y-6 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base} shadow-2xl shadow-blue-500/5`}>
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-blue-500/30 group-hover:scale-105 transition-transform duration-500">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center text-white shadow-lg animate-pulse">
                <Shield size={18} />
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className={`text-xl font-black ${THEME_CLASSES.text.primary}`}>{user?.displayName || "Anonymous Operative"}</h3>
              <p className={`text-xs font-bold uppercase tracking-widest text-blue-500`}>Level 4 Strategic Lead</p>
            </div>

            <div className="w-full pt-6 border-t border-dashed space-y-4">
              <div className="flex items-center justify-between text-xs px-2">
                <span className={`font-bold uppercase tracking-tighter opacity-50 ${THEME_CLASSES.text.tertiary}`}>Grid Uptime</span>
                <span className={`font-black ${THEME_CLASSES.text.primary}`}>99.8%</span>
              </div>
              <div className="flex items-center justify-between text-xs px-2">
                <span className={`font-bold uppercase tracking-tighter opacity-50 ${THEME_CLASSES.text.tertiary}`}>Missions Sync</span>
                <span className={`font-black ${THEME_CLASSES.text.primary}`}>Activated</span>
              </div>
            </div>
          </div>

          {/* Configuration Settings */}
          <div className="md:col-span-2 space-y-6">
            <div className={`p-8 rounded-[3rem] border space-y-8 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
              <div className="space-y-1">
                <h4 className={`text-sm font-black uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>Grid Authorizations</h4>
                <div className="h-[1px] w-12 bg-blue-500" />
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-6 p-4 rounded-3xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <Mail size={20} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-[10px] font-black uppercase tracking-widest opacity-40 mb-0.5`}>Primary Comms</p>
                    <p className={`font-bold ${THEME_CLASSES.text.primary}`}>{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 p-4 rounded-3xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <Shield size={20} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-[10px] font-black uppercase tracking-widest opacity-40 mb-0.5`}>System Access</p>
                    <p className={`font-bold ${THEME_CLASSES.text.primary}`}>Firebase Tactical Cloud</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 p-4 rounded-3xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-all">
                    <Zap size={20} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-[10px] font-black uppercase tracking-widest opacity-40 mb-0.5`}>Active Protocol</p>
                    <p className={`font-bold ${THEME_CLASSES.text.primary}`}>1-4-7 Spaced Repetition</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-dashed">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 active:scale-95 transition-all"
                >
                  <LogOut size={18} />
                  Terminate Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Profile;
