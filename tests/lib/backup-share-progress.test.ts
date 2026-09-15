import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  BACKUP_VERSION,
  createBackup,
  getBackupKeys,
  parseBackup,
  restoreBackup,
  serializeBackup,
  type BackupPayload,
} from "../../lib/backup";
import { buildProgressRows } from "../../lib/progress-summary";
import { buildProgressShareText } from "../../lib/share-progress";

const storage = {
  getItem: vi.fn<(key: string) => string | null>(),
  setItem: vi.fn<(key: string, value: string) => void>(),
  removeItem: vi.fn<(key: string) => void>(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("window", { localStorage: storage });
});

describe("local backup", () => {
  test("serializes the supported local data keys with a version", () => {
    const payload: BackupPayload = {
      app: "dil-hafizasi",
      version: BACKUP_VERSION,
      exportedAt: "2026-09-15T17:00:00.000Z",
      data: {
        "dil-hafizasi-target-score": "85",
        "dil-hafizasi-story-1-progress": "{\"completedStageIds\":[\"meet\"]}",
      },
    };

    const parsed = parseBackup(serializeBackup(payload));
    expect(parsed.data["dil-hafizasi-target-score"]).toBe("85");
    expect(getBackupKeys()).toContain("dil-hafizasi-pronunciation-history");
  });

  test("rejects another app or a malformed backup", () => {
    expect(() => parseBackup("not-json")).toThrow();
    expect(() => parseBackup(JSON.stringify({ app: "other-app", version: 1, data: {} }))).toThrow();
  });

  test("reads only known keys and restores the validated payload", async () => {
    storage.getItem.mockImplementation((key) => key === "dil-hafizasi-target-score" ? "85" : null);
    const backup = await createBackup();

    expect(backup.data["dil-hafizasi-target-score"]).toBe("85");

    await restoreBackup(serializeBackup(backup));
    expect(storage.removeItem).toHaveBeenCalledTimes(getBackupKeys().length);
    expect(storage.setItem).toHaveBeenCalledWith("dil-hafizasi-target-score", "85");
  });
});

describe("progress summary", () => {
  test("builds comparable rows for memory, lessons, score, and target", () => {
    const rows = buildProgressRows({ completedStages: 3, totalStages: 5, attemptedLessons: 2, totalLessons: 12, averageScore: 72, targetScore: 80 });

    expect(rows).toEqual([
      { id: "memory", label: "Hafıza aşamaları", value: 3, total: 5, percent: 60 },
      { id: "lessons", label: "Çalışılan dersler", value: 2, total: 12, percent: 17 },
      { id: "score", label: "Ortalama telaffuz", value: 72, total: 100, percent: 72 },
      { id: "target", label: "Hedef puan", value: 80, total: 100, percent: 80 },
    ]);
  });
});

describe("progress sharing", () => {
  test("includes daily progress, score, target, and a privacy note", () => {
    const text = buildProgressShareText({
      averageScore: 72,
      targetScore: 80,
      attemptCount: 6,
      studiedLessonCount: 3,
      completedStageCount: 4,
      latestAttempt: { phrase: "Could you help me?", score: 76, summary: "Cümle anlaşılırdı; ritmi biraz daha yavaşlat." },
    });

    expect(text).toContain("Dil Hafızası günlük ilerlemem");
    expect(text).toContain("Ortalama telaffuz: 72/100");
    expect(text).toContain("Hedef: 80/100");
    expect(text).toContain("Son analiz: 76/100 — Could you help me?");
    expect(text).toContain("Kişisel ses kayıtlarım paylaşılmadı");
  });
});
