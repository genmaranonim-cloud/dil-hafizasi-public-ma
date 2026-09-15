# Başarı Kartları, Ders Karşılaştırması ve Haftalık Streak Saatleri

## Amaç

Kazanılan rozetlerin görsel başarı kartına dönüştürülüp paylaşılabilmesi, gelişim grafiğinde iki farklı dersin aynı zaman eksenindeki puanlarının karşılaştırılabilmesi ve streak bildirimlerinin hafta içi ile hafta sonu için ayrı saatlerde ayarlanabilmesi.

## Uygulama yaklaşımı

Rozet koleksiyonunda seçilen kazanılmış rozet için markalı kart önizlemesi gösterilir. Web Share API dosya paylaşımını destekliyorsa SVG kart gönderilir; desteklenmeyen tarayıcılarda güvenli metin panoya kopyalanır. Kart, yalnızca rozet bilgisi ile kazanım tarihini taşır.

Profilde iki farklı ders seçilir; günlük puan ortalamaları aynı tarih sıralaması üzerinde iki renkli SVG çizgisiyle gösterilir. Streak ayarı hafta içi ve hafta sonu için iki ayrı saat saklar; tarayıcıda bildirim zamanı, gün tipine göre seçilir. Eski tek saat kaydı varsa iki saat için aynı değer kullanılır.

## Doğrulama

Önce saf yardımcı fonksiyonlar için kırmızı testler yazılır. Ardından UI, kalıcı saklama ve web bildirim kontrolü eklenir. Son aşamada tüm testler, TypeScript, lint, diff ve tarayıcı önizlemesi doğrulanır.
