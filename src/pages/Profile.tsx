import { useState, useEffect } from "react";
import { User, Bell, LogOut, Check, Save, RefreshCw } from "lucide-react";
import { useAppDispatch, useAppSelector, useToast } from "../app/hooks";
import PageWrapper from "../components/layout/PageWrapper";
import { THEME_CLASSES } from "../utils/themeUtils";
import { logoutThunk } from "../features/auth/authThunks";
import { getUserProfile, saveUserProfile } from "../services/firebase/profileService";

const Profile = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState("");
  const [notifications, setNotifications] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setDisplayName(profile.displayName || user?.displayName || "");
            setBio(profile.bio || "");
            setNotifications(profile.notificationsEnabled || false);
          }
        } catch (err) {
          console.error("Failed to fetch profile:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      await saveUserProfile({
        uid: user.uid,
        displayName,
        bio,
        notificationsEnabled: notifications,
        email: user.email || ""
      });
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutThunk());
    toast.success("Logged out successfully");
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-1">
          <h2 className={`text-3xl font-bold tracking-tight ${THEME_CLASSES.text.primary}`}>Settings</h2>
          <p className={`text-sm ${THEME_CLASSES.text.tertiary}`}>Manage your account and preferences.</p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Identity Card */}
          <div className={`md:col-span-1 p-6 rounded-2xl border flex flex-col items-center text-center space-y-4 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base} shadow-sm`}>
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-500/20">
                {displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-lg border-2 border-white dark:border-gray-900 flex items-center justify-center text-white shadow-md">
                <Check size={14} />
              </div>
            </div>
            
            <div className="space-y-0.5">
              <h3 className={`text-lg font-bold ${THEME_CLASSES.text.primary}`}>{displayName || "User"}</h3>
              <p className={`text-[10px] font-bold uppercase tracking-widest text-blue-500`}>Personal Account</p>
            </div>

            <div className="w-full pt-4 border-t border-dashed space-y-3">
              <div className="flex items-center justify-between text-[10px] px-1 font-bold uppercase tracking-tight opacity-60">
                <span className={THEME_CLASSES.text.tertiary}>Status</span>
                <span className="text-emerald-500">Online</span>
              </div>
            </div>
          </div>

          {/* Settings Form */}
          <div className="md:col-span-2 space-y-6">
            <div className={`p-6 rounded-2xl border space-y-6 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base} shadow-sm`}>
              {/* Personal Info */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <User size={16} className="text-blue-500" />
                  <h4 className={`text-xs font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>Personal Info</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={`text-[10px] uppercase font-bold tracking-wider ml-1 ${THEME_CLASSES.text.secondary}`}>Name</label>
                    <input 
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-blue-500/20 outline-none ${THEME_CLASSES.input.base}`}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className={`text-[10px] uppercase font-bold tracking-wider ml-1 ${THEME_CLASSES.text.secondary}`}>Bio</label>
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us a bit about yourself..."
                      rows={3}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-blue-500/20 outline-none resize-none ${THEME_CLASSES.input.base}`}
                    />
                  </div>
                </div>
              </section>

              {/* Preferences */}
              <section className="pt-4 border-t border-dashed space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bell size={16} className="text-amber-500" />
                  <h4 className={`text-xs font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>Preferences</h4>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/20">
                  <div className="space-y-0.5">
                    <p className={`text-sm font-bold ${THEME_CLASSES.text.primary}`}>Push Notifications</p>
                    <p className={`text-[10px] ${THEME_CLASSES.text.tertiary}`}>Stay updated with task reminders.</p>
                  </div>
                  <button 
                    onClick={() => setNotifications(!notifications)}
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${notifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </section>

              {/* App Version & Refresh */}
              <section className="pt-4 border-t border-dashed space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw size={16} className="text-emerald-500" />
                  <h4 className={`text-xs font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>App Version</h4>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/20">
                  <div className="space-y-0.5">
                    <p className={`text-sm font-bold ${THEME_CLASSES.text.primary}`}>Fetch Latest Updates</p>
                    <p className={`text-[10px] ${THEME_CLASSES.text.tertiary}`}>Refresh to load newly deployed changes or clear cache.</p>
                  </div>
                  <button 
                    onClick={() => {
                        window.caches?.keys().then(keys => {
                            keys.forEach(key => caches.delete(key));
                        });
                        window.location.reload();
                    }}
                    className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95 whitespace-nowrap"
                  >
                    Update App
                  </button>
                </div>
              </section>

              {/* Save Button */}
              <div className="pt-4 flex gap-3">
                <button 
                  onClick={handleUpdateProfile}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-6 py-3 border border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Sign Out
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
