# Başarı Kartları, Ders Karşılaştırması ve Haftalık Streak Saatleri Doğrulaması

**Tarih:** 2026-09-15

Rozet koleksiyonunda kazanılmış rozet seçildiğinde görsel başarı kartı önizlemesi görünür; kart rozet adı, açıklaması ve kazanılma tarihini taşır. Paylaşım akışı web Share API dosya paylaşımını desteklediğinde SVG kartı, desteklenmediğinde metin fallback’ini kullanır.

Profilde iki ders karşılaştırma kartı görünür. Birinci ve ikinci ders seçimleri ayrı yatay filtrelerdir; seçimler aynı ders olursa handler diğer seçimi yer değiştirerek iki farklı seri korur. Web önizlemede Ders 03 ve Ders 04 kontrolleri bulunur. Grafik serileri aynı tarih ekseninde iki renkli SVG çizgisi olarak üretilir.

Streak bildirimi kartı artık “Hafta içi” ve “Hafta sonu” olmak üzere iki saat alanı gösterir. Schedule helper hafta içi için pazartesi–cuma, hafta sonu için cumartesi–pazar saatini seçer; eski tek saat kaydı varsa geriye dönük uyumluluk için iki alana taşınır.

Doğrulama: yeni yardımcı testleri 3/3 geçti. Tam suite 22 test dosyasında 70 test geçti, auth logout testi atlandı. `pnpm check`, `pnpm lint` ve `git diff --check` başarılıdır. Web önizlemede profil iki saat alanını ve karşılaştırma kartını gösterdi; örnek geçmişle `/badges` sayfasında 4/4 rozet, başarı kartı önizlemesi ve paylaşım düğmesi görüntülendi. Doğrulama için eklenen örnek localStorage geçmişi sonrasında temizlendi.
