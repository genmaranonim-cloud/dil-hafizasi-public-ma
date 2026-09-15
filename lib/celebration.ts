export type CelebrationEvent = {
  kind: "badge" | "streak";
  title: string;
  message: string;
};

const BADGE_NAMES: Record<string, string> = {
  "first-step": "İlk adım",
  "steady-habit": "Düzenli ritim",
  "voice-practice": "Sesini kullan",
  "perfect-week": "Tam hafta",
};

export function getCelebrationEvent(
  previousStreak: number,
  currentStreak: number,
  previousBadgeIds: readonly string[],
  currentBadgeIds: readonly string[],
): CelebrationEvent | null {
  const newlyEarned = currentBadgeIds.find((id) => !previousBadgeIds.includes(id));
  if (newlyEarned) {
    return {
      kind: "badge",
      title: "Yeni rozet kazandın!",
      message: `${BADGE_NAMES[newlyEarned] ?? "Yeni başarı"} rozeti profilinde parlıyor.`,
    };
  }
  if (currentStreak > previousStreak && currentStreak > 0) {
    return {
      kind: "streak",
      title: "Serin büyüyor!",
      message: `${currentStreak} günlük çalışma serisini korudun.`,
    };
  }
  return null;
}
