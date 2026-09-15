import { describe, expect, test } from "vitest";

import {
  createDailyReviewState,
  dismissDailyReview,
  getDailyReviewTarget,
  isDailyReviewDue,
} from "../../lib/daily-review";

describe("daily review reminder", () => {
  const monday = new Date("2026-09-14T12:00:00.000Z");
  const tuesday = new Date("2026-09-15T12:00:00.000Z");
  const wednesday = new Date("2026-09-16T12:00:00.000Z");

  test("shows yesterday's studied lesson as today's review target", () => {
    const state = createDailyReviewState(3, "Planning the Weekend", monday);
    expect(isDailyReviewDue(state, tuesday)).toBe(true);
    expect(getDailyReviewTarget(state)).toEqual({ lessonNumber: 3, title: "Planning the Weekend" });
  });

  test("does not show a review on the study day or after the review window", () => {
    const state = createDailyReviewState(3, "Planning the Weekend", monday);
    expect(isDailyReviewDue(state, monday)).toBe(false);
    expect(isDailyReviewDue(state, wednesday)).toBe(false);
  });

  test("can dismiss a due review without losing the target lesson", () => {
    const dismissed = dismissDailyReview(createDailyReviewState(3, "Planning the Weekend", monday));
    expect(isDailyReviewDue(dismissed, tuesday)).toBe(false);
    expect(getDailyReviewTarget(dismissed)).toEqual({ lessonNumber: 3, title: "Planning the Weekend" });
  });
});
