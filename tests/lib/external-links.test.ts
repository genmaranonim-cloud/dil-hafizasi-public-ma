import { describe, expect, test } from "vitest";

import { EXTERNAL_SERVICES, getExternalService, isSafeExternalUrl } from "../../lib/external-links";

describe("external service links", () => {
  test("exposes official links for the supported services", () => {
    expect(EXTERNAL_SERVICES.map((service) => service.id)).toEqual(["openai", "gemini", "elevenlabs"]);
    expect(getExternalService("gemini")?.url).toContain("aistudio.google.com");
    expect(EXTERNAL_SERVICES.every((service) => isSafeExternalUrl(service.url))).toBe(true);
    expect(EXTERNAL_SERVICES.every((service) => service.guide.length >= 3)).toBe(true);
  });

  test("returns no service for an unknown id and rejects unsafe URLs", () => {
    expect(getExternalService("unknown")).toBeUndefined();
    expect(isSafeExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeExternalUrl("http://example.com")).toBe(false);
  });
});
