import { getPersistentItem, removePersistentItem, setPersistentItem } from "./persistent-storage";
import { parseReminderTime, type ReminderTime } from "./daily-reminder";

export const STREAK_NOTIFICATION_TIME_KEY = "dil-hafizasi-streak-notification-time";
export const STREAK_NOTIFICATION_SCHEDULE_KEY = "dil-hafizasi-streak-notification-schedule";

export type StreakNotificationSchedule = {
  weekday: ReminderTime;
  weekend: ReminderTime;
};

function isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6;
}

export async function loadStreakNotificationTime(): Promise<ReminderTime | null> {
  const value = await getPersistentItem(STREAK_NOTIFICATION_TIME_KEY);
  return value ? parseReminderTime(value) : null;
}

export async function saveStreakNotificationTime(time: ReminderTime): Promise<void> {
  await setPersistentItem(STREAK_NOTIFICATION_TIME_KEY, `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`);
}

export async function clearStreakNotificationTime(): Promise<void> {
  await removePersistentItem(STREAK_NOTIFICATION_TIME_KEY);
}

export function getScheduledStreakTime(schedule: StreakNotificationSchedule, date: Date = new Date()): ReminderTime {
  return isWeekend(date) ? schedule.weekend : schedule.weekday;
}

export async function loadStreakNotificationSchedule(): Promise<StreakNotificationSchedule | null> {
  const value = await getPersistentItem(STREAK_NOTIFICATION_SCHEDULE_KEY);
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<StreakNotificationSchedule>;
    if (!parsed.weekday || !parsed.weekend) return null;
    const weekday = parseReminderTime(`${String(parsed.weekday.hour).padStart(2, "0")}:${String(parsed.weekday.minute).padStart(2, "0")}`);
    const weekend = parseReminderTime(`${String(parsed.weekend.hour).padStart(2, "0")}:${String(parsed.weekend.minute).padStart(2, "0")}`);
    return weekday && weekend ? { weekday, weekend } : null;
  } catch {
    return null;
  }
}

export async function saveStreakNotificationSchedule(schedule: StreakNotificationSchedule): Promise<void> {
  await setPersistentItem(STREAK_NOTIFICATION_SCHEDULE_KEY, JSON.stringify(schedule));
}
