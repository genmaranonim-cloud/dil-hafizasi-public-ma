import { type DailyReviewState } from "./daily-review";
import { getPersistentItem, setPersistentItem } from "./persistent-storage";

const DAILY_REVIEW_KEY = "dil-hafizasi-daily-review";

function isDailyReviewState(value: unknown): value is DailyReviewState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DailyReviewState>;
  return typeof candidate.lessonNumber === "number" && typeof candidate.title === "string" && typeof candidate.studiedOn === "string" && typeof candidate.visible === "boolean";
}

export async function loadDailyReview(): Promise<DailyReviewState | null> {
  try {
    const stored = await getPersistentItem(DAILY_REVIEW_KEY);
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    return isDailyReviewState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveDailyReview(state: DailyReviewState): Promise<void> {
  await setPersistentItem(DAILY_REVIEW_KEY, JSON.stringify(state));
}

export async function markLessonVisited(lessonNumber: number, title: string): Promise<DailyReviewState> {
  const { createDailyReviewState } = await import("./daily-review");
  const nextState = createDailyReviewState(lessonNumber, title);
  await saveDailyReview(nextState);
  return nextState;
}
