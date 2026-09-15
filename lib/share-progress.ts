export type ProgressShareInput = {
  averageScore: number | null;
  targetScore: number | null;
  attemptCount: number;
  studiedLessonCount: number;
  completedStageCount: number;
  latestAttempt?: {
    phrase: string;
    score: number;
    summary: string;
  };
};

export function buildProgressShareText(input: ProgressShareInput): string {
  const average = input.averageScore === null ? "henüz yok" : `${input.averageScore}/100`;
  const target = input.targetScore === null ? "belirlenmedi" : `${input.targetScore}/100`;
  const lines = [
    "Dil Hafızası günlük ilerlemem",
    `Ortalama telaffuz: ${average}`,
    `Hedef: ${target}`,
    `Telaffuz denemesi: ${input.attemptCount}`,
    `Çalışılan ders: ${input.studiedLessonCount}`,
    `Tamamlanan hafıza aşaması: ${input.completedStageCount}`,
  ];
  if (input.latestAttempt) {
    lines.push(`Son analiz: ${input.latestAttempt.score}/100 — ${input.latestAttempt.phrase}`);
    lines.push(input.latestAttempt.summary);
  }
  lines.push("Kişisel ses kayıtlarım paylaşılmadı.");
  return lines.join("\n");
}
