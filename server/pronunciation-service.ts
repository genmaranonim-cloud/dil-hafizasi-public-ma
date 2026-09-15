import { invokeLLM } from "./_core/llm";
import { storageGetSignedUrl, storagePut } from "./storage";
import {
  buildPronunciationSystemPrompt,
  buildPronunciationUserPrompt,
  decodeAudioPayload,
  type AudioAnalysisInput,
} from "./pronunciation";
import { normalizePronunciationReview, type PronunciationReview } from "../lib/pronunciation-review";

const pronunciationReviewSchema = {
  type: "object",
  properties: {
    score: { type: "number", description: "Approximate intelligibility and pronunciation score from 0 to 100." },
    summary: { type: "string" },
    whatWentWell: { type: "array", items: { type: "string" }, maxItems: 4 },
    focusAreas: {
      type: "array",
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          phrase: { type: "string" },
          issue: { type: "string" },
          tip: { type: "string" },
        },
        required: ["phrase", "issue", "tip"],
        additionalProperties: false,
      },
    },
    nextTry: { type: "string" },
  },
  required: ["score", "summary", "whatWentWell", "focusAreas", "nextTry"],
  additionalProperties: false,
} as const;

function extractResponseText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((part): part is { type: "text"; text: string } => Boolean(part) && typeof part === "object" && (part as { type?: string }).type === "text" && typeof (part as { text?: unknown }).text === "string")
      .map((part) => part.text)
      .join("\n");
  }
  return "";
}

function parseModelReview(content: unknown): unknown {
  try {
    return JSON.parse(extractResponseText(content));
  } catch {
    return {};
  }
}

export async function analyzePronunciation(input: AudioAnalysisInput): Promise<PronunciationReview> {
  const audioBytes = decodeAudioPayload(input);
  const extension = input.mimeType === "audio/webm" ? "webm" : "m4a";
  const uploaded = await storagePut(`pronunciation/${Date.now()}.${extension}`, audioBytes, input.mimeType);
  const signedUrl = await storageGetSignedUrl(uploaded.key);

  const response = await invokeLLM({
    messages: [
      { role: "system", content: buildPronunciationSystemPrompt() },
      {
        role: "user",
        content: [
          { type: "text", text: buildPronunciationUserPrompt(input.phrase) },
          { type: "file_url", file_url: { url: signedUrl, mime_type: input.mimeType } },
        ],
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "pronunciation_review",
        strict: true,
        schema: pronunciationReviewSchema,
      },
    },
    max_tokens: 800,
  });

  return normalizePronunciationReview(parseModelReview(response.choices[0]?.message?.content));
}
