export type ReminderTime = { hour: number; minute: number };

export type DailyReminderContent = {
  title: string;
  body: string;
};

export type DailyReviewNotificationTarget = {
  lessonNumber: number;
  title: string;
};

export type DailyReviewNotificationPayload = {
  route: string;
  type: "daily-review";
  lessonNumber?: number;
};

export function validateReminderTime(time: ReminderTime): boolean {
  return Number.isInteger(time.hour) && time.hour >= 0 && time.hour <= 23 && Number.isInteger(time.minute) && time.minute >= 0 && time.minute <= 59;
}

export function parseReminderTime(value: string): ReminderTime | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const time = { hour: Number(match[1]), minute: Number(match[2]) };
  return validateReminderTime(time) ? time : null;
}

export function formatReminderTime(time: ReminderTime): string {
  return `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;
}

export function buildDailyReminderContent(): DailyReminderContent {
  return {
    title: "Dil Hafızası zamanı",
    body: "Dünkü dersi 30 dakika ile tekrar et.",
  };
}

export function buildDailyReminderPayload(target: DailyReviewNotificationTarget | null): DailyReviewNotificationPayload {
  return target
    ? { route: `/stories?lesson=${target.lessonNumber}`, type: "daily-review", lessonNumber: target.lessonNumber }
    : { route: "/", type: "daily-review" };
}
