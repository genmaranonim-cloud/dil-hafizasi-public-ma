# Dil Hafızası Mobil MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Başlangıç seviyesindeki yetişkinler için hikâye, sesli okuma, hafıza aşamaları ve yerel ilerleme içeren iOS/Android öğrenme uygulaması oluşturmak.

**Architecture:** Hikâye verisi ve hafıza kuralları saf TypeScript fonksiyonlarında tutulur. Expo Router sekmeleri bu veriyi kullanarak uygulama deneyimini sunar; `expo-speech` İngilizce metni cihaz üzerinde okur, AsyncStorage yalnızca tamamlama durumunu saklar.

**Tech Stack:** Expo SDK 54, React Native, TypeScript, Expo Router, NativeWind, Expo Speech, AsyncStorage, Expo Haptics, Vitest.

**Spec:** `/home/ubuntu/dil-hafizasi/SPEC.md`

## Global Constraints

- Hikâye A1 düzeyinde, yetişkin yaşamına uygun ve Türkçe anlam desteğiyle sunulmalıdır.
- Seslendirme `en-US` dilinde, yaklaşık `0.72` hızında gerçekleşmelidir.
- Beş hafıza aşaması sıralı çalışmalı ve ilerleme cihazda kalıcı olmalıdır.
- Kullanıcı hesabı, bulut senkronu, mikrofon kaydı ve yapay zekâyla yeni içerik üretimi bu sürüm kapsamı dışındadır.
- Her üretim fonksiyonu önce başarısız bir Vitest testi ile tanımlanmalıdır.

---

### Task 1: Story Memory Model

**Files:**
- Create: `lib/story-memory.ts`
- Create: `tests/lib/story-memory.test.ts`

**Interfaces:**
- Produces: `STORY`, `MEMORY_STAGES`, `createInitialProgress()`, `getCompletionPercent()`, `isStageUnlocked()`.
- Consumes: none.

- [ ] **Step 1: Write the failing test**

```ts
import { expect, test } from "vitest";
import { createInitialProgress, getCompletionPercent, isStageUnlocked } from "../../lib/story-memory";

test("unlocks stages in sequence and calculates a rounded completion percent", () => {
  const progress = createInitialProgress();
  expect(isStageUnlocked(progress, "meet")).toBe(true);
  expect(isStageUnlocked(progress, "chunk")).toBe(false);
  expect(getCompletionPercent({ ...progress, completedStageIds: ["meet", "chunk"] })).toBe(40);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/lib/story-memory.test.ts`

Expected: failure because `lib/story-memory.ts` does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
export const MEMORY_STAGES = ["meet", "chunk", "repeat", "complete", "recall"] as const;
export type MemoryStageId = (typeof MEMORY_STAGES)[number];
export type StoryProgress = { completedStageIds: MemoryStageId[] };

export function createInitialProgress(): StoryProgress {
  return { completedStageIds: [] };
}

export function isStageUnlocked(progress: StoryProgress, stageId: MemoryStageId): boolean {
  const index = MEMORY_STAGES.indexOf(stageId);
  return index === 0 || progress.completedStageIds.includes(MEMORY_STAGES[index - 1]);
}

export function getCompletionPercent(progress: StoryProgress): number {
  return Math.round((progress.completedStageIds.length / MEMORY_STAGES.length) * 100);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/lib/story-memory.test.ts`

Expected: one passing test.

### Task 2: Local Progress Store

**Files:**
- Create: `lib/progress-store.ts`
- Create: `tests/lib/progress-store.test.ts`

**Interfaces:**
- Consumes: `StoryProgress` from `lib/story-memory.ts`.
- Produces: `loadStoryProgress()` and `saveStoryProgress(progress)`.

- [ ] **Step 1: Write the failing test**

```ts
import { expect, test, vi } from "vitest";
import { loadStoryProgress } from "../../lib/progress-store";

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: { getItem: vi.fn().mockResolvedValue(null) },
}));

