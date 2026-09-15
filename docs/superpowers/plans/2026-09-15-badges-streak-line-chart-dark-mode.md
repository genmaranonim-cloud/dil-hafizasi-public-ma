# Haftalık Rozetler, Çalışma Serisi, Çizgi Grafik ve Dark Mode Implementation Plan

> **For agentic workers:** Bu plan mevcut Dil Hafızası Expo/React Native projesinde inline uygulanacaktır. Adımlar test-first ve doğrulama kanıtı gerektirir.

**Goal:** Kullanıcının haftalık başarısını ve günlük çalışma alışkanlığını görünür kılmak, telaffuz puanlarının zaman içindeki değişimini çizgi grafikle göstermek ve gece kullanımına uygun seçilebilir dark mode sağlamak.

**Architecture:** Saf yardımcı modüller; telaffuz geçmişinden günlük skor serisi, aktif gün serisi ve haftalık rozetleri türetir. Tema tercihi ortak persistent-storage katmanında saklanır ve ThemeProvider üzerinden tüm uygulamaya yayılır. Profil ekranı bu yardımcıları kullanarak kart, çizgi grafik, rozet ve tema seçimini gösterir.

**Tech Stack:** Expo SDK 57, React Native, TypeScript, AsyncStorage/localStorage ortak katmanı, mevcut ThemeProvider, Vitest.

**Spec:** `SPEC.md` içindeki mevcut profil ve local persistence yaklaşımı; bu plan yeni iterasyon kapsamını tamamlar.

## Global Constraints

- Ham ses kayıtları paylaşılmayacak ve tema tercihi yerel saklanacak.
- Web için localStorage, native için AsyncStorage kullanılacak.
- Boş veri durumunda sahte puan gösterilmeyecek; açıklayıcı boş durum gösterilecek.
- Karanlık modda sistem tercihi başlangıç varsayılanı olabilir; kullanıcı seçimi sonraki açılışlarda korunacak.
- Her yeni davranış önce kırmızı testle doğrulanacak.

---

### Task 1: Domain yardımcıları

**Files:**
- Create: `lib/learning-motivation.ts`
- Create: `lib/theme-preference.ts`
- Test: `tests/lib/learning-motivation.test.ts`, `tests/lib/theme-preference.test.ts`

**Interfaces:**
- `calculateCurrentStreak(history, now): number`
- `getWeeklyBadges(history, now): WeeklyBadge[]`
- `buildScoreTimeline(history, now, days): ScoreTimelinePoint[]`
- `parseThemePreference(value): ThemePreference | null`
- `loadThemePreference(): Promise<ThemePreference | null>`
- `saveThemePreference(preference): Promise<void>`

Testler; bugün ve ardışık günlerde streak, boş günlerde sıfırlama, haftalık rozet eşikleri, zaman serisinde boş günler ve geçersiz tema tercihi davranışlarını kapsayacak.

### Task 2: Tema sağlayıcı entegrasyonu

**Files:**
- Modify: `lib/theme-provider.tsx`
- Modify: `app/_layout.tsx` yalnızca gerekirse provider davranışı için
- Test: tema tercih testleri

Provider başlangıçta kaydedilmiş tercihi yükler; kayıt yoksa sistem şemasını kullanır. `setColorScheme` hem runtime renklerini uygular hem de tercihi persist eder. `light`, `dark` ve `system` seçenekleri desteklenir; `system` aktif sistem rengini takip eder.

### Task 3: Profil motivasyon ve çizgi grafik UI

**Files:**
- Modify: `app/(tabs)/profile.tsx`
- Modify: `lib/pronunciation-history.ts` yalnızca mevcut timeline tipleriyle uyum için gerekirse

Profil ekranına mevcut `FlatList` başlığı içinde şu bölümler eklenir: current streak kartı, son 7 gün rozet kartları, SVG/React Native View tabanlı sade çizgi grafik, boş grafik açıklaması ve dark mode seçim kartı. Grafik erişilebilir bir tablo/özet metni de sunar.

### Task 4: Doğrulama ve checkpoint

**Files:**
- Modify: `todo.md`
- Create: `docs/verification-badges-streak-line-chart-dark-mode.md`

Run:
- `pnpm vitest run tests/lib/learning-motivation.test.ts tests/lib/theme-preference.test.ts`
- `pnpm test`
- `pnpm check`
- `pnpm lint`
- `git diff --check`
- WebDev profil önizlemesi ve dark mode/rozet/çizgi grafik görünümü

Sonuçlar doğrulanmadan checkpoint veya teslim iddiası yapılmayacak.
