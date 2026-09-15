# Dil Hafızası — Özellik ve Hata Takibi

## Özellikler

- [x] Kaydedilmiş telaffuz için AI değerlendirme endpointi ve anında geri bildirim kartı.
- [x] Ders 4: Market alışverişi.
- [x] Ders 5: Yol tarifi sorma.
- [x] Ders 6: Doktor randevusu.
- [x] Ders 4–6 görsel hafıza görselleri.
- [x] Ana ekranda yerel Günlük Tekrar kartı.

## Hatalar / Riskler

- [x] AI değerlendirme çağrısında ağ, mikrofon izni ve büyük dosya hataları kullanıcıya anlaşılır gösterilmeli.
- [x] AI geri bildirimi fonetik kesinlik iddiası taşımamalı; düşük güven durumları açıklanmalı.
- [x] Ders kartı, görsel ve hikâye seçimi aynı ders numarasını kullanmalı.
- [x] Native iOS/Android kayıt URI'si analiz endpointine gönderilmeden önce base64'e dönüştürülmeli.

## Doğrulama

- [x] TDD kırmızı testleri yazıldı ve beklenen şekilde başarısız oldu.
- [x] Tüm testler geçti.
- [x] TypeScript kontrolü geçti.
- [x] Lint geçti.
- [x] Mobil önizleme kontrol edildi.
- [ ] WebDev checkpoint oluşturuldu.


## 2026-09-15 — Profil, Bildirim, Ders 7–9

- [x] Ders 7 restoran siparişi, Ders 8 otel rezervasyonu, Ders 9 iş görüşmesi.
- [x] Ders 7–9 için sıkıştırılmış görsel hafıza görselleri.
- [x] Telaffuz geçmişi store'u ve ders bazlı özet hesaplama.
- [x] Profil sekmesi: puan grafiği, toplam deneme, son denemeler.
- [x] Saat seçilebilir yerel Günlük Tekrar bildirimi.
- [x] Bildirim izni, web/native farkı ve tekrar planını değiştirme akışı.
- [x] Yeni özellikler için test, TypeScript, lint, önizleme.
- [x] WebDev checkpoint.


## 2026-09-15 — Haftalık Trend, Hedef, Deep Link, Ders 10–12

- [x] Haftalık son 7 gün telaffuz trendi ve boş gün gösterimi.
- [x] 1–100 arası hedef puan ayarı, doğrulama ve yerel saklama.
- [x] Profilde haftalık grafik, hedef bağlamı ve hedefi temizleme akışı.
- [x] Bildirim payload'ına önceki ders rotası ekleme.
- [x] Warm-start ve cold-start notification response deep link yönlendirmesi.
- [x] Ders 10 havaalanı, Ders 11 telefon görüşmesi, Ders 12 sunum yapma.
- [x] Ders 10–12 için sıkıştırılmış görsel hafıza görselleri.
- [x] Yeni testler, TypeScript, lint, önizleme ve WebDev checkpoint.


## 2026-09-15 — Harici Hizmetleri Ayrı Sekmede Açılabilir Bağlantılar

- [x] OpenAI, Google Gemini ve ElevenLabs resmi bağlantı veri modelini eklemek.
- [x] Kaynaklar ekranında hizmet kartları ve erişilebilir açma düğmeleri.
- [x] Native/web ortamında güvenli URL açma ve hata durumu.
- [x] Sekme navigasyonuna Kaynaklar ekranını eklemek.
- [x] Test, TypeScript, lint ve mobil önizleme.
- [x] WebDev checkpoint.


## 2026-09-15 — Expo Go SDK 57 Uyumluluk Düzeltmesi

- [x] Expo SDK 54’ten SDK 57’ye ve uyumlu Expo modüllerine yükseltme.
- [x] SDK 57 config pluginleri ve expo-asset peer bağımlılığını ekleme.
- [x] SDK 57 TypeScript uyumsuzluklarını düzeltme: ikon tipleri, bildirim iptali, tema şeması ve tab düğmesi.
- [x] Expo Doctor: 21/21 kontrol geçti.
- [x] Test, TypeScript, lint ve SDK 57 public config kontrolleri geçti.
- [x] Metro/Web önizleme yeniden başlatıldı ve ana ekran görüntülendi.
- [ ] iPhone’da yeni QR kodla Expo Go bağlantısının kullanıcı tarafından tekrar denenmesi.
- [x] WebDev checkpoint.


