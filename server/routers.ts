import { COOKIE_NAME } from "../shared/const.js";
import { MAX_AUDIO_BASE64_LENGTH } from "../lib/pronunciation-review";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { analyzePronunciation } from "./pronunciation-service";
import { getUserSyncSnapshot, saveUserSyncSnapshot } from "./db";
import { parseBackup, serializeBackup } from "../lib/backup";
import { z } from "zod";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  pronunciation: router({
    analyze: publicProcedure
      .input(
        z.object({
          phrase: z.string().trim().min(1).max(240),
          audioBase64: z.string().min(1).max(MAX_AUDIO_BASE64_LENGTH),
          mimeType: z.enum(["audio/mp4", "audio/mpeg", "audio/wav", "audio/webm"]),
        }),
      )
      .mutation(({ input }) => analyzePronunciation(input)),
  }),

  sync: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const snapshot = await getUserSyncSnapshot(ctx.user.id);
      return snapshot
        ? { snapshot: { payload: snapshot.payload, version: snapshot.version, updatedAt: snapshot.updatedAt } }
        : { snapshot: null };
    }),
    save: protectedProcedure
      .input(z.object({ payload: z.string().min(1).max(1_500_000) }))
      .mutation(async ({ ctx, input }) => {
        const payload = parseBackup(input.payload);
        const snapshot = await saveUserSyncSnapshot(ctx.user.id, serializeBackup(payload), payload.version);
        return { updatedAt: snapshot?.updatedAt ?? new Date() };
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
