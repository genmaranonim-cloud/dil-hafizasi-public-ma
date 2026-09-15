import { getPersistentItem, setPersistentItem } from "./persistent-storage";

const HISTORY_KEY = "dil-hafizasi-pronunciation-history";
const MAX_HISTORY_ITEMS = 100;

export type PronunciationAttempt = {
  id: string;
  lessonNumber: number;
  phrase: string;
  score: number;
  summary: string;
  createdAt: string;
};

export type LessonPronunciationSummary = {
  lessonNumber: number;
  averageScore: number;
  attempts: number;
};

export type WeeklyPronunciationPoint = {
  dateKey: string;
  label: string;
  averageScore: number | null;
  attempts: number;
};

function clampScore(score: number): number {
  return Math.round(Math.max(0, Math.min(100, score)));
}

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isPronunciationAttempt(value: unknown): value is PronunciationAttempt {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PronunciationAttempt>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.lessonNumber === "number" &&
    typeof candidate.phrase === "string" &&
    typeof candidate.score === "number" &&
    typeof candidate.summary === "string" &&
    typeof candidate.createdAt === "string"
  );
}

export function appendPronunciationAttempt(history: readonly PronunciationAttempt[], attempt: PronunciationAttempt): PronunciationAttempt[] {
  const normalized = { ...attempt, score: clampScore(attempt.score) };
  return [normalized, ...history].slice(0, MAX_HISTORY_ITEMS);
}

export function getRecentAttempts(history: readonly PronunciationAttempt[], limit = 10): PronunciationAttempt[] {
  return [...history].sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, limit);
}

export function summarizePronunciationHistory(history: readonly PronunciationAttempt[]): LessonPronunciationSummary[] {
  const byLesson = new Map<number, PronunciationAttempt[]>();
  for (const attempt of history) {
    const current = byLesson.get(attempt.lessonNumber) ?? [];
    current.push(attempt);
    byLesson.set(attempt.lessonNumber, current);
  }

  return [...byLesson.entries()]
    .sort(([left], [right]) => left - right)
    .map(([lessonNumber, attempts]) => ({
      lessonNumber,
      averageScore: Math.round(attempts.reduce((total, item) => total + clampScore(item.score), 0) / attempts.length),
      attempts: attempts.length,
    }));
}

export function summarizeWeeklyPronunciation(history: readonly PronunciationAttempt[], now: Date = new Date()): WeeklyPronunciationPoint[] {
  const end = new Date(now);
  end.setHours(12, 0, 0, 0);
  const buckets = new Map<string, number[]>();

  for (const attempt of history) {
    const createdAt = new Date(attempt.createdAt);
    if (Number.isNaN(createdAt.getTime())) continue;
    const key = localDateKey(createdAt);
    const scores = buckets.get(key) ?? [];
    scores.push(clampScore(attempt.score));
    buckets.set(key, scores);
  }

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(end);
    date.setDate(end.getDate() - (6 - index));
    const dateKey = localDateKey(date);
    const scores = buckets.get(dateKey) ?? [];
    return {
      dateKey,
      label: new Intl.DateTimeFormat("tr-TR", { weekday: "short" }).format(date).replace(".", ""),
      averageScore: scores.length === 0 ? null : Math.round(scores.reduce((total, score) => total + score, 0) / scores.length),
      attempts: scores.length,
    };
  });
}

export async function loadPronunciationHistory(): Promise<PronunciationAttempt[]> {
  try {
    const saved = await getPersistentItem(HISTORY_KEY);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter(isPronunciationAttempt).slice(0, MAX_HISTORY_ITEMS) : [];
  } catch {
    return [];
  }
}

export async function savePronunciationHistory(history: readonly PronunciationAttempt[]): Promise<void> {
  await setPersistentItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY_ITEMS)));
}

export async function recordPronunciationAttempt(attempt: PronunciationAttempt): Promise<PronunciationAttempt[]> {
  const nextHistory = appendPronunciationAttempt(await loadPronunciationHistory(), attempt);
  await savePronunciationHistory(nextHistory);
  return nextHistory;
}
