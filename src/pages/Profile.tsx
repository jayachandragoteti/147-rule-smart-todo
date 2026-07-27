import { useState, useEffect, useCallback } from "react";
import {
  User, Bell, LogOut, Check, Save, RefreshCw,
  BellOff, BellRing, AlertCircle, CheckCircle2, Smartphone,
} from "lucide-react";
import { useAppDispatch, useAppSelector, useToast } from "../app/hooks";
import PageWrapper from "../components/layout/PageWrapper";
import { THEME_CLASSES } from "../utils/themeUtils";
import { logoutThunk } from "../features/auth/authThunks";
import { getUserProfile, saveUserProfile } from "../services/firebase/profileService";
import { clearBrowserCacheAndReload } from "../utils/cacheUtils";
import {
  getNotificationPermission,
  setNotificationsEnabled,
  showInstantNotification,
  type NotificationPermissionStatus,
} from "../utils/notificationService";

const Profile = () => {
  const { user }  = useAppSelector((state) => state.auth);
  const dispatch  = useAppDispatch();
  const toast     = useToast();

  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [displayName,   setDisplayName]   = useState(user?.displayName || "");
  const [bio,           setBio]           = useState("");
  const [notifications, setNotifications] = useState(false);
  const [togglingNotif, setTogglingNotif] = useState(false);

  // Live browser permission state (re-read on each render cycle)
  const [permStatus, setPermStatus] = useState<NotificationPermissionStatus>(
    getNotificationPermission()
  );

  // Re-check OS permission every time the component becomes visible
  // (catches the case where user changed permission in browser settings externally)
  const recheckPermission = useCallback(() => {
    setPermStatus(getNotificationPermission());
  }, []);

  useEffect(() => {
    // Recheck when window regains focus (user comes back from browser settings)
    window.addEventListener("focus", recheckPermission);
    return () => window.removeEventListener("focus", recheckPermission);
  }, [recheckPermission]);

  // Fetch saved profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) return;
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
    };
    fetchProfile();
  }, [user]);

  // ── Toggle notifications ──────────────────────────────────────────────────
  const handleNotificationToggle = async () => {
    setTogglingNotif(true);
    try {
      const newEnabled = !notifications;
      const result = await setNotificationsEnabled(newEnabled);
      setPermStatus(result);

      if (newEnabled) {
        if (result === "granted") {
          setNotifications(true);
          toast.success("Notifications enabled! You'll get task reminders. 🔔");
        } else if (result === "denied") {
          setNotifications(false);
          toast.error(
            "Notifications blocked by browser. Please enable them in your browser/OS settings."
          );
        } else if (result === "unsupported") {
          toast.error("This browser doesn't support notifications.");
        }
      } else {
        setNotifications(false);
        toast.success("Notifications disabled.");
      }
    } finally {
      setTogglingNotif(false);
    }
  };

  // ── Test notification ─────────────────────────────────────────────────────
  const handleTestNotification = () => {
    if (permStatus !== "granted") {
      toast.error("Enable notifications first.");
      return;
    }
    showInstantNotification(
      "TodoSpace Test 🎉",
      "Notifications are working perfectly!",
      "/"
    );
    toast.success("Test notification sent!");
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleUpdateProfile = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      await saveUserProfile({
        uid: user.uid,
        displayName,
        bio,
        notificationsEnabled: notifications,
        email: user.email || "",
      });
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutThunk());
    toast.success("Logged out successfully.");
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4f8cff]" />
        </div>
      </PageWrapper>
    );
  }

  // ── Permission status pill ────────────────────────────────────────────────
  const PermBadge = () => {
    const cfg: Record<NotificationPermissionStatus, { label: string; color: string; icon: React.ReactNode }> = {
      granted:     { label: "Allowed",     color: "text-[#22c55e] bg-[#22c55e]/10", icon: <CheckCircle2 size={11} /> },
      denied:      { label: "Blocked",     color: "text-[#ef4444] bg-[#ef4444]/10", icon: <AlertCircle size={11} /> },
      default:     { label: "Not set",     color: "text-[#a0a6b5] bg-white/5",      icon: <Bell size={11} /> },
      unsupported: { label: "Unsupported", color: "text-[#606878] bg-white/5",      icon: <BellOff size={11} /> },
    };
    const c = cfg[permStatus];
    return (
      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${c.color}`}>
        {c.icon} {c.label}
      </span>
    );
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <header className="space-y-0.5">
          <h1 className={`text-2xl font-bold tracking-tight ${THEME_CLASSES.text.primary}`}>Settings</h1>
          <p className={`text-sm ${THEME_CLASSES.text.tertiary}`}>Manage your account and preferences.</p>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Identity card */}
          <div className={`md:col-span-1 p-6 rounded-2xl border flex flex-col items-center text-center space-y-4 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#4f8cff] to-[#818cf8] flex items-center justify-center text-white text-2xl font-bold shadow-[0_0_20px_rgba(79,140,255,0.3)]">
                {displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#22c55e] rounded-lg border-2 border-white dark:border-[#0f1117] flex items-center justify-center text-white shadow-md">
                <Check size={12} />
              </div>
            </div>
            <div className="space-y-0.5">
              <h3 className={`text-base font-bold ${THEME_CLASSES.text.primary}`}>{displayName || "User"}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4f8cff]">Personal Account</p>
            </div>
            <div className={`w-full pt-3 border-t border-dashed ${THEME_CLASSES.border.base}`}>
              <div className="flex items-center justify-between text-[10px] px-1 font-bold uppercase tracking-tight">
                <span className={THEME_CLASSES.text.tertiary}>Status</span>
                <span className="text-[#22c55e]">Online</span>
              </div>
            </div>
          </div>

          {/* Settings form */}
          <div className="md:col-span-2 space-y-5">
            {/* Personal info */}
            <div className={`p-5 rounded-2xl border space-y-5 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
              <div className="flex items-center gap-2">
                <User size={15} className="text-[#4f8cff]" />
                <h4 className={`text-xs font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>Personal Info</h4>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className={`text-[10px] uppercase font-bold tracking-wider ml-1 ${THEME_CLASSES.text.secondary}`}>Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-[#4f8cff]/20 outline-none ${THEME_CLASSES.input.base}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-[10px] uppercase font-bold tracking-wider ml-1 ${THEME_CLASSES.text.secondary}`}>Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a bit about yourself..."
                    rows={2}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-[#4f8cff]/20 outline-none resize-none ${THEME_CLASSES.input.base}`}
                  />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className={`p-5 rounded-2xl border space-y-4 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
              <div className="flex items-center gap-2">
                <BellRing size={15} className="text-[#f59e0b]" />
                <h4 className={`text-xs font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>Notifications</h4>
                <PermBadge />
              </div>

              {/* Main toggle */}
              <div className={`flex items-center justify-between p-4 rounded-xl ${THEME_CLASSES.surface.secondary}`}>
                <div className="space-y-0.5">
                  <p className={`text-sm font-semibold ${THEME_CLASSES.text.primary}`}>Push Notifications</p>
                  <p className={`text-[10px] ${THEME_CLASSES.text.tertiary}`}>
                    {permStatus === "denied"
                      ? "⚠️ Blocked — open browser settings to allow"
                      : permStatus === "granted"
                      ? "Active — you'll receive task reminders"
                      : "Enable to receive task reminders"}
                  </p>
                </div>
                <button
                  onClick={handleNotificationToggle}
                  disabled={togglingNotif || permStatus === "unsupported"}
                  className={`w-12 h-6 rounded-full transition-all relative flex items-center px-0.5 shrink-0 ${
                    notifications && permStatus === "granted"
                      ? "bg-[#4f8cff]"
                      : "bg-gray-300 dark:bg-white/10"
                  } disabled:opacity-40`}
                  aria-label="Toggle notifications"
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${
                      notifications && permStatus === "granted" ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Test notification button */}
              {permStatus === "granted" && (
                <button
                  onClick={handleTestNotification}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all hover:border-[#4f8cff]/30 ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.secondary}`}
                >
                  <Bell size={13} className="text-[#4f8cff]" />
                  Send test notification
                </button>
              )}

              {/* Blocked message */}
              {permStatus === "denied" && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#ef4444]/5 border border-[#ef4444]/20 text-[#ef4444]">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-semibold mb-0.5">Notifications blocked</p>
                    <p className="opacity-80">
                      Open your browser's site settings and allow notifications for this site, then toggle back on.
                    </p>
                  </div>
                </div>
              )}

              {/* PWA hint */}
              <div className={`flex items-start gap-2.5 p-3 rounded-xl ${THEME_CLASSES.surface.secondary} border ${THEME_CLASSES.border.base}`}>
                <Smartphone size={13} className="text-[#818cf8] shrink-0 mt-0.5" />
                <p className={`text-[10px] leading-relaxed ${THEME_CLASSES.text.tertiary}`}>
                  <span className="font-semibold text-[#818cf8]">Added to Home Screen?</span>{" "}
                  For notifications to work as a shortcut/PWA, enable notifications in this Settings page <em>while the app is open in the browser first</em>, then add to home screen.
                </p>
              </div>
            </div>

            {/* App version / refresh */}
            <div className={`p-5 rounded-2xl border space-y-3 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
              <div className="flex items-center gap-2">
                <RefreshCw size={15} className="text-[#22c55e]" />
                <h4 className={`text-xs font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>App Version</h4>
              </div>
              <div className={`flex items-center justify-between p-4 rounded-xl ${THEME_CLASSES.surface.secondary}`}>
                <div className="space-y-0.5">
                  <p className={`text-sm font-semibold ${THEME_CLASSES.text.primary}`}>Fetch Latest Updates</p>
                  <p className={`text-[10px] ${THEME_CLASSES.text.tertiary}`}>Clear cache and reload newly deployed changes.</p>
                </div>
                <button
                  onClick={clearBrowserCacheAndReload}
                  className="px-4 py-2 bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-[#22c55e] rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95 whitespace-nowrap"
                >
                  Update App
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleUpdateProfile}
                disabled={saving}
                className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 ${THEME_CLASSES.button.primary}`}
              >
                <Save size={15} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleLogout}
                className="px-5 py-3 border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/5 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center gap-2"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Profile;
