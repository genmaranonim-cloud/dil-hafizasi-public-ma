# MA — Dil Hafızası Public Browser Edition

Bu repository, **Dil Hafızası** uygulamasının giriş istemeyen, tarayıcıdan çalışan public sürümünü içerir.

## Kullanım

Uygulama GitHub Pages üzerinde Safari, Chrome, Edge ve Firefox’un güncel sürümleriyle açılır. Dersler, kelime/hafıza pratikleri, rozetler, hedef puanı, grafikler, tema tercihi ve hatırlatıcı ayarları cihazın `localStorage` alanında saklanır.

Tarayıcı destekliyorsa kullanıcı bir cümleyi kaydedip telaffuz analizi isteyebilir. Kayıt tarayıcı içinde kalır; yalnızca değerlendirme sırasında güvenli HTTPS API’sine gönderilir.

## Gizlilik sınırı

Bu sürümde **giriş, Manus OAuth ve cihazlar arası senkronizasyon yoktur**. Bir cihazın tarayıcı verileri başka cihazda görünmez. Verileri taşımak için Profil ekranındaki JSON dışa aktar/geri yükle araçları kullanılabilir.

## Yayınlama

`main` dalına yapılan her doğrulanmış gönderim, GitHub Actions üzerinden GitHub Pages’e statik Expo web paketi yayımlar. Expo `baseUrl` ayarı, repository alt yolundaki varlıkların doğru yüklenmesini sağlar.

> Expo web çıktısı ve GitHub Pages alt-yol yapılandırması, Expo’nun resmi [Publish websites rehberine](https://docs.expo.dev/guides/publishing-websites/) göre hazırlanmıştır.
