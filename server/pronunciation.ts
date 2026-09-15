import { MAX_AUDIO_BASE64_LENGTH } from "../lib/pronunciation-review";

export const MAX_AUDIO_BYTES = 2 * 1024 * 1024;

export type AudioAnalysisInput = {
  phrase: string;
  audioBase64: string;
  mimeType: "audio/mp4" | "audio/mpeg" | "audio/wav" | "audio/webm";
};

export function decodeAudioPayload(input: AudioAnalysisInput): Buffer {
  const normalized = input.audioBase64.replace(/^data:[^;]+;base64,/, "").replace(/\s/g, "");
  if (!normalized || normalized.length > MAX_AUDIO_BASE64_LENGTH || !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) {
    throw new Error("Audio payload is missing, malformed, or too large");
  }

  const decoded = Buffer.from(normalized, "base64");
  if (decoded.byteLength === 0 || decoded.byteLength > MAX_AUDIO_BYTES) {
    throw new Error("Audio payload is missing, malformed, or too large");
  }
  return decoded;
}

export function buildPronunciationSystemPrompt(): string {
  return [
    "You are an encouraging English pronunciation coach for an A1 Turkish-speaking adult.",
    "Listen to the attached audio and compare it with the exact target sentence.",
    "Give practical approximate feedback only; do not claim laboratory-grade phonetic accuracy.",
    "If the audio is unclear, say that clearly and keep the score conservative.",
    "Write learner-facing feedback in Turkish, but keep phrase examples in English.",
    "Focus on intelligibility, word stress, rhythm, and a few actionable sound targets.",
  ].join(" ");
}

export function buildPronunciationUserPrompt(phrase: string): string {
  return `Hedef cümle: "${phrase}"\nBu cümlenin telaffuzunu değerlendir. Türkçe, kısa ve cesaretlendirici geri bildirim üret.`;
}
