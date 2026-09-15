# Yedekleme, İlerleme Görselleştirmesi ve Paylaşım

## Amaç

Tarayıcıdaki yerel öğrenme verilerinin kullanıcı kontrolünde yedeklenmesini, profil ekranında anlaşılır biçimde izlenmesini ve kişisel ses dosyalarını paylaşmadan günlük ilerleme özetinin paylaşılmasını sağlamak.

## Kapsam

Profil ekranına sürümlü JSON yedeği indirme ve dosyadan güvenli geri yükleme düğmeleri eklenir. Yedek; hikâye ilerlemesi, günlük tekrar, hedef puanı, bildirim saati ve telaffuz geçmişini kapsar. Uygulama kimliği, sürüm ve veri boyutu doğrulanır; yalnızca bilinen anahtarlar geri yüklenir.

İlerleme kartı, hafıza aşamalarını, çalışılan ders sayısını, ortalama telaffuz puanını ve hedef puanı bar grafiklerle gösterir. Paylaşım düğmesi Web Share API’yi, destek yoksa clipboard fallback’ini; native’de sistem paylaşım menüsünü kullanır. Metin; son analiz puanı ve özeti ile günlük toplamları içerir, ham ses kaydı içermez.

## Kabul ölçütleri

- Geçerli Dil Hafızası JSON yedeği indirilebilir ve geri yüklenebilir.
- Başka uygulamaya ait, bozuk veya desteklenmeyen yedek reddedilir.
- Geri yükleme sonrası profil verileri yeniden okunur ve kartlar güncellenir.
- İlerleme grafikleri hedef puanını ve yerel kayıtları birlikte gösterir.
- Paylaşım metni son analiz özetini, puanı, hedefi ve günlük ilerlemeyi içerir.
- Ham ses verisi paylaşım metnine veya yedek dosyasına eklenmez.
- Unit testler, TypeScript, lint ve web önizleme geçer.
