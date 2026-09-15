import { beforeEach, describe, expect, test, vi } from "vitest";

import { getAnalysisMimeType } from "../../lib/audio-practice";
import { getBrowserRecordingMimeType, normalizeBrowserMimeType } from "../../lib/browser-audio";
import { getPersistentItem, removePersistentItem, setPersistentItem } from "../../lib/persistent-storage";

describe("browser persistence", () => {
  const localStorage = {
    getItem: vi.fn<(key: string) => string | null>(),
    setItem: vi.fn<(key: string, value: string) => void>(),
    removeItem: vi.fn<(key: string) => void>(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("window", { localStorage });
  });

  test("uses localStorage for browser progress values", async () => {
    localStorage.getItem.mockReturnValue("saved-progress");

    expect(await getPersistentItem("progress")).toBe("saved-progress");
    await setPersistentItem("progress", "next-progress");
    await removePersistentItem("progress");

    expect(localStorage.setItem).toHaveBeenCalledWith("progress", "next-progress");
    expect(localStorage.removeItem).toHaveBeenCalledWith("progress");
  });
});

describe("browser pronunciation audio", () => {
  test("prefers Safari-compatible mp4 when the browser supports it", () => {
    expect(getBrowserRecordingMimeType((mime) => mime === "audio/mp4")).toBe("audio/mp4");
  });

  test("falls back to webm and normalizes codec suffixes", () => {
    expect(getBrowserRecordingMimeType((mime) => mime === "audio/webm;codecs=opus")).toBe("audio/webm;codecs=opus");
    expect(normalizeBrowserMimeType("audio/webm;codecs=opus")).toBe("audio/webm");
  });

  test("allows analysis for supported browser recordings", () => {
    expect(getAnalysisMimeType("web", "audio/mp4")).toBe("audio/mp4");
    expect(getAnalysisMimeType("web", "audio/webm")).toBe("audio/webm");
    expect(getAnalysisMimeType("web", "audio/ogg")).toBeNull();
  });
});
