import { describe, expect, test } from "vitest";

import {
  buildSpeechText,
  completeStage,
  createInitialProgress,
  getStoryByLesson,
  getCompletionPercent,
  isStageUnlocked,
  LESSON_CARDS,
  STORY,
} from "../../lib/story-memory";
import { formatRecordingTime, getPracticePhrase } from "../../lib/audio-practice";

describe("story memory engine", () => {
  test("unlocks stages one at a time and reports the completed percentage", () => {
    const initial = createInitialProgress();

    expect(isStageUnlocked(initial, "meet")).toBe(true);
    expect(isStageUnlocked(initial, "chunk")).toBe(false);

    const afterMeet = completeStage(initial, "meet");
    expect(isStageUnlocked(afterMeet, "chunk")).toBe(true);

    const afterChunk = completeStage(afterMeet, "chunk");
    expect(getCompletionPercent(afterChunk)).toBe(40);
  });

  test("does not count a completed stage twice", () => {
    const afterFirstCompletion = completeStage(createInitialProgress(), "meet");
    const afterDuplicateCompletion = completeStage(afterFirstCompletion, "meet");

    expect(afterDuplicateCompletion.completedStageIds).toEqual(["meet"]);
    expect(getCompletionPercent(afterDuplicateCompletion)).toBe(20);
  });

  test("builds a listening text from English story sentences only", () => {
    expect(buildSpeechText()).toContain("It is Wednesday morning.");
    expect(buildSpeechText()).not.toContain("Çarşamba sabahı");
  });

  test("exposes a numbered first lesson and a clear next-lesson path", () => {
    expect(STORY.lessonNumber).toBe(1);
    expect(LESSON_CARDS[0].status).toBe("active");
    expect(LESSON_CARDS[1].status).toBe("active");
  });

  test("returns the new coffee and weekend lessons by lesson number", () => {
    expect(getStoryByLesson(2)?.title).toBe("Ordering a Coffee");
    expect(getStoryByLesson(3)?.title).toBe("Planning the Weekend");
    expect(getStoryByLesson(99)).toBeUndefined();
  });

  test("returns shopping, directions, and doctor appointment lessons", () => {
    expect(getStoryByLesson(4)?.title).toBe("Grocery Shopping");
    expect(getStoryByLesson(5)?.title).toBe("Asking for Directions");
    expect(getStoryByLesson(6)?.title).toBe("A Doctor's Appointment");
    expect(getStoryByLesson(4)?.lines.length).toBeGreaterThanOrEqual(7);
    expect(getStoryByLesson(5)?.lines.length).toBeGreaterThanOrEqual(7);
    expect(getStoryByLesson(6)?.lines.length).toBeGreaterThanOrEqual(7);
  });

  test("returns restaurant, hotel, and job interview lessons", () => {
    expect(getStoryByLesson(7)?.title).toBe("Ordering at a Restaurant");
    expect(getStoryByLesson(8)?.title).toBe("Booking a Hotel");
    expect(getStoryByLesson(9)?.title).toBe("A Job Interview");
    expect(getStoryByLesson(7)?.lines.length).toBeGreaterThanOrEqual(8);
    expect(getStoryByLesson(8)?.lines.length).toBeGreaterThanOrEqual(8);
    expect(getStoryByLesson(9)?.lines.length).toBeGreaterThanOrEqual(8);
  });

  test("returns airport, phone call, and presentation lessons", () => {
    expect(getStoryByLesson(10)?.title).toBe("Airport Check-in");
    expect(getStoryByLesson(11)?.title).toBe("A Phone Call");
    expect(getStoryByLesson(12)?.title).toBe("Giving a Presentation");
    expect(getStoryByLesson(10)?.lines.length).toBeGreaterThanOrEqual(8);
    expect(getStoryByLesson(11)?.lines.length).toBeGreaterThanOrEqual(8);
    expect(getStoryByLesson(12)?.lines.length).toBeGreaterThanOrEqual(8);
    expect(LESSON_CARDS.slice(9).map((card) => [card.lessonNumber, card.status])).toEqual([[10, "active"], [11, "active"], [12, "active"]]);
  });

  test("prepares a pronunciation phrase and a readable recording duration", () => {
    expect(getPracticePhrase(STORY, 7)).toBe("Could you help me, please?");
    expect(formatRecordingTime(6500)).toBe("00:07");
  });
});
