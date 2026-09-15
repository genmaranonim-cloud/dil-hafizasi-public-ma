# Kutlama Animasyonları, Grafik Tarih Filtreleri ve Streak Bildirimleri

## Amaç

Kullanıcı rozet kazandığında veya streak’i arttığında kısa, erişilebilir bir kutlama göstermek; telaffuz grafiklerini son 7 gün, son 30 gün ve tüm zaman aralıklarında incelemeyi sağlamak; günlük seri o gün henüz korunmadıysa tarayıcı bildirim izniyle kullanıcıyı nazikçe uyarmak.

## Tasarım

Kutlama state’i profil ekranında önceki rozet kimlikleri ve önceki streak değeriyle karşılaştırılır. Yeni rozet veya daha yüksek streak algılandığında `CelebrationOverlay` kısa süre görünür; reduced-motion tercihinde hareketler azaltılır ve mesaj metin olarak kalır.

Grafik filtresi üç sabit aralık kullanır: `7`, `30` ve `all`. Domain katmanı seçilen gün sayısını kabul ederek aynı günlük ortalama modelini üretir. Büyük tüm zaman aralıklarında grafik çizgi yoğunluğunu azaltmak yerine mobil okunabilirliği korumak için SVG genişliği sabit, etiketler aralıklı ve boş günler gerçek veri yok olarak gösterilir.

Tarayıcı streak uyarısı Web Notification API ile yapılır. İzin kullanıcı etkileşimiyle istenir; izin verilmediyse ekran içi mesaj gösterilir. Uyarı yalnızca bugün pratik yapılmadığında, mevcut streak korunabilecek durumdayken ve aynı gün daha önce gönderilmediyse gösterilir. Son gönderim tarihi localStorage’da tutulur. Native bildirim akışı mevcut `expo-notifications` altyapısından etkilenmez.

## Doğrulama

Saf yardımcılar için kırmızı testler; yeni rozet/streak, tarih aralıkları, bildirim koşulları ve aynı gün tekrarını engelleme davranışlarını kapsar. Ardından profil UI, browser notification mock akışı, `pnpm test`, `pnpm check`, `pnpm lint`, `git diff --check` ve WebDev önizleme doğrulanır.
