# Tarayıcı LocalStorage, Telaffuz Analizi ve Sade Web Arayüzü

## Amaç

Expo Go veya TestFlight kurulumu olmadan Safari/Chrome önizlemesinde kullanılabilen Dil Hafızası sürümünü daha bağımsız hale getirmek.

## Kapsam

İlerleme, günlük tekrar, hedef puanı, bildirim saati ve telaffuz geçmişi tarayıcıda `localStorage`, native cihazlarda ise mevcut `AsyncStorage` üzerinden saklanır. Tarayıcı mikrofonu `MediaRecorder` ile kaydedilir; Safari için `audio/mp4`, uygun diğer tarayıcılar için `audio/webm` seçilir. Kayıt blob’u analiz endpoint’ine gönderilir ve yaklaşık AI geri bildirimi mevcut hikâye ekranında gösterilir. Web ekranları geniş masaüstü görünümünde 980px okuma alanına indirilir ve reduced-motion tercihi uygulanır.

## Kabul ölçütleri

- Tarayıcıdaki kaydetme/okuma/silme işlemleri `localStorage` çağrılarını kullanır.
- Native store davranışı AsyncStorage ile bozulmadan korunur.
- Safari’de mikrofon kaydı, tekrar dinleme ve mp4 analiz akışı çalışır.
- Destekleyen web tarayıcılarında webm kayıtları güvenli biçimde normalize edilir.
- MIME türü ve payload sınırı server router ve LLM file_url tipleriyle uyumludur.
- 980px içerik genişliği ve reduced-motion CSS kuralı desktop/web okunabilirliğini artırır.
- Unit testler, TypeScript ve lint geçer; web önizlemesi ana ekran ve hikâye rotasında açılır.

## Sınırlar

Bu değişiklik bir kullanıcı hesabı veya bulut senkronizasyonu eklemez. `localStorage` yalnızca aynı tarayıcı ve cihazdaki verileri korur. Mikrofon erişimi için Safari’nin HTTPS bağlamında ve kullanıcı izniyle çalışması gerekir. AI değerlendirmesi yaklaşık eğitim geri bildirimidir; klinik veya laboratuvar ölçümü değildir.
