# TestFlight Hazırlığı

Expo’nun resmi rehberine göre iOS TestFlight dağıtımı için ücretli Apple Developer hesabı, App Store Connect uygulama kaydı, `distribution: "store"` kullanan bir EAS production profili ve iPhone’da TestFlight uygulaması gerekir.

Önerilen akış: `eas build --platform ios --profile production --auto-submit`. EAS Build üretim `.ipa` dosyasını oluşturur; EAS Submit bunu App Store Connect’e yükler. Apple’ın işleme süreci tamamlandıktan sonra yapı TestFlight’ta görünür. İlk iç test grubu App Store Connect ekibindeki kullanıcılarla paylaşılabilir; dış testçiler için Apple beta incelemesi gerekir.

Mac zorunlu değildir; EAS Build ve EAS Submit Linux, macOS ve Windows’tan çalışabilir. EAS, iOS imzalama sertifikaları ve provisioning profile oluştururken Apple Developer hesabıyla giriş ister. Uygulama kimliği için `ios.bundleIdentifier` benzersiz olmalıdır; App Store Connect uygulama kaydı oluşturulduktan sonra `ascAppId` değeri isteğe bağlı olarak `eas.json` submission profilinde sabitlenebilir.

Kaynaklar:

- [Expo — Distribute an iOS app with TestFlight](https://docs.expo.dev/submit/testflight/)
- [Expo — Create a production build for iOS](https://docs.expo.dev/tutorial/eas/ios-production-build/)
- [Expo — Submit to the Apple App Store with EAS Submit](https://docs.expo.dev/submit/ios/)
- [Apple — TestFlight](https://developer.apple.com/testflight/)

Bu dosya Apple hesabı, parola, App Store Connect API anahtarı veya provisioning credential içermez.
