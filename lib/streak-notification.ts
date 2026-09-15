import { type LearningAttempt } from "./learning-motivation";
import { getPersistentItem, setPersistentItem } from "./persistent-storage";

export const STREAK_NOTIFICATION_DATE_KEY = "dil-hafizasi-streak-notification-date";
export const STREAK_NOTIFICATION_SNOOZE_DATE_KEY = "dil-hafizasi-streak-notification-snooze-date";

export type StreakNotificationContent = {
  title: string;
  body: string;
};

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export async function snoozeStreakNotificationForToday(now: Date = new Date()): Promise<void> {
  await setPersistentItem(STREAK_NOTIFICATION_SNOOZE_DATE_KEY, localDateKey(now));
}

export async function isStreakNotificationSnoozed(now: Date = new Date()): Promise<boolean> {
  return (await getPersistentItem(STREAK_NOTIFICATION_SNOOZE_DATE_KEY)) === localDateKey(now);
}

function hasPracticeOn(history: readonly LearningAttempt[], date: Date): boolean {
  const key = localDateKey(date);
  return history.some((attempt) => {
    const createdAt = new Date(attempt.createdAt);
    return !Number.isNaN(createdAt.getTime()) && localDateKey(createdAt) === key;
  });
}

export function getAtRiskStreak(history: readonly LearningAttempt[], now: Date = new Date()): number {
  const cursor = new Date(now);
  cursor.setHours(12, 0, 0, 0);
  cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (hasPracticeOn(history, cursor)) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function shouldShowStreakNotification(history: readonly LearningAttempt[], now: Date = new Date(), lastNotifiedDate: string | null = null, snoozedDate: string | null = null): boolean {
  const todayKey = localDateKey(now);
  if (lastNotifiedDate === todayKey || snoozedDate === todayKey || hasPracticeOn(history, now)) return false;
  return getAtRiskStreak(history, now) > 0;
}

export function buildStreakNotificationContent(streak: number): StreakNotificationContent {
  return {
    title: "Serini koruyabilirsin",
    body: `Dünkü ${streak} günlük serinin bozulmaması için bugün kısa bir cümle söyle.`,
  };
}
