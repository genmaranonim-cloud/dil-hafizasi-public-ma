import type { Story } from "./story-memory";
import { normalizeBrowserMimeType } from "./browser-audio";

export function getPracticePhrase(story: Story, lineId: number): string {
  return story.lines.find((line) => line.id === lineId)?.english ?? story.lines[0]?.english ?? "";
}

export function formatRecordingTime(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.round(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function getAnalysisMimeType(platform: string, recordedMimeType?: string): "audio/mp4" | "audio/webm" | null {
  if (platform === "ios" || platform === "android") return "audio/mp4";
  return recordedMimeType ? normalizeBrowserMimeType(recordedMimeType) : null;
}
