export const MAX_AUDIO_BASE64_LENGTH = 2_800_000;

export type PronunciationFocusArea = {
  phrase: string;
  issue: string;
  tip: string;
};

export type PronunciationReview = {
  score: number;
  summary: string;
  whatWentWell: string[];
  focusAreas: PronunciationFocusArea[];
  nextTry: string;
  confidence: "approximate";
};

export type PronunciationRequest = {
  phrase: string;
  audioBase64: string;
  mimeType: "audio/mp4" | "audio/mpeg" | "audio/wav" | "audio/webm";
};

function cleanText(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function cleanList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim()).slice(0, 4);
}

function cleanFocusAreas(value: unknown): PronunciationFocusArea[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      phrase: cleanText(item.phrase, "Bu bölüm"),
      issue: cleanText(item.issue, "Bu bölümde netlik artırılabilir."),
      tip: cleanText(item.tip, "Cümleyi daha yavaş söyleyip tekrar dene."),
    }))
    .slice(0, 3);
}

export function normalizePronunciationReview(value: unknown): PronunciationReview {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const rawScore = typeof source.score === "number" && Number.isFinite(source.score) ? source.score : 0;
  const score = Math.round(Math.max(0, Math.min(100, rawScore)));

  return {
    score,
    summary: cleanText(source.summary, "Bu sonuç yaklaşık bir telaffuz değerlendirmesidir; cümleyi bir kez daha dinleyip tekrar et."),
    whatWentWell: cleanList(source.whatWentWell, ["Cümleyi tamamlamayı denedin."]),
    focusAreas: cleanFocusAreas(source.focusAreas),
    nextTry: cleanText(source.nextTry, "Önce cümleyi yavaşça, sonra doğal hızda tekrar et."),
    confidence: "approximate",
  };
}

export function isAudioPayloadWithinLimit(audioBase64: string): boolean {
  return typeof audioBase64 === "string" && audioBase64.length > 0 && audioBase64.length <= MAX_AUDIO_BASE64_LENGTH;
}

export function buildPronunciationRequest(input: PronunciationRequest): PronunciationRequest {
  if (!input.phrase.trim()) throw new Error("Practice phrase is required");
  if (!isAudioPayloadWithinLimit(input.audioBase64)) throw new Error("Audio payload is missing or too large");
  return {
    phrase: input.phrase.trim(),
    audioBase64: input.audioBase64,
    mimeType: input.mimeType,
  };
}
