// TodoSpace Service Worker
// Handles: background push notifications, notification click actions

const CACHE_NAME = "todospace-v1";

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// ── Push event (from server push — future use) ───────────────────────────────
self.addEventListener("push", (event) => {
  let data = { title: "TodoSpace", body: "You have a task reminder!", tag: "push" };
  try {
    if (event.data) data = event.data.json();
  } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/favicon.png",
      badge: "/favicon.png",
      tag: data.tag || "push",
      renotify: true,
      data: { url: data.url || "/" },
    })
  );
});

// ── Scheduled reminder (posted from app via postMessage) ─────────────────────
self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "SCHEDULE_NOTIFICATION") {
    const { id, title, body, fireAt, sound } = event.data;
    const delay = new Date(fireAt).getTime() - Date.now();
    if (delay <= 0) return; // already past

    setTimeout(() => {
      self.registration.showNotification(title, {
        body: body || "Time to work on this task!",
        icon: "/favicon.png",
        badge: "/favicon.png",
        tag: `task-${id}`,
        renotify: true,
        data: { url: `/todo/${id}`, sound },
        actions: [
          { action: "open",    title: "Open task" },
          { action: "dismiss", title: "Dismiss" },
        ],
        requireInteraction: false,
        silent: false,
      });
    }, delay);
  }

  if (event.data.type === "CANCEL_NOTIFICATION") {
    const { id } = event.data;
    self.registration.getNotifications({ tag: `task-${id}` }).then((notes) => {
      notes.forEach((n) => n.close());
    });
  }
});

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  notification.close();

  if (event.action === "dismiss") return;

  const url = notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Focus existing window if open
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
