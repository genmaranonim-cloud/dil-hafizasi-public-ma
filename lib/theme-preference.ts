import { getPersistentItem, setPersistentItem } from "./persistent-storage";

const THEME_PREFERENCE_KEY = "dil-hafizasi-theme-preference";

export type ThemePreference = "light" | "dark" | "system";

export function parseThemePreference(value: unknown): ThemePreference | null {
  return value === "light" || value === "dark" || value === "system" ? value : null;
}

export async function loadThemePreference(): Promise<ThemePreference | null> {
  return parseThemePreference(await getPersistentItem(THEME_PREFERENCE_KEY));
}

export async function saveThemePreference(preference: ThemePreference): Promise<void> {
  await setPersistentItem(THEME_PREFERENCE_KEY, preference);
}
