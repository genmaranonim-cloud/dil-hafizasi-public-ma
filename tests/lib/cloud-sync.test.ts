import { describe, expect, test } from "vitest";

import { mergeBackupPayloads } from "../../lib/cloud-sync";
import type { BackupPayload } from "../../lib/backup";

const makePayload = (exportedAt: string, data: BackupPayload["data"]): BackupPayload => ({
  app: "dil-hafizasi",
  version: 1,
  exportedAt,
  data,
});

describe("cloud sync merge", () => {
  test("merges pronunciation history by id and unions completed stages", () => {
    const local = makePayload("2026-09-15T10:00:00.000Z", {
      "dil-hafizasi-pronunciation-history": JSON.stringify([
        { id: "local", lessonNumber: 1, phrase: "Hi", score: 70, summary: "local", createdAt: "2026-09-15T09:00:00.000Z" },
      ]),
      "dil-hafizasi-story-1-progress": JSON.stringify({ completedStageIds: ["meet"] }),
    });
    const remote = makePayload("2026-09-14T10:00:00.000Z", {
      "dil-hafizasi-pronunciation-history": JSON.stringify([
        { id: "remote", lessonNumber: 2, phrase: "Hello", score: 80, summary: "remote", createdAt: "2026-09-14T09:00:00.000Z" },
      ]),
      "dil-hafizasi-story-1-progress": JSON.stringify({ completedStageIds: ["chunk"] }),
    });

    const merged = mergeBackupPayloads(local, remote);
    expect(JSON.parse(merged.data["dil-hafizasi-pronunciation-history"] ?? "[]")).toHaveLength(2);
    expect(JSON.parse(merged.data["dil-hafizasi-story-1-progress"] ?? "{}").completedStageIds).toEqual(["meet", "chunk"]);
  });

  test("keeps remote settings when the local device has no value", () => {
    const local = makePayload("2026-09-15T10:00:00.000Z", {});
    const remote = makePayload("2026-09-14T10:00:00.000Z", { "dil-hafizasi-target-score": "85" });
    const merged = mergeBackupPayloads(local, remote);
    expect(merged.data["dil-hafizasi-target-score"]).toBe("85");
  });

  test("uses the existing cloud setting on a first-time device until a sync baseline exists", () => {
    const local = makePayload("2026-09-15T10:00:00.000Z", { "dil-hafizasi-target-score": "72" });
    const remote = makePayload("2026-09-14T10:00:00.000Z", { "dil-hafizasi-target-score": "85" });
    const merged = mergeBackupPayloads(local, remote);
    expect(merged.data["dil-hafizasi-target-score"]).toBe("85");
  });
});
