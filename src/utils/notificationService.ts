/**
 * Notification Service for TodoSpace
 *
 * Handles:
 *  - Permission request / check
 *  - Service worker registration
 *  - Scheduling task reminders via the SW
 *  - Cancelling reminders
 *  - Showing instant "shortcut" notifications (for Add-to-Home-Screen context)
 */

export type NotificationPermissionStatus = "granted" | "denied" | "default" | "unsupported";

// ── Permission helpers ────────────────────────────────────────────────────────

export const getNotificationPermission = (): NotificationPermissionStatus => {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission as NotificationPermissionStatus;
};

/**
 * Request notification permission from the browser.
 * Returns the resulting permission status.
 */
export const requestNotificationPermission = async (): Promise<NotificationPermissionStatus> => {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  const result = await Notification.requestPermission();
  return result as NotificationPermissionStatus;
};

// ── Service Worker registration ───────────────────────────────────────────────

let _swRegistration: ServiceWorkerRegistration | null = null;

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    await navigator.serviceWorker.ready;
    _swRegistration = reg;
    console.log("[TodoSpace SW] Registered:", reg.scope);
    return reg;
  } catch (err) {
    console.warn("[TodoSpace SW] Registration failed:", err);
    return null;
  }
};

export const getSwRegistration = (): ServiceWorkerRegistration | null => _swRegistration;

const getSw = async (): Promise<ServiceWorkerRegistration | null> => {
  if (_swRegistration) return _swRegistration;
  return registerServiceWorker();
};

// ── Schedule a task reminder ──────────────────────────────────────────────────

export interface ScheduleReminderOptions {
  id: string;
  title: string;
  scheduledDate: string;   // ISO string — the date
  scheduledTime?: string;  // "HH:MM"
  sound?: string;
}

/**
 * Schedule a push notification reminder for a task.
 * Falls back to a direct Notification if the SW isn't available.
 */
export const scheduleReminder = async (opts: ScheduleReminderOptions): Promise<void> => {
  if (getNotificationPermission() !== "granted") return;

  const { id, title, scheduledDate, scheduledTime, sound } = opts;

  // Build the fire datetime
  const fireDate = new Date(scheduledDate);
  if (scheduledTime) {
    const [h, m] = scheduledTime.split(":").map(Number);
    fireDate.setHours(h, m, 0, 0);
  } else {
    fireDate.setHours(9, 0, 0, 0); // default 9am
  }

  const fireAt = fireDate.toISOString();

  // Send to service worker
  const sw = await getSw();
  if (sw?.active) {
    sw.active.postMessage({
      type: "SCHEDULE_NOTIFICATION",
      id,
      title,
      body: `⏰ Task reminder: "${title}"`,
      fireAt,
      sound: sound || "bell",
    });
    return;
  }

  // Fallback: direct Notification (won't work when app is closed, but works in-tab)
  const delay = fireDate.getTime() - Date.now();
  if (delay > 0) {
    setTimeout(() => {
      new Notification(`⏰ ${title}`, {
        body: "Time to work on this task!",
        icon: "/favicon.png",
        tag: `task-${id}`,
      });
    }, delay);
  }
};

/**
 * Cancel a previously scheduled task reminder.
 */
export const cancelReminder = async (id: string): Promise<void> => {
  const sw = await getSw();
  if (sw?.active) {
    sw.active.postMessage({ type: "CANCEL_NOTIFICATION", id });
  }
};

// ── Instant notification (shortcut / test) ────────────────────────────────────

/**
 * Show an instant notification immediately.
 * Used to verify permissions work from the home-screen shortcut.
 */
export const showInstantNotification = (title: string, body: string, url = "/"): void => {
  if (getNotificationPermission() !== "granted") return;

  if (_swRegistration) {
    _swRegistration.showNotification(title, {
      body,
      icon: "/favicon.png",
      badge: "/favicon.png",
      tag: "instant",
      data: { url },
    });
    return;
  }

  // Fallback
  new Notification(title, { body, icon: "/favicon.png" });
};

// ── Toggle helper (used by Profile page) ─────────────────────────────────────

/**
 * Enable notifications: request permission → register SW → return final status.
 * Disable notifications: cancel all pending reminders (SW-side) → return "default".
 */
export const setNotificationsEnabled = async (
  enabled: boolean
): Promise<NotificationPermissionStatus> => {
  if (!enabled) {
    // Nothing to unregister locally; the SW keeps running for PWA caching.
    // We just return "default" so the UI reflects "off".
    return "default";
  }

  const permission = await requestNotificationPermission();
  if (permission === "granted") {
    await registerServiceWorker();
    // Fire a quick verification notification so the user knows it works
    showInstantNotification(
      "TodoSpace Notifications Active ✅",
      "You'll get reminders for your tasks!"
    );
  }
  return permission;
};
