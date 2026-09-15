import { buildScoreTimeline, type LearningAttempt, type ScoreTimelinePoint } from "./learning-motivation";

export type LessonComparisonPoint = Omit<ScoreTimelinePoint, "averageScore" | "attempts"> & {
  firstScore: number | null;
  secondScore: number | null;
};

export type LessonComparisonSummary = {
  averageGap: number | null;
  firstGrowthPercent: number | null;
  secondGrowthPercent: number | null;
};

function dayKey(dateString: string): string | null {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function averageForLesson(history: readonly LearningAttempt[], lessonNumber: number, dateKey: string): number | null {
  const scores = history.filter((attempt) => attempt.lessonNumber === lessonNumber && dayKey(attempt.createdAt) === dateKey).map((attempt) => Math.max(0, Math.min(100, attempt.score)));
  return scores.length === 0 ? null : Math.round(scores.reduce((total, score) => total + score, 0) / scores.length);
}

export function buildLessonComparisonTimeline(history: readonly LearningAttempt[], firstLesson: number, secondLesson: number, now: Date = new Date(), days: number | "all" = 7): LessonComparisonPoint[] {
  const relevant = history.filter((attempt) => attempt.lessonNumber === firstLesson || attempt.lessonNumber === secondLesson);
  return buildScoreTimeline(relevant, now, days).map((point) => ({ dateKey: point.dateKey, label: point.label, firstScore: averageForLesson(history, firstLesson, point.dateKey), secondScore: averageForLesson(history, secondLesson, point.dateKey) }));
}

function average(values: number[]): number | null {
  return values.length === 0 ? null : Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function growthPercent(values: number[]): number | null {
  if (values.length < 2 || values[0] === 0) return null;
  return Math.round(((values[values.length - 1] - values[0]) / Math.abs(values[0])) * 100);
}

export function summarizeLessonComparison(timeline: readonly LessonComparisonPoint[]): LessonComparisonSummary {
  const firstScores = timeline.flatMap((point) => point.firstScore === null ? [] : [point.firstScore]);
  const secondScores = timeline.flatMap((point) => point.secondScore === null ? [] : [point.secondScore]);
  const firstAverage = average(firstScores);
  const secondAverage = average(secondScores);
  return {
    averageGap: firstAverage === null || secondAverage === null ? null : secondAverage - firstAverage,
    firstGrowthPercent: growthPercent(firstScores),
    secondGrowthPercent: growthPercent(secondScores),
  };
}
