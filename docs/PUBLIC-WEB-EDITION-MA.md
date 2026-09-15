# MA — Girişsiz Dil Hafızası Web Sürümü

## Amaç

Bu teslim, mevcut giriş gerektiren Dil Hafızası uygulamasından bağımsız olarak yayımlanacak, **kurulumsuz ve herkese açık** bir tarayıcı sürümüdür. Kullanıcı, Safari veya başka bir modern tarayıcı üzerinden dersleri, kelime/hafıza pratiklerini, yerel ilerleme takibini ve destekleyen tarayıcılarda telaffuz analizini kullanabilir.

## Sınırlar

Yeni sürümde tüm öğrenme verileri yalnızca cihazın `localStorage` alanında tutulur. Manus OAuth giriş ekranı ve cihazlar arası bulut senkronizasyonu bu sürümden çıkarılır. Telaffuz analizi, kayıtsız kullanıma açık mevcut sunucu API’sine HTTPS üzerinden bağlanır; ham ses kayıtları tarayıcıda kalır ve yalnızca değerlendirme isteği sırasında gönderilir.

## Yayın akışı

GitHub’da `dil-hafizasi-public-ma` adlı herkese açık bir repository oluşturulur. Expo web çıktısı GitHub Actions aracılığıyla GitHub Pages’e gönderilir. Repository alt yolunda varlıkların doğru yüklenmesi için Expo `baseUrl` ayarı derleme ortamında `/dil-hafizasi-public-ma` olur. Her güncellemede `main` dalına gönderilen doğrulanmış kaynak kod yeniden Pages dağıtımı başlatır.

## Kabul ölçütleri

| Ölçüt | Beklenen sonuç |
|---|---|
| Oturum | Public URL doğrudan ders ekranına açılır; login veya permission_denied görünmez. |
| Veri | Ders ilerlemesi, hedef puan, rozetler ve tercihlerin cihazdaki localStorage’da kalması sürer. |
| Ses | Safari’de MP4, destekleyen tarayıcılarda WebM kayıtları telaffuz analizine gönderilebilir. |
| Giriş | Cloud sync kartı ve OAuth çağrısı public pakette gösterilmez. |
| Yayın | GitHub Pages URL’si HTTPS üzerinden herkese açık çalışır. |

## Kaynak

GitHub Pages alt yolunda Expo varlıklarının çalışması için `experiments.baseUrl` ve statik export akışı, Expo’nun resmi [Publish websites rehberinde](https://docs.expo.dev/guides/publishing-websites/) doğrulanmıştır.
