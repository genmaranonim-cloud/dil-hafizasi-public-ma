import { describe, expect, test } from "vitest";

import { appRouter } from "../../server/routers";

describe("pronunciation.analyze", () => {
  test("rejects an oversized audio payload before any AI call", async () => {
    const caller = appRouter.createCaller({ req: {} as never, res: {} as never, user: null });

    await expect(
      caller.pronunciation.analyze({
        phrase: "Hello",
        audioBase64: "a".repeat(2_800_001),
        mimeType: "audio/mp4",
      }),
    ).rejects.toThrow();
  });
});
