import { getPersistentItem, removePersistentItem, setPersistentItem } from "./persistent-storage";

const TARGET_SCORE_KEY = "dil-hafizasi-target-score";

export function validateTargetScore(score: number): boolean {
  return Number.isInteger(score) && score >= 1 && score <= 100;
}

export function parseTargetScore(value: string): number | null {
  const normalized = value.trim();
  if (!/^\d+$/.test(normalized)) return null;
  const score = Number(normalized);
  return validateTargetScore(score) ? score : null;
}

export async function loadTargetScore(): Promise<number | null> {
  try {
    const stored = await getPersistentItem(TARGET_SCORE_KEY);
    if (!stored) return null;
    const score = Number(stored);
    return validateTargetScore(score) ? score : null;
  } catch {
    return null;
  }
}

export async function saveTargetScore(score: number): Promise<void> {
  if (!validateTargetScore(score)) throw new Error("Target score must be an integer from 1 to 100.");
  await setPersistentItem(TARGET_SCORE_KEY, String(score));
}

export async function clearTargetScore(): Promise<void> {
  await removePersistentItem(TARGET_SCORE_KEY);
}
