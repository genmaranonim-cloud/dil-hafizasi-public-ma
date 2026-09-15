import { getPersistentItem, setPersistentItem } from "./persistent-storage";
import { buildStreakNotificationContent, getAtRiskStreak, isStreakNotificationSnoozed, shouldShowStreakNotification, STREAK_NOTIFICATION_DATE_KEY } from "./streak-notification";
import type { ReminderTime } from "./daily-reminder";
import type { LearningAttempt } from "./learning-motivation";
import { getScheduledStreakTime, type StreakNotificationSchedule } from "./streak-notification-time";

export type BrowserNotificationPermission = "default" | "granted" | "denied";
export type BrowserStreakNotificationResult = "shown" | "not-needed" | "unsupported" | "denied";

type NotificationApi = {
  permission: BrowserNotificationPermission;
  requestPermission: () => Promise<BrowserNotificationPermission>;
  new (title: string, options?: { body: string; icon?: string }): unknown;
};

function getNotificationApi(): NotificationApi | null {
  if (typeof window === "undefined" || !("Notification" in window)) return null;
  return window.Notification as unknown as NotificationApi;
}

export async function requestBrowserStreakNotificationPermission(): Promise<BrowserNotificationPermission> {
  const api = getNotificationApi();
  if (!api) return "default";
  if (api.permission !== "default") return api.permission;
  try {
    return await api.requestPermission();
  } catch {
    return "denied";
  }
}

export async function maybeNotifyStreakAtRisk(history: readonly LearningAttempt[], now: Date = new Date(), scheduledTime: ReminderTime | StreakNotificationSchedule | null = null): Promise<BrowserStreakNotificationResult> {
  const api = getNotificationApi();
  if (!api) return "unsupported";
  if (api.permission !== "granted") return api.permission === "denied" ? "denied" : "not-needed";
  const activeTime = scheduledTime && "weekday" in scheduledTime ? getScheduledStreakTime(scheduledTime, now) : scheduledTime;
  if (activeTime && (now.getHours() !== activeTime.hour || now.getMinutes() !== activeTime.minute)) return "not-needed";
  const lastNotifiedDate = await getPersistentItem(STREAK_NOTIFICATION_DATE_KEY);
  if (await isStreakNotificationSnoozed(now) || !shouldShowStreakNotification(history, now, lastNotifiedDate)) return "not-needed";

  const streak = getAtRiskStreak(history, now);
  const content = buildStreakNotificationContent(streak);
  new api(content.title, { body: content.body });
  await setPersistentItem(STREAK_NOTIFICATION_DATE_KEY, `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`);
  return "shown";
}
