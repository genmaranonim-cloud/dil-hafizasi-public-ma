import {
  createInitialProgress,
  MEMORY_STAGES,
  type MemoryStageId,
  type StoryProgress,
} from "./story-memory";
import { getPersistentItem, setPersistentItem } from "./persistent-storage";

const PROGRESS_KEY = "dil-hafizasi-story-1-progress";

function isProgress(value: unknown): value is StoryProgress {
  if (!value || typeof value !== "object" || !("completedStageIds" in value)) {
    return false;
  }

  const stageIds = (value as StoryProgress).completedStageIds;
  return (
    Array.isArray(stageIds) &&
    stageIds.every((stageId): stageId is MemoryStageId =>
      (MEMORY_STAGES as readonly string[]).includes(stageId),
    )
  );
}

export async function loadStoryProgress(): Promise<StoryProgress> {
  try {
    const savedProgress = await getPersistentItem(PROGRESS_KEY);

    if (!savedProgress) {
      return createInitialProgress();
    }

    const parsedProgress: unknown = JSON.parse(savedProgress);
    return isProgress(parsedProgress) ? parsedProgress : createInitialProgress();
  } catch {
    return createInitialProgress();
  }
}

export async function saveStoryProgress(progress: StoryProgress): Promise<void> {
  await setPersistentItem(PROGRESS_KEY, JSON.stringify(progress));
}
