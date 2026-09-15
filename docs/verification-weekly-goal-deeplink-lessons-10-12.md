# Haftalık Trend, Hedef Puanı, Deep Link ve Ders 10–12 Doğrulaması

**Tarih:** 2026-09-15

Mobil 390×844 önizlemede profil ekranı kontrol edildi. Son yedi gün için günlük satırlardan oluşan haftalık skor trendi, deneme bulunmayan günleri `—` ile boş olarak gösterdi. Hedef puan kartı 1–100 arası hedef girişine, kaydetme eylemine ve hedef belirlenmemiş durum açıklamasına sahipti. Puan geçmişi boş olduğu için ekranda herhangi bir uydurma skor veya trend verisi gösterilmedi.

Ana ekranda ders serisi sayacı `01 / 12` olarak göründü. Ders 10 “Airport Check-in”, Ders 11 “A Phone Call” ve Ders 12 “Giving a Presentation” yolları mobil önizlemede açıldı. Her biri doğru A2 tema etiketi, benzersiz sıkıştırılmış JPEG görseli, odak kelimeleri, dinleme kontrolleri ve telaffuz pratiği kartını gösterdi.

Bildirim akışı web önizlemesinde işletim sistemi bildirimi planlamaz. Saf payload testi, önceki ders biliniyorsa `/stories?lesson=<n>` rotasını, hedef bulunmuyorsa güvenli `/` rotasını doğruladı. Native iOS/Android çalıştırmasında kullanıcı bildirim izni verdiğinde, uygulama bildirim yanıtını dinler ve bu rotayı Expo Router ile açar.

Otomatik kontrollerde `pnpm test` sonucunda 14 test dosyası geçti, 1 dosya mevcut auth ortamı nedeniyle atlandı; 41 test geçti ve 1 test atlandı. `pnpm check` ve `pnpm lint` başarıyla tamamlandı. `expo-notifications` eklentisi önceki iterasyondan beri Expo yapılandırmasında kayıtlıdır.
