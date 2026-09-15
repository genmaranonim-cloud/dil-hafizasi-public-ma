export type ProgressSummaryInput = {
  completedStages: number;
  totalStages: number;
  attemptedLessons: number;
  totalLessons: number;
  averageScore: number | null;
  targetScore: number | null;
};

export type ProgressSummaryRow = {
  id: "memory" | "lessons" | "score" | "target";
  label: string;
  value: number;
  total: number;
  percent: number;
};

function safePercent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round(Math.max(0, Math.min(100, (value / total) * 100)));
}

export function buildProgressRows(input: ProgressSummaryInput): ProgressSummaryRow[] {
  const averageScore = input.averageScore ?? 0;
  const targetScore = input.targetScore ?? 0;
  return [
    { id: "memory", label: "Hafıza aşamaları", value: Math.max(0, input.completedStages), total: Math.max(0, input.totalStages), percent: safePercent(input.completedStages, input.totalStages) },
    { id: "lessons", label: "Çalışılan dersler", value: Math.max(0, input.attemptedLessons), total: Math.max(0, input.totalLessons), percent: safePercent(input.attemptedLessons, input.totalLessons) },
    { id: "score", label: "Ortalama telaffuz", value: Math.max(0, Math.round(averageScore)), total: 100, percent: safePercent(averageScore, 100) },
    { id: "target", label: "Hedef puan", value: Math.max(0, Math.round(targetScore)), total: 100, percent: safePercent(targetScore, 100) },
  ];
}
