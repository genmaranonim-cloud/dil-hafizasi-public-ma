# Kutlama, Grafik Filtreleri ve Streak Bildirimleri Doğrulaması

**Tarih:** 2026-09-15

Profil ekranına üç yeni davranış eklendi. Yeni rozet veya yükselen çalışma serisi algılandığında kısa bir kutlama overlay’i görünür; reduced-motion tercihi algılandığında hareket süresi azaltılır. Telaffuz çizgi grafiği son 7 gün, son 30 gün ve tüm zamanlar seçenekleriyle filtrelenebilir. Tarayıcı bildirimi, kullanıcı düğmeye dokunarak izin verdiğinde ve bugün henüz pratik yapılmamışken mevcut serinin riskte olduğunu hatırlatır; aynı gün ikinci kez bildirim gönderilmez.

## Otomatik doğrulama

`pnpm test` başarılıdır: 21 test dosyasında 66 test geçti; mevcut auth logout testi atlandı. `pnpm check`, `pnpm lint` ve `git diff --check` başarılıdır. Yeni testler `tests/lib/motivation-features.test.ts` içinde kutlama olayı, 30 gün/tüm zaman timeline’ı ve streak bildirim koşullarını kapsar.

## Web önizleme doğrulaması

Profil ekranında streak bildirim düğmesi ile `7 gün`, `30 gün` ve `Tümü` grafik filtreleri görünür durumdadır. Tarayıcı konsolunda 30 günlük filtre tıklandığında başlık “Son 30 gün · günlük ortalamaların”, tüm zamanlar filtresi tıklandığında başlık “Tüm zamanlar · günlük ortalamaların” olarak güncellenmiştir. Veri yokken çizgi grafik sahte değer üretmeyip açıklayıcı boş durum mesajı gösterir.

Tarayıcı bildirimi yalnızca kullanıcı etkileşiminden sonra izin ister. İzin verilmezse kullanıcıya Safari/site bildirim ayarlarını kontrol etmesi gerektiğini belirten ekran içi mesaj gösterilir. Bildirimler tarayıcı açıkken çalışır; uygulama kapalıyken zamanlanmış hatırlatıcı için mevcut native Expo bildirim ayarı kullanılmaya devam eder.