## 2026-09-15 — TestFlight Hazırlığı ve Yumuşak Animasyonlar

- [x] EAS production/preview/development profillerini `eas.json` ile yapılandırma.
- [x] iOS TestFlight gereksinimlerini ve Apple Developer/App Store Connect adımlarını belgeleme.
- [x] Animasyon policy testleri: kısa süre, hafif ölçek ve reduced-motion davranışı.
- [x] Ders kartları, ana aksiyonlar, hikâye kontrolleri, hafıza, profil ve kaynak düğmelerini AnimatedPressable’a geçirme.
- [x] Expo Router ders ekranı geçişlerine kısa fade animasyonu ekleme.
- [x] 46 test, TypeScript, lint, Expo Doctor 21/21, EAS config ve Metro önizlemesini doğrulama.
- [ ] Apple Developer/Expo hesabıyla EAS build ve App Store Connect yüklemesi.
- [x] WebDev checkpoint.


## 2026-09-15 — Tarayıcı LocalStorage, Telaffuz Analizi ve Sade UI

- [x] İlerleme, günlük tekrar, hedef puanı, bildirim saati ve telaffuz geçmişini browser localStorage’a taşıma.
- [x] Native AsyncStorage fallback’ini koruma.
- [x] Safari mp4 ve destekleyen tarayıcılarda webm MediaRecorder kaydı.
- [x] Tarayıcı kaydını tekrar dinleme ve AI analiz endpoint’ine gönderme.
- [x] Sunucu router, payload, storage uzantısı ve LLM MIME tiplerini webm ile uyumlama.
- [x] Ana ekran, hikâye, hafıza, profil ve kaynaklar için sade 980px web okuma alanı.
- [x] Browser reduced-motion CSS desteği.
- [x] 51 test, TypeScript, lint, Metro bundling ve Safari önizleme akışını doğrulama.
- [x] WebDev checkpoint.


## 2026-09-15 — Yedekleme, İlerleme Grafiği ve Paylaşım

- [x] Sürümlü JSON yedeği dışa aktarma.
- [x] Yedek dosyasını doğrulayarak güvenli geri yükleme.
- [x] Hafıza, ders, ortalama telaffuz ve hedef puanı için ilerleme grafik/tablo kartı.
- [x] Son telaffuz analizini ve günlük özeti ham ses kaydı olmadan paylaşma.
- [x] Web Share API, clipboard fallback ve native Share fallback.
- [x] 56 test geçti, TypeScript, lint, browser önizleme, paylaşım ve yedek indirme doğrulandı.
- [x] WebDev checkpoint.


## 2026-09-15 — Rozetler, Streak, Çizgi Grafik ve Dark Mode

- [x] Kapsam ve uygulama planını belgelemek.
- [x] Rozet, streak ve yedi günlük telaffuz zaman serisi yardımcılarını uygulamak.
- [x] Light/dark/system tema tercihini yerel olarak saklamak ve ThemeProvider’a bağlamak.
- [x] Profilde günlük çalışma serisi ve haftalık başarı rozetlerini göstermek.
- [x] Profilde puan gelişimi için erişilebilir boş durumlu çizgi grafik göstermek.
- [x] Profilde tema seçimini göstermek.
- [x] Yeni test, TypeScript, lint, diff ve web önizleme kontrollerini tamamlamak.
- [x] WebDev checkpoint.


## 2026-09-15 — Kutlama, Grafik Filtreleri ve Streak Bildirimleri

- [x] Kapsam ve uygulama planını belgelemek.
- [x] Yeni rozet veya yükselen streak için erişilebilir kutlama overlay’i eklemek.
- [x] Telaffuz çizgi grafiğine 7 gün, 30 gün ve tüm zamanlar filtrelerini eklemek.
- [x] Tarayıcı bildirim izni ve streak riskinde günlük tek bildirim akışını eklemek.
- [x] Kutlama, grafik aralığı, bildirim koşulları, TypeScript, lint ve web önizleme kontrollerini tamamlamak.
- [x] WebDev checkpoint.


