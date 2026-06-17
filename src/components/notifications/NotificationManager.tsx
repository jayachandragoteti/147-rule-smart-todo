/**
 * NotificationManager — deliberately a no-op.
 *
 * All reminder scheduling and in-app alert display is handled exclusively by
 * ReminderSystem.tsx (mounted in App.tsx) which uses the shared soundEngine
 * and avoids AudioContext leaks.
 *
 * This component is kept as a named export to preserve the import in Layout.tsx
 * without requiring a Layout refactor.
 */
const NotificationManager = () => null;
export default NotificationManager;
