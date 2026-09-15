export type DailyReviewState = {
  lessonNumber: number;
  title: string;
  studiedOn: string;
  visible: boolean;
};

export type DailyReviewTarget = {
  lessonNumber: number;
  title: string;
};

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createDailyReviewState(lessonNumber: number, title: string, studiedAt: Date = new Date()): DailyReviewState {
  return { lessonNumber, title, studiedOn: toLocalDateKey(studiedAt), visible: true };
}

export function dismissDailyReview(state: DailyReviewState): DailyReviewState {
  return { ...state, visible: false };
}

export function getDailyReviewTarget(state: DailyReviewState): DailyReviewTarget {
  return { lessonNumber: state.lessonNumber, title: state.title };
}

export function isDailyReviewDue(state: DailyReviewState, now: Date = new Date()): boolean {
  if (!state.visible) return false;
  const studiedAt = new Date(`${state.studiedOn}T12:00:00`);
  const todayAt = new Date(`${toLocalDateKey(now)}T12:00:00`);
  const dayDifference = Math.round((todayAt.getTime() - studiedAt.getTime()) / 86_400_000);
  return dayDifference === 1;
}
