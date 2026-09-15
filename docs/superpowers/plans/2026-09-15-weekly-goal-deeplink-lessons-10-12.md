# Haftalık Trend, Hedef Puanı, Bildirim Deep Link ve Ders 10–12 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Profile weekly pronunciation trend and target score, previous-lesson notification deep linking, and lesson 10–12 content/assets.

**Architecture:** `lib/pronunciation-history.ts` keeps pure aggregation helpers for lesson and seven-day summaries. `lib/profile-goals.ts` owns validated target-score persistence. `lib/daily-reminder-native.ts` includes a target lesson in the notification payload, while `app/_layout.tsx` routes notification responses for warm and cold starts. `lib/story-memory.ts` remains the single content source; home/story image maps and compressed JPEG assets extend it through lesson 12.

**Tech Stack:** Expo SDK 54, React Native, Expo Router, TypeScript, AsyncStorage, expo-notifications, Vitest, existing image generation/compression workflow.

**Spec:** `SPEC.md` section “Haftalık Trend, Hedef Puanı, Bildirim Derin Bağlantısı ve Ders 10–12”.

## Global Constraints

- Weekly trend covers exactly the last seven local calendar days and leaves no-attempt days empty.
- Target score accepts only integer values from 1 through 100; absent target is represented as unset, not a mock number.
- Notification payload uses a known previous lesson when available and falls back to `/` when unavailable.
- Notification response navigation must work when the app is already open and on cold start.
- Lesson 10–12 content is adult-oriented, daily-life English with Turkish support and at least eight dialogue lines per lesson.
- New images are compressed JPEG assets used by both home cards and story screens.

---

### Task 1: Weekly trend and target score domain logic

**Files:**
- Modify: `lib/pronunciation-history.ts`
- Create: `lib/profile-goals.ts`
- Test: `tests/lib/pronunciation-history.test.ts`, `tests/lib/profile-goals.test.ts`

- [ ] Write failing tests for seven local date buckets, empty days, and daily averages.
- [ ] Run the focused tests and confirm the missing exports fail for the expected reason.
- [ ] Write failing tests for parsing, rejecting, saving, loading, and clearing target scores.
- [ ] Implement `summarizeWeeklyPronunciation(history, now)` and validated AsyncStorage goal helpers.
- [ ] Run both focused test files and verify green behavior.

### Task 2: Profile weekly chart and target setting

**Files:**
- Modify: `app/(tabs)/profile.tsx`
- Test: existing pure profile-goal tests plus full suite

- [ ] Load the target score alongside history and reload both on tab focus.
- [ ] Render a seven-point weekly chart with date labels, empty-day states, and target score context.
- [ ] Add an accessible numeric input, save/update action, validation message, and clear-target action.
- [ ] Keep existing lesson chart, history list, and reminder UI intact.
- [ ] Run TypeScript and lint after the UI is wired.

### Task 3: Notification deep link to previous lesson

**Files:**
- Modify: `lib/daily-reminder-native.ts`, `app/(tabs)/profile.tsx`, `app/_layout.tsx`
- Modify: `tests/lib/daily-reminder.test.ts`

- [ ] Write failing tests for notification payload route generation with and without a lesson target.
- [ ] Run the focused test and confirm the missing payload helper fails.
- [ ] Implement a pure `buildDailyReminderPayload(target)` helper and include its route/data in native scheduling.
- [ ] Load the latest daily-review target before scheduling from Profile.
- [ ] Add warm-start listener and cold-start check using Expo Notifications and Expo Router; ignore malformed/non-string routes.
- [ ] Run notification tests and verify TypeScript on web/native branches.

### Task 4: Lessons 10–12 content and visual assets

**Files:**
- Modify: `lib/story-memory.ts`, `app/(tabs)/index.tsx`, `app/(tabs)/stories.tsx`, `scripts/compress-lesson-assets.py`, `tests/lib/story-memory.test.ts`
- Create: `assets/images/lesson-10-airport.jpg`, `assets/images/lesson-11-phone-call.jpg`, `assets/images/lesson-12-presentation.jpg`

- [ ] Add failing content tests for titles, 8+ lines, focus words, and three active lesson cards.
- [ ] Run the focused content test and verify the expected failure.
- [ ] Generate three standalone editorial-style visuals matching the Dilek lesson series.
- [ ] Add lesson cards and A2 dialogues, then add image maps and update the series counter to 12.
- [ ] Compress source PNGs into optimized JPEGs and remove unused large PNG copies.
- [ ] Run the focused content test and confirm all three lessons are retrievable by number.

### Task 5: Verification and checkpoint

**Files:** `todo.md`, `docs/verification-weekly-goal-deeplink-lessons-10-12.md`

- [ ] Run `pnpm test`, `pnpm check`, and `pnpm lint`.
- [ ] Verify Expo config still includes `expo-notifications`.
- [ ] Capture mobile previews for `/profile`, `/stories?lesson=10`, `/stories?lesson=11`, `/stories?lesson=12`.
- [ ] Inspect web behavior without claiming native notification delivery.
- [ ] Save one final WebDev checkpoint and update `todo.md`.
