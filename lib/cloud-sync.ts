import { getBackupKeys, parseBackup, serializeBackup, type BackupKey, type BackupPayload } from "./backup";
import { getPersistentItem, setPersistentItem } from "./persistent-storage";
import { MEMORY_STAGES } from "./story-memory";

const HISTORY_KEY: BackupKey = "dil-hafizasi-pronunciation-history";
const PROGRESS_KEY: BackupKey = "dil-hafizasi-story-1-progress";
const CLOUD_SYNC_BASELINE_PREFIX = "dil-hafizasi-cloud-sync-baseline";

function parseJson<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function chooseLatest(local: BackupPayload, remote: BackupPayload, base: BackupPayload | null, key: BackupKey): string | undefined {
  const localValue = local.data[key];
  const remoteValue = remote.data[key];
  if (!localValue) return remoteValue;
  if (!remoteValue) return localValue;
  if (!base) return remoteValue;
  const baseValue = base?.data[key];
  if (baseValue !== undefined) {
    const localChanged = localValue !== baseValue;
    const remoteChanged = remoteValue !== baseValue;
    if (localChanged && !remoteChanged) return localValue;
    if (!localChanged && remoteChanged) return remoteValue;
  }
  return new Date(local.exportedAt).getTime() >= new Date(remote.exportedAt).getTime() ? localValue : remoteValue;
}

function mergeHistory(local: string | undefined, remote: string | undefined): string | undefined {
  const attempts = [...parseJson<unknown[]>(local, []), ...parseJson<unknown[]>(remote, [])]
    .filter((item): item is { id: string; createdAt?: string } => Boolean(item && typeof item === "object" && typeof (item as { id?: unknown }).id === "string"))
    .reduce((map, item) => map.set(item.id, item), new Map<string, { id: string; createdAt?: string }>())
    .values();
  const merged = [...attempts].sort((left, right) => (right.createdAt ?? "").localeCompare(left.createdAt ?? "")).slice(0, 100);
  return merged.length > 0 ? JSON.stringify(merged) : undefined;
}

function mergeProgress(local: string | undefined, remote: string | undefined): string | undefined {
  const localStages = parseJson<{ completedStageIds?: unknown }>(local, {}).completedStageIds;
  const remoteStages = parseJson<{ completedStageIds?: unknown }>(remote, {}).completedStageIds;
  const completed = new Set([...((Array.isArray(localStages) ? localStages : [])), ...((Array.isArray(remoteStages) ? remoteStages : []))]);
  const ordered = MEMORY_STAGES.filter((stage) => completed.has(stage));
  return ordered.length > 0 ? JSON.stringify({ completedStageIds: ordered }) : undefined;
}

export function mergeBackupPayloads(local: BackupPayload, remote: BackupPayload, base: BackupPayload | null = null): BackupPayload {
  const data: Partial<Record<BackupKey, string>> = {};
  for (const key of getBackupKeys()) {
    const value = key === HISTORY_KEY
      ? mergeHistory(local.data[key], remote.data[key])
      : key === PROGRESS_KEY
        ? mergeProgress(local.data[key], remote.data[key])
        : chooseLatest(local, remote, base, key);
    if (value !== undefined) data[key] = value;
  }

  const localTime = new Date(local.exportedAt).getTime();
  const remoteTime = new Date(remote.exportedAt).getTime();
  return {
    app: "dil-hafizasi",
    version: 1,
    exportedAt: new Date(Math.max(localTime || 0, remoteTime || 0)).toISOString(),
    data,
  };
}

function cloudBaselineKey(userId: number): string {
  return `${CLOUD_SYNC_BASELINE_PREFIX}-${userId}`;
}

export async function loadCloudSyncBaseline(userId: number): Promise<BackupPayload | null> {
  try {
    const saved = await getPersistentItem(cloudBaselineKey(userId));
    return saved ? parseBackup(saved) : null;
  } catch {
    return null;
  }
}

export async function saveCloudSyncBaseline(userId: number, payload: BackupPayload): Promise<void> {
  await setPersistentItem(cloudBaselineKey(userId), serializeBackup(payload));
}
