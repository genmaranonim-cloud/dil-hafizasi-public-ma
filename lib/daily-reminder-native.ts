import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { cancelScheduledNotificationAsync } from "expo-notifications/build/cancelScheduledNotificationAsync";
import { Platform } from "react-native";

import { buildDailyReminderContent, buildDailyReminderPayload, type DailyReviewNotificationTarget, type ReminderTime } from "./daily-reminder";

const REMINDER_ID_KEY = "dil-hafizasi-daily-reminder-id";

export type ReminderScheduleResult =
  | { status: "scheduled"; identifier: string }
  | { status: "denied" }
  | { status: "unsupported" };

async function cancelStoredReminder(): Promise<void> {
  const storedIdentifier = await AsyncStorage.getItem(REMINDER_ID_KEY);
  if (storedIdentifier) {
    await cancelScheduledNotificationAsync(storedIdentifier);
    await AsyncStorage.removeItem(REMINDER_ID_KEY);
  }
}

export async function cancelDailyReminder(): Promise<void> {
  if (Platform.OS === "web") return;
  await cancelStoredReminder();
}

export async function scheduleDailyReminder(time: ReminderTime, target: DailyReviewNotificationTarget | null = null): Promise<ReminderScheduleResult> {
  if (Platform.OS === "web") return { status: "unsupported" };

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("daily-review", {
      name: "Günlük Tekrar",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 200],
      lightColor: "#B64D45",
    });
  }

  const currentPermissions = await Notifications.getPermissionsAsync();
  const permissions = currentPermissions.status === "granted" ? currentPermissions : await Notifications.requestPermissionsAsync();
  if (permissions.status !== "granted") return { status: "denied" };

  await cancelStoredReminder();
  const payload = buildDailyReminderPayload(target);
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      ...buildDailyReminderContent(),
      data: payload,
      sound: "default",
    },
    trigger: Platform.OS === "android"
      ? {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: time.hour,
          minute: time.minute,
          channelId: "daily-review",
        }
      : {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: time.hour,
          minute: time.minute,
          repeats: true,
        },
  });
  await AsyncStorage.setItem(REMINDER_ID_KEY, identifier);
  return { status: "scheduled", identifier };
}
