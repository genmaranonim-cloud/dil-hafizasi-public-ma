# Telaffuz Değerlendirme, Ders 4–6 ve Günlük Tekrar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kaydedilmiş telaffuzları sunucu tarafı AI ile değerlendirmek, Ders 4–6'yı görsellerle eklemek ve ana ekrana yerel Günlük Tekrar kartı koymak.

**Architecture:** `server/routers.ts` içine Zod doğrulamalı public `pronunciation.analyze` mutation'ı eklenecek. Sunucu base64 audio'yu geçici storage'a yükleyip `invokeLLM` ile file_url + hedef cümle üzerinden JSON Schema değerlendirmesi yapacak. Mobil tarafta `lib/pronunciation-review.ts` sonucu normalize edecek; `stories.tsx` kayıt sonrası mutation çağırıp geri bildirim kartını gösterecek. Yeni dersler `lib/story-memory.ts` içindeki merkezi veri modeline, `index.tsx` ve `stories.tsx` görsel map'lerine eklenecek. Günlük Tekrar kartı AsyncStorage ile kapatma durumunu saklayacak.

**Tech Stack:** Expo SDK 54, React Native, TypeScript, tRPC v11, Zod, AsyncStorage, expo-audio, built-in `invokeLLM`, S3 storage helper.

**Spec:** `SPEC.md`

## Global Constraints

- API anahtarı yalnızca sunucu tarafında kalacak.
- Ses payload'ı 2 MB ile sınırlandırılacak.
- AI geri bildirimi yaklaşık/pratik amaçlı olarak sunulacak; kesin fonetik laboratuvar ölçümü iddia edilmeyecek.
- Yeni görseller sıkıştırılmış JPEG olacak.
- Yerel ilerleme ve hatırlatıcı durumu AsyncStorage'da tutulacak.

---

### Task 1: Domain model and content

**Files:**
- Modify: `lib/story-memory.ts`
- Test: `tests/lib/story-memory.test.ts`

- [ ] Ders 4–6 için kırmızı testler yaz.
- [ ] `LESSON_CARDS`, `STORIES` ve `getStoryByLesson` içeriklerini ekle.
- [ ] Testleri yeniden çalıştır ve tüm içerik beklentilerini doğrula.

### Task 2: AI result normalization and API

**Files:**
- Create: `lib/pronunciation-review.ts`
- Modify: `server/routers.ts`
- Test: `tests/lib/pronunciation-review.test.ts`
- Test: `tests/server/pronunciation.test.ts`

- [ ] Puan aralığı, Türkçe geri bildirim, hata alanları ve güvenli varsayılanlar için kırmızı testler yaz.
- [ ] Normalize yardımcılarını uygula.
- [ ] `pronunciation.analyze` endpointinde base64/mime/size doğrulaması yap.
- [ ] `storagePut`, `storageGetSignedUrl` ve `invokeLLM` ile yapılandırılmış değerlendirme bağla.
- [ ] Server testlerinde küçük bir JSON evaluation path için input guard davranışını doğrula.

### Task 3: Visual assets

**Files:**
- Create: `assets/images/lesson-04-grocery.jpg`
- Create: `assets/images/lesson-05-directions.jpg`
- Create: `assets/images/lesson-06-doctor.jpg`
- Modify: `scripts/compress-lesson-assets.py`

- [ ] Dilek karakterini ve mevcut sıcak editoryal görsel dilini koruyan üç görsel üret.
- [ ] JPEG optimizasyonunu doğrula ve PNG kopyalarını kaynakta tutma.

### Task 4: Mobile pronunciation review UI

**Files:**
- Modify: `app/(tabs)/stories.tsx`
- Modify: `app/(tabs)/index.tsx`
- Test: `tests/lib/audio-practice.test.ts`

- [ ] Kayıt sonrası `pronunciation.analyze.useMutation` çağrısını bağla.
- [ ] Base64 dönüşümünü platformlar arası helper ile uygula.
- [ ] Loading, success, error, score, strengths, focus areas ve next try durumlarını göster.
- [ ] Günlük Tekrar kartını ana ekrana ekle ve kapatma/yeniden açma durumunu yerel sakla.

### Task 5: Verification and checkpoint

**Files:**
- Modify: `todo.md`

- [ ] `pnpm test` çalıştır.
- [ ] `pnpm check` çalıştır.
- [ ] `pnpm lint` çalıştır.
- [ ] Mobil önizlemede ana ekran, Ders 4–6, kayıt ve AI geri bildirim durumlarını kontrol et.
- [ ] Kullanıcıya teslim etmeden önce WebDev checkpoint oluştur.
