export type LearningAttempt = {
  id: string;
  lessonNumber: number;
  phrase: string;
  score: number;
  summary: string;
  createdAt: string;
};

export type ScoreTimelinePoint = {
  dateKey: string;
  label: string;
  averageScore: number | null;
  attempts: number;
};

export type WeeklyBadge = {
  id: "first-step" | "steady-habit" | "voice-practice" | "perfect-week";
  title: string;
  description: string;
  icon: "flag" | "event-repeat" | "record-voice-over" | "workspace-premium";
  progress: number;
  target: number;
  earned: boolean;
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

function getPracticeDays(history: readonly LearningAttempt[], now: Date, days: number): Set<string> {
  const start = new Date(now);
  start.setHours(12, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  const endKey = localDateKey(now);
  const startKey = localDateKey(start);
  return new Set(
    history
      .map((attempt) => new Date(attempt.createdAt))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map(localDateKey)
      .filter((key) => key >= startKey && key <= endKey),
  );
}

export function calculateCurrentStreak(history: readonly LearningAttempt[], now: Date = new Date()): number {
  const practiceDays = new Set(
    history
      .map((attempt) => new Date(attempt.createdAt))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map(localDateKey),
  );
  const cursor = new Date(now);
  cursor.setHours(12, 0, 0, 0);
  let streak = 0;
  while (practiceDays.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getWeeklyBadges(history: readonly LearningAttempt[], now: Date = new Date()): WeeklyBadge[] {
  const practiceDays = getPracticeDays(history, now, 7);
  const attempts = history.filter((attempt) => {
    const date = new Date(attempt.createdAt);
    if (Number.isNaN(date.getTime())) return false;
    return practiceDays.has(localDateKey(date));
  }).length;
  const dayCount = practiceDays.size;
  return [
    { id: "first-step", title: "İlk adım", description: "Bu hafta en az bir gün çalış.", icon: "flag", progress: Math.min(dayCount, 1), target: 1, earned: dayCount >= 1 },
    { id: "steady-habit", title: "Düzenli ritim", description: "Bu hafta üç farklı gün pratik yap.", icon: "event-repeat", progress: Math.min(dayCount, 3), target: 3, earned: dayCount >= 3 },
    { id: "voice-practice", title: "Sesini kullan", description: "Bu hafta beş telaffuz denemesi tamamla.", icon: "record-voice-over", progress: Math.min(attempts, 5), target: 5, earned: attempts >= 5 },
    { id: "perfect-week", title: "Tam hafta", description: "Haftanın yedi gününde de kısa bir tekrar yap.", icon: "workspace-premium", progress: dayCount, target: 7, earned: dayCount >= 7 },
  ];
}

export function buildScoreTimeline(history: readonly LearningAttempt[], now: Date = new Date(), days: number | "all" = 7): ScoreTimelinePoint[] {
  const end = new Date(now);
  end.setHours(12, 0, 0, 0);
  const buckets = new Map<string, number[]>();
  for (const attempt of history) {
    const date = new Date(attempt.createdAt);
    if (Number.isNaN(date.getTime())) continue;
    const key = localDateKey(date);
    const scores = buckets.get(key) ?? [];
    scores.push(clampScore(attempt.score));
    buckets.set(key, scores);
  }

  if (days === "all" && buckets.size === 0) return [];
  const firstDate = new Date(end);
  if (days === "all") {
    const firstKey = [...buckets.keys()].sort()[0];
    const [year, month, day] = firstKey.split("-").map(Number);
    firstDate.setFullYear(year, month - 1, day);
  } else {
    firstDate.setDate(end.getDate() - (days - 1));
  }

  const dateKeys: Date[] = [];
  const cursor = new Date(firstDate);
  while (localDateKey(cursor) <= localDateKey(end)) {
    dateKeys.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dateKeys.map((date) => {
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

export type BadgeCollectionItem = WeeklyBadge & {
  earnedAt: string | null;
};

const BADGE_DEFINITIONS: Array<Pick<WeeklyBadge, "id" | "title" | "description" | "icon" | "target">> = [
  { id: "first-step", title: "İlk adım", description: "İlk telaffuz pratiğini tamamla.", icon: "flag", target: 1 },
  { id: "steady-habit", title: "Düzenli ritim", description: "Üç farklı günde pratik yap.", icon: "event-repeat", target: 3 },
  { id: "voice-practice", title: "Sesini kullan", description: "Beş telaffuz denemesi tamamla.", icon: "record-voice-over", target: 5 },
  { id: "perfect-week", title: "Tam hafta", description: "Yedi günlük bir dönemde her gün pratik yap.", icon: "workspace-premium", target: 7 },
];

export function getBadgeCollection(history: readonly LearningAttempt[]): BadgeCollectionItem[] {
  const validAttempts = history
    .map((attempt) => ({ attempt, date: new Date(attempt.createdAt) }))
    .filter(({ date }) => !Number.isNaN(date.getTime()))
    .sort((left, right) => left.date.getTime() - right.date.getTime());
  const uniqueDays = [...new Set(validAttempts.map(({ date }) => localDateKey(date)))].sort();
  const firstStepDate = uniqueDays[0] ?? null;
  const steadyHabitDate = uniqueDays[2] ?? null;
  const voicePracticeDate = validAttempts[4] ? localDateKey(validAttempts[4].date) : null;
  let perfectWeekDate: string | null = null;
  for (let index = 6; index < uniqueDays.length; index += 1) {
    const end = new Date(`${uniqueDays[index]}T12:00:00`);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    const inWindow = uniqueDays.slice(0, index + 1).filter((key) => key >= localDateKey(start) && key <= uniqueDays[index]);
    if (inWindow.length >= 7) {
      perfectWeekDate = uniqueDays[index];
      break;
    }
  }
  const earnedDates: Record<BadgeCollectionItem["id"], string | null> = {
    "first-step": firstStepDate,
    "steady-habit": steadyHabitDate,
    "voice-practice": voicePracticeDate,
    "perfect-week": perfectWeekDate,
  };
  return BADGE_DEFINITIONS.map((badge) => ({
    ...badge,
    progress: earnedDates[badge.id] ? badge.target : 0,
    earned: earnedDates[badge.id] !== null,
    earnedAt: earnedDates[badge.id],
  }));
}
