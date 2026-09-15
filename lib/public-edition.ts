export function isPublicWebEdition(environment: Record<string, string | undefined> = process.env): boolean {
  return environment.EXPO_PUBLIC_PUBLIC_EDITION === "1";
}

export const PUBLIC_WEB_EDITION = isPublicWebEdition();