## 2026-09-15 — Rozet Koleksiyonu, Grafik Filtreleri ve Streak Saati

- [x] Rozet kazanım tarihlerini hesaplayan domain yardımcılarını uygulamak.
- [x] Ayrı `/badges` koleksiyon sayfası ve profil hızlı erişimi eklemek.
- [x] Grafik hedef puanı çizgisini ve ders 01–12 filtresini eklemek.
- [x] Streak bildirim saatini yerel olarak kaydetmek ve seçilen dakikada kontrol etmek.
- [x] Test, TypeScript, lint, diff ve web önizleme kontrollerini tamamlamak.
- [x] WebDev checkpoint.


## 2026-09-15 — Başarı Kartları, Ders Karşılaştırması ve Haftalık Streak Saatleri

- [x] Başarı kartı SVG önizlemesi ve web/native paylaşım fallback’i.
- [x] Gelişim grafiğinde iki ders seçimi ve aynı tarih ekseninde iki çizgi.
- [x] Hafta içi ve hafta sonu streak saatlerini ayrı saklama ve gün tipine göre seçme.
- [x] Geriye dönük tek saat kaydı uyumluluğu.
- [x] 22 test dosyası / 70 test, TypeScript, lint, diff ve web önizleme doğrulaması.
- [x] WebDev checkpoint.


## 2026-09-15 — Kişiselleştirilmiş Başarı Kartı, Karşılaştırma Özeti ve Erteleme

- [x] Başarı kartına isteğe bağlı kullanıcı adı ekleme.
- [x] Okyanus, Gün batımı, Orman ve Lavanta renk temaları.
- [x] Karşılaştırma grafiğinde ortalama puan farkı özeti.
- [x] İki ders için gelişim yüzdesi özeti.
- [x] “Bugün hatırlatma” düğmesi ve yalnızca bugünü kapsayan localStorage ertelemesi.
- [x] 23 test dosyası / 73 test, TypeScript, lint, diff ve web önizleme doğrulaması.
- [x] WebDev checkpoint.


## 2026-09-15 — Bulut Oturumu ve Cihazlar Arası Senkronizasyon

- [x] Mevcut Manus OAuth altyapısını profil ekranında giriş/çıkış deneyimine bağlama.
- [x] Kullanıcıya ait `user_sync_snapshots` tablosu ve güvenli Drizzle migration.
- [x] Migration’ı veritabanına uygulama.
- [x] Yalnızca oturum açmış kullanıcının kendi snapshot’ına erişebildiği protected `sync.get` ve `sync.save` uçları.
- [x] Ders ilerlemesini union, telaffuz geçmişini kayıt kimliğiyle merge eden; ayarları senkronizasyon tabanına göre çözen çakışma stratejisi.
- [x] İlk defa bağlanan cihazda bulut ayarlarını koruma ve ilk yerel snapshot’ı buluta alma.
- [x] Tema ve bildirim zaman tercihlerinin bulut snapshot’ına dahil edilmesi; ham ses kaydı ve cihaz-özel bildirim durumunun hariç tutulması.
- [x] Profilde kullanıcı kimliği, otomatik giriş sonrası eşitleme, “Şimdi eşitle” ve “Çıkış yap” akışları.
- [x] Unit/server testleri, TypeScript, lint, migration, web profil önizlemesi ve durum kontrolleri.
- [ ] WebDev checkpoint.


## 2026-09-15 — Girişsiz Public Web Sürümü

- [x] Public edition mod bayrağı ve testini ekleme.
- [x] Public pakette profil bulut senkronizasyon kartını ve OAuth sorgusunu devre dışı bırakma.
- [x] GitHub Pages alt yolu için Expo `baseUrl` yapılandırması.
- [x] Clean CI export için NativeWind önbellek hazırlık betiği.
- [x] GitHub Pages workflow, kullanım/gizlilik README’si ve yayın planı.
- [x] 80 test, TypeScript, lint ve girişsiz statik Expo export doğrulaması.
- [ ] WebDev checkpoint.
- [ ] Herkese açık GitHub Pages repository ve yayınlama.
- [ ] Public URL üzerinden nihai erişim doğrulaması.
