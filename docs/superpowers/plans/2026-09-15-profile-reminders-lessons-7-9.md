# Profil, Günlük Bildirim ve Ders 7–9 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Telaffuz geçmişini ders bazlı grafikte göstermek, seçilebilir saatli yerel Günlük Tekrar bildirimi kurmak ve Ders 7–9 günlük durum içeriklerini görsellerle eklemek.

**Architecture:** `lib/pronunciation-history.ts` AsyncStorage'da son 100 denemeyi saklayacak ve ders bazlı özetler üretecek. `app/(tabs)/profile.tsx` aynı store'dan veriyi okuyup hesaplanan bar grafiği ve geçmiş listesini gösterecek; bildirim saat ayarı bu ekranda `lib/daily-reminder.ts` üzerinden izin alıp mevcut schedule'ı iptal ederek günlük tekrar planlayacak. Ders 7–9 merkezi hikâye modeline eklenecek, ekranlardaki görsel map'leri genişletilecek.

**Tech Stack:** Expo SDK 54, React Native, TypeScript, Expo Router, AsyncStorage, `expo-notifications`, Vitest, mevcut görsel üretim hattı.

**Spec:** `SPEC.md` içindeki “Profil İlerlemesi, Günlük Bildirim ve Ders 7–9” bölümü.

## Global Constraints

- Geçmiş yalnızca cihazda tutulacak; maksimum 100 kayıt saklanacak.
- Skorlar 0–100 aralığında normalize edilecek.
- Yerel bildirim yalnızca iOS/Android'de etkinleşecek; web'de kullanıcıya açıklama gösterilecek.
- Bildirim ayarı 24 saat formatında, saat 0–23 ve dakika 0–59 olmalı.
- Ders metinleri yetişkin A1–A2 düzeyinde, gerçek günlük bağlamda ve Türkçe destekli olmalı.
- Üretilen ders görselleri sıkıştırılmış JPEG olarak uygulamaya alınmalı.

---

### Task 1: Ders 7–9 content and assets

**Files:** `lib/story-memory.ts`, `app/(tabs)/index.tsx`, `app/(tabs)/stories.tsx`, `scripts/compress-lesson-assets.py`, `assets/images/lesson-07-restaurant.jpg`, `assets/images/lesson-08-hotel.jpg`, `assets/images/lesson-09-interview.jpg`.

- [ ] Kırmızı içerik testleri: three lesson cards, 8+ lines, titles and focus words.
- [ ] New visual assets: restaurant order, hotel desk, interview room, same Dilek editorial style.
- [ ] Add cards/stories and image maps; update series count to 09.
- [ ] Run focused content test.

### Task 2: Pronunciation history and profile

**Files:** `lib/pronunciation-history.ts`, `tests/lib/pronunciation-history.test.ts`, `app/(tabs)/profile.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/stories.tsx`.

- [ ] Write failing tests for append, max-100 trim, per-lesson averages and descending history.
- [ ] Implement pure summary helpers and AsyncStorage store.
- [ ] Save a history item after a successful AI mutation and load it in Profile.
- [ ] Render total attempts, average, lesson bar chart, and recent attempts; show an empty state.

### Task 3: Local daily notification

**Files:** `lib/daily-reminder.ts`, `tests/lib/daily-reminder.test.ts`, `app/(tabs)/profile.tsx`, `app.config.ts`.

- [ ] Write failing tests for `parseReminderTime`, validation and notification content.
- [ ] Implement time validation/formatting and native schedule helper with permission guard.
- [ ] Add hour/minute inputs, enable/disable action, status and web/native explanatory copy.
- [ ] Add the Expo notifications plugin and ensure notification schedule is replaced, not duplicated.

### Task 4: Verification

**Files:** `todo.md`.

- [ ] Run `pnpm test`, `pnpm check`, and `pnpm lint`.
- [ ] Capture mobile previews for home/profile/Ders 7–9.
- [ ] Smoke-test the tRPC server remains healthy and inspect notification setup on web without claiming native delivery.
- [ ] Save a WebDev checkpoint.
