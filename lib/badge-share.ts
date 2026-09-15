export type BadgeShareInput = {
  title: string;
  description: string;
  earnedAt: string;
  displayName?: string;
  theme?: BadgeThemeId;
};

export type BadgeThemeId = "ocean" | "sunset" | "forest" | "lavender";

export type BadgeTheme = {
  id: BadgeThemeId;
  label: string;
  background: string;
  secondary: string;
  accent: string;
};

export const BADGE_THEMES: readonly BadgeTheme[] = [
  { id: "ocean", label: "Okyanus", background: "#1E3A5F", secondary: "#4E8B70", accent: "#F3DFA7" },
  { id: "sunset", label: "Gün batımı", background: "#9B4D55", secondary: "#E58B62", accent: "#FFE0A8" },
  { id: "forest", label: "Orman", background: "#234D3C", secondary: "#6E9F73", accent: "#DCE8B4" },
  { id: "lavender", label: "Lavanta", background: "#4D477A", secondary: "#A18BC0", accent: "#F0DDF7" },
];

export function getBadgeTheme(themeId: BadgeThemeId = "ocean"): BadgeTheme {
  return BADGE_THEMES.find((theme) => theme.id === themeId) ?? BADGE_THEMES[0];
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character] ?? character);
}

export function buildBadgeShareText(input: BadgeShareInput): string {
  const prefix = input.displayName?.trim() ? `${input.displayName.trim()} olarak ` : "";
  return `${prefix}Dil Hafızası’nda “${input.title}” rozetini kazandım! ${input.description} Kazanma tarihi: ${input.earnedAt}.`;
}

export function buildBadgeCardSvg(input: BadgeShareInput): string {
  const title = escapeXml(input.title);
  const description = escapeXml(input.description);
  const earnedAt = escapeXml(input.earnedAt);
  const theme = getBadgeTheme(input.theme);
  const displayName = input.displayName?.trim() ? escapeXml(input.displayName.trim()) : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="bg" x1="0" x2="1"><stop stop-color="${theme.background}"/><stop offset="1" stop-color="${theme.secondary}"/></linearGradient></defs><rect width="1200" height="630" rx="38" fill="url(#bg)"/><circle cx="180" cy="180" r="72" fill="${theme.secondary}"/><text x="180" y="204" text-anchor="middle" font-size="72" fill="#FFFDF8">★</text><text x="110" y="350" font-family="Arial, sans-serif" font-size="32" font-weight="700" fill="${theme.accent}">DİL HAFIZASI · BAŞARI</text><text x="110" y="425" font-family="Arial, sans-serif" font-size="58" font-weight="800" fill="#FFFDF8">${title}</text><text x="110" y="480" font-family="Arial, sans-serif" font-size="28" fill="#E7F0F4">${description}</text><text x="110" y="545" font-family="Arial, sans-serif" font-size="24" fill="${theme.accent}">${displayName ? `${displayName} · ` : ""}Kazanıldı · ${earnedAt}</text></svg>`;
}
