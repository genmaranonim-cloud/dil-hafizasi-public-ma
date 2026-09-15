# Expo Go SDK 57 Uyumluluk Güncellemesi

## Sorun

iPhone’daki Expo Go SDK 57 ile Dil Hafızası projesinin Expo SDK 54 sürümü eşleşmiyor. Expo Go iOS’ta eski SDK sürümünü kurmaya izin vermediği için proje güncel SDK sürümüne taşınmalı.

## Uygulama yaklaşımı

Expo’nun önerilen kurulum komutu ile `expo` paketini SDK 57’ye yükseltmek ve `expo install --fix` ile Expo modüllerini SDK 57’nin uyumlu sürümlerine eşlemek. Ardından Expo doctor/config kontrollerini, proje testlerini, TypeScript ve lint kontrollerini çalıştırmak; ortaya çıkan API veya plugin uyumsuzluklarını düzeltmek.

## Kabul ölçütleri

Proje yapılandırması SDK 57 olarak raporlanmalı, Expo doctor kritik uyumsuzluk göstermemeli, test/TypeScript/lint kontrolleri geçmeli, Metro web önizlemesi çalışmalı ve iOS Expo Go’ya bağlanmak için kullanılan QR/deep-link akışı SDK 57 uyumluluğuna işaret etmeli. Native derleme gerektiren son doğrulama için kullanıcının iPhone’unda Expo Go ile QR kodun tekrar taranması gerektiği açıkça belirtilmeli.
