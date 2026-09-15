import { parseReminderTime, type ReminderTime } from "./daily-reminder";
import { getPersistentItem, removePersistentItem, setPersistentItem } from "./persistent-storage";

const REMINDER_TIME_KEY = "dil-hafizasi-daily-reminder-time";

export async function loadDailyReminderTime(): Promise<ReminderTime | null> {
  try {
    const value = await getPersistentItem(REMINDER_TIME_KEY);
    return value ? parseReminderTime(value) : null;
  } catch {
    return null;
  }
}

export async function saveDailyReminderTime(time: ReminderTime): Promise<void> {
  await setPersistentItem(REMINDER_TIME_KEY, `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`);
}

export async function clearDailyReminderTime(): Promise<void> {
  await removePersistentItem(REMINDER_TIME_KEY);
}
