export const BROWSER_AUDIO_MIME_TYPES = [
  "audio/mp4",
  "audio/webm;codecs=opus",
  "audio/webm",
] as const;

export type BrowserAudioMimeType = (typeof BROWSER_AUDIO_MIME_TYPES)[number];

export function getBrowserRecordingMimeType(isSupported: (mimeType: string) => boolean): BrowserAudioMimeType | null {
  return BROWSER_AUDIO_MIME_TYPES.find((mimeType) => isSupported(mimeType)) ?? null;
}

export function normalizeBrowserMimeType(mimeType: string): "audio/mp4" | "audio/webm" | null {
  if (mimeType.toLowerCase().startsWith("audio/mp4")) return "audio/mp4";
  if (mimeType.toLowerCase().startsWith("audio/webm")) return "audio/webm";
  return null;
}
