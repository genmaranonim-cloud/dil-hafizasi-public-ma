# Bulut Auth ve Cihazlar Arası Senkronizasyon

## Amaç

Web sürümünde Manus OAuth ile giriş yapan kullanıcı, öğrenme ilerlemesini kullanıcı hesabına bağlı bir veritabanı snapshot’ında saklayabilmeli ve farklı tarayıcı/cihazlarda aynı veriyi geri alabilmelidir.

## Kapsam

Mevcut Manus OAuth akışı korunur. Yeni `protectedProcedure` uçları yalnızca `ctx.user.id` üzerinden çalışır. Sunucuda her kullanıcı için tek güncel snapshot tutulur. Snapshot; ders ilerlemesi, günlük tekrar, hedef puanı, telaffuz geçmişi, tema ve bildirim zaman ayarlarını içerir; cihaz-özel native bildirim kimliği ve geçici gün içi bildirim durumu buluta taşınmaz.

Giriş yapmamış kullanıcı yerel depolamayı kullanmaya devam eder. Giriş yapıldığında profil ekranı uzak snapshot’ı çeker, yerel ve uzak veriyi kayıp yaratmadan birleştirir, sonucu hem yerel depoya hem buluta yazar. Telaffuz geçmişi kayıt kimliğine göre birleştirilir, hikâye aşamaları union alınır; hedef ve ayarlar daha yeni snapshot’ın değeriyle seçilir.

## Kabul ölçütleri

1. Giriş yapmamış kullanıcıda uygulama mevcut yerel çalışma biçimini korur.
2. Profilde “Giriş yap” düğmesi Manus OAuth akışını başlatır; giriş sonrası kullanıcı adı/e-posta ve senkronizasyon durumu görünür.
3. `sync.get` ve `sync.save` yalnızca oturum açmış kullanıcının kendi kaydına erişir.
4. Uzak snapshot mevcutsa yerel ve uzak geçmiş/ilerleme kayıpsız merge edilir.
5. Uzak snapshot yoksa mevcut yerel veri ilk bulut snapshot’ı olarak kaydedilir.
6. Kullanıcı profil düğmesiyle senkronizasyonu yeniden çalıştırabilir ve başarı/hata durumu görür.
7. Snapshot boyutu sunucuda sınırlanır; ham ses kayıtları ve API anahtarları senkronize edilmez.
8. Test, TypeScript, lint, migration ve web önizleme doğrulamaları geçer.
