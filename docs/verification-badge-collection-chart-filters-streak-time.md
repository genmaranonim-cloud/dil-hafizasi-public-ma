# Rozet Koleksiyonu, Grafik Filtreleri ve Streak Saati Doğrulaması

**Tarih:** 2026-09-15

Profil ekranına ayrı `/badges` rozet koleksiyonu erişimi eklendi. Koleksiyon, her rozetin kazanılıp kazanılmadığını ve ilk kazanılma tarihini gösterir. Gelişim grafiğinde hedef puan, kesik yatay çizgi ve açıklama olarak görünür; tarih aralığına ek olarak tüm dersler veya Ders 01–12 seçilebilir. Streak bildirim ayarı artık `20:00` biçiminde seçilebilir, localStorage/AsyncStorage’a kaydedilir ve tarayıcı açıkken seçilen dakikada kontrol edilir.

`pnpm test` başarılıdır: 21 test dosyasında 67 test geçti; auth logout testi atlandı. `pnpm check`, `pnpm lint` ve `git diff --check` başarılıdır.

Web önizlemede Ders 02 filtresi başlığı “Son 7 gün · Ders 02 · günlük ortalamaların” olarak güncelledi. “Rozet koleksiyonunu aç” aksiyonu `/badges` rotasına geçti ve “Rozet koleksiyonun” ekranını gösterdi. Streak bildirim saati alanı profil motivasyon kartında görünür durumdadır.
