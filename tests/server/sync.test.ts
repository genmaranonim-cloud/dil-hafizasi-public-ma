import { describe, expect, test } from "vitest";

import { appRouter } from "../../server/routers";

describe("sync router", () => {
  test("rejects unauthenticated reads", async () => {
    const caller = appRouter.createCaller({ req: {} as never, res: {} as never, user: null });
    await expect(caller.sync.get()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  test("accepts an authenticated empty read when no database is configured", async () => {
    const caller = appRouter.createCaller({ req: {} as never, res: {} as never, user: { id: 7 } as never });
    await expect(caller.sync.get()).resolves.toEqual({ snapshot: null });
  });

  test("rejects oversized snapshots before persistence", async () => {
    const caller = appRouter.createCaller({ req: {} as never, res: {} as never, user: { id: 7 } as never });
    await expect(caller.sync.save({ payload: "x".repeat(1_500_001) })).rejects.toThrow();
  });
});
