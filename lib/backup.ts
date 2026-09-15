import { getPersistentItem, removePersistentItem, setPersistentItem } from "./persistent-storage";

export const BACKUP_VERSION = 1;
const APP_ID = "dil-hafizasi";

const BACKUP_KEYS = [
  "dil-hafizasi-story-1-progress",
  "dil-hafizasi-daily-review",
  "dil-hafizasi-target-score",
  "dil-hafizasi-daily-reminder-time",
  "dil-hafizasi-pronunciation-history",
  "dil-hafizasi-theme-preference",
  "dil-hafizasi-streak-notification-time",
  "dil-hafizasi-streak-notification-schedule",
] as const;

export type BackupKey = (typeof BACKUP_KEYS)[number];

export type BackupPayload = {
  app: typeof APP_ID;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  data: Partial<Record<BackupKey, string>>;
};

export function getBackupKeys(): readonly BackupKey[] {
  return BACKUP_KEYS;
}

export function serializeBackup(payload: BackupPayload): string {
  return JSON.stringify(payload, null, 2);
}

export function parseBackup(serialized: string): BackupPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    throw new Error("Yedek dosyası geçerli bir JSON değil.");
  }

  if (!parsed || typeof parsed !== "object") throw new Error("Yedek dosyası tanınamadı.");
  const candidate = parsed as Partial<BackupPayload>;
  if (candidate.app !== APP_ID || candidate.version !== BACKUP_VERSION || typeof candidate.exportedAt !== "string") {
    throw new Error("Bu dosya Dil Hafızası yedeği değil veya sürümü desteklenmiyor.");
  }
  if (!candidate.data || typeof candidate.data !== "object" || Array.isArray(candidate.data)) {
    throw new Error("Yedek verisi eksik.");
  }

  const data: Partial<Record<BackupKey, string>> = {};
  for (const key of BACKUP_KEYS) {
    const value = (candidate.data as Record<string, unknown>)[key];
    if (typeof value === "string" && value.length <= 2_000_000) data[key] = value;
  }

  return { app: APP_ID, version: BACKUP_VERSION, exportedAt: candidate.exportedAt, data };
}

export async function createBackup(): Promise<BackupPayload> {
  const data: Partial<Record<BackupKey, string>> = {};
  for (const key of BACKUP_KEYS) {
    const value = await getPersistentItem(key);
    if (value !== null) data[key] = value;
  }
  return { app: APP_ID, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data };
}

export async function restoreBackup(serialized: string): Promise<BackupPayload> {
  const payload = parseBackup(serialized);
  await Promise.all(BACKUP_KEYS.map((key) => removePersistentItem(key)));
  await Promise.all(Object.entries(payload.data).map(([key, value]) => setPersistentItem(key, value)));
  return payload;
}
