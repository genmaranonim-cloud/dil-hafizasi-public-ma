import { describe, expect, test } from "vitest";

import { isPublicWebEdition } from "../../lib/public-edition";

describe("public web edition", () => {
  test("enables only when the public edition environment flag is set", () => {
    expect(isPublicWebEdition({ EXPO_PUBLIC_PUBLIC_EDITION: "1" })).toBe(true);
    expect(isPublicWebEdition({ EXPO_PUBLIC_PUBLIC_EDITION: "0" })).toBe(false);
    expect(isPublicWebEdition({})).toBe(false);
  });
});