test("returns an empty story progress when no saved progress exists", async () => {
  await expect(loadStoryProgress()).resolves.toEqual({ completedStageIds: [] });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/lib/progress-store.test.ts`

Expected: failure because `lib/progress-store.ts` does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
const PROGRESS_KEY = "dil-hafizasi-story-1-progress";

export async function loadStoryProgress(): Promise<StoryProgress> {
  const saved = await AsyncStorage.getItem(PROGRESS_KEY);
  return saved ? JSON.parse(saved) : createInitialProgress();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/lib/progress-store.test.ts`

Expected: one passing test.

### Task 3: App Theme and Navigation

**Files:**
- Modify: `theme.config.js`
- Modify: `app.config.ts`
- Modify: `app/(tabs)/_layout.tsx`
- Modify: `components/ui/icon-symbol.tsx`

**Interfaces:**
- Consumes: existing Expo Router tab layout.
- Produces: tabs for Today, Stories and Memory and the Dil Hafızası palette.

- [ ] **Step 1: Write no test**

Theme and static tab configuration are exempt configuration work. Verify through TypeScript and visual preview.

- [ ] **Step 2: Implement**

Set title to `Dil Hafızası`, use warm paper, ink blue, terracotta and sage tokens. Add functional tab entries for `index`, `stories`, and `memory`; map their icons before using them.

- [ ] **Step 3: Verify**

Run: `pnpm check`

Expected: no TypeScript errors.

### Task 4: Story and Listening Screen

**Files:**
- Create: `app/(tabs)/stories.tsx`
- Modify: `app/(tabs)/index.tsx`

**Interfaces:**
- Consumes: `STORY` and `MEMORY_STAGES` from `lib/story-memory.ts`, `expo-speech`.
- Produces: English/Turkish story display, translation toggle, `Dinle` and `Durdur` controls.

- [ ] **Step 1: Write the failing test**

Add an exported `buildSpeechText()` test that asserts story sentences join with a newline.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/lib/story-memory.test.ts`

Expected: failure because `buildSpeechText()` is not exported.

- [ ] **Step 3: Implement**

Build the home screen as Today’s 30-minute lesson. Build the Stories screen using `ScreenContainer`, readable English/Turkish row pairs, native buttons, speech speed selector and a real `Speech.stop()` operation.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/lib/story-memory.test.ts`

Expected: all story memory tests pass.

### Task 5: Memory Practice Flow

**Files:**
- Create: `app/(tabs)/memory.tsx`
- Modify: `lib/story-memory.ts`
- Modify: `tests/lib/story-memory.test.ts`

**Interfaces:**
- Consumes: unlocked stage functions and saved progress.
- Produces: step-by-step activities, completion action and accessible status announcement.

- [ ] **Step 1: Write the failing test**

Add a test asserting that completing `meet` unlocks `chunk` and that duplicate stage IDs do not increase completion percentage.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/lib/story-memory.test.ts`

Expected: failure because duplicates are not normalized.

- [ ] **Step 3: Implement**

Render five named stages: Tanış, Parçala, Tekrar Et, Tamamla, Geri Çağır. Show one exact activity per stage, disable locked stages with an explanation, prevent duplicate completions, and give haptic feedback after completion.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/lib/story-memory.test.ts`

Expected: all story memory tests pass.

### Task 6: Persistence and Final Validation

**Files:**
- Modify: `app/(tabs)/memory.tsx`
- Modify: `lib/progress-store.ts`
- Modify: `tests/lib/progress-store.test.ts`

**Interfaces:**
- Consumes: `loadStoryProgress()` and `saveStoryProgress(progress)`.
- Produces: restored current stage and completion status after app restart.

- [ ] **Step 1: Write the failing test**

Add a test asserting that `saveStoryProgress()` serializes the same stage IDs that `loadStoryProgress()` restores.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/lib/progress-store.test.ts`

Expected: failure because saving is not implemented.

- [ ] **Step 3: Implement**

Load progress on Memory screen mount, save after each stage completion, show a local loading state, and handle malformed saved JSON by using empty progress.

- [ ] **Step 4: Run complete verification**

Run: `pnpm test && pnpm check && pnpm lint`

Expected: all commands exit with code 0.

- [ ] **Step 5: Visual verification and checkpoint**

Capture the Today, Stories and Memory screens at phone viewport size; confirm the flow works without console errors. Save one final project checkpoint after all verifications pass.
