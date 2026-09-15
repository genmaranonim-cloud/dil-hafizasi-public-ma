# Rozetler, Streak, Çizgi Grafik ve Dark Mode Doğrulaması

**Tarih:** 2026-09-15

Bu iterasyonda profil ekranına günlük çalışma serisi, haftalık başarı rozetleri, son yedi günün telaffuz puanlarını gösteren çizgi grafik ve seçilebilir light/dark/system tema tercihi eklendi.

## Otomatik doğrulama

`pnpm test` başarılıdır: 20 test dosyasında 62 test geçti; mevcut auth logout testi yapılandırma nedeniyle atlandı. `pnpm check`, `pnpm lint` ve `git diff --check` de başarılıdır. Yeni testler `tests/lib/learning-motivation.test.ts` ve `tests/lib/theme-preference.test.ts` içinde yer alır.

## Önizleme doğrulaması

Profil web önizlemesinde “GÜNLÜK ÇALIŞMA SERİSİ”, dört rozet kartı, “Puanının gelişimi” çizgi grafik bölümü ve “Gece çalışma görünümü” tema seçenekleri görünür durumdadır. Veri yokken çizgi grafik sahte puan göstermeyip “Çizgi grafik için veri bekleniyor” boş durumunu gösterir.

Tarayıcı konsolunda Karanlık tema kontrolüne tıklama sonrası `localStorage` değeri `dark`, `document.documentElement.dataset.theme` değeri `dark` ve arka plan tokenı `#13202F` olarak doğrulanmıştır. Tema tercihi sayfa yeniden açıldığında da saklı kalmaktadır.

## Tasarım notu

Streak ve rozet ilerlemesi mevcut telaffuz denemelerinin tarihlerini çalışma sinyali olarak kullanır. En az iki farklı günde puan oluştuğunda çizgi grafik gerçek günlük ortalamaları bağlar; boş günler için kullanıcıya açıklayıcı boş durum gösterilir.
