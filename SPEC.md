# Spec: Dil Hafızası Mobil MVP

## Objective

**Dil Hafızası**, başlangıç seviyesindeki yetişkinlerin İngilizceyi kısa, gerçekçi ve tekrar eden hikâyeler üzerinden edinmesine yardım eden bir iOS/Android uygulamasıdır. Uygulama, kullanıcının sıfırdan çeviri yapmasını istemek yerine aynı hikâyeyi **görme, dinleme, söyleme ve kademeli olarak geri çağırma** döngüsüne yerleştirir.

İlk sürüm, kullanıcının günde 30 dakika ayırdığı günlük hayat hedefi için hazırlanmıştır. İlk içerik, A1 düzeyindeki **“Dilek’s Busy Wednesday”** hikâyesidir. Başarı; kullanıcının hikâyeyi İngilizce/Türkçe okuyabilmesi, yavaş İngilizce seslendirmeyi dinleyebilmesi, beş hafıza aşamasını tamamlayabilmesi ve ilerlemesini aynı cihazda görebilmesidir.

## Capability Map

| Module id | Responsibility | Depends on |
|---|---|---|
| story-content | A1 yetişkin hikâyesi, çeviri, cümle parçaları, saklanacak kelimeler | — |
| memory-engine | Aşama sırası, gün içi ilerleme, tamamlanma yüzdesi, tekrar günü görünümü | story-content |
| practice-ui | Bugün, Hikâye ve Hafıza ekranları; sesli okuma ve pratik etkileşimleri | story-content, memory-engine |
| local-progress | Kullanıcının tamamlanan aşamalarını cihazda saklama ve geri yükleme | memory-engine |

Build order: `story-content` → `memory-engine` → `practice-ui` → `local-progress`

## Tech Stack

Expo SDK 54, React Native, Expo Router, TypeScript, NativeWind, `expo-speech`, `@react-native-async-storage/async-storage`, Expo Haptics ve Vitest kullanılacaktır. İlk sürümde kullanıcı hesabı, veritabanı ve sunucu çağrısı kullanılmayacaktır.

## Commands

```bash
pnpm test
pnpm check
pnpm lint
```

Yerel mobil/web önizlemesi proje servisince otomatik yönetilir. iOS/Android için QR bağlantısı Expo uyumlu cihazdan açılır.

## Project Structure

```text
app/(tabs)/index.tsx       → Bugünün 30 dakikalık dersi
app/(tabs)/stories.tsx     → Hikâye okuma ve dinleme ekranı
app/(tabs)/memory.tsx      → Beş aşamalı hafıza pratiği
app/(tabs)/_layout.tsx     → Alt sekme yapılandırması
components/                → Paylaşılan mobil arayüz bileşenleri
lib/story-memory.ts        → Hikâye verisi, aşama tanımları ve ilerleme hesapları
lib/progress-store.ts      → AsyncStorage ile yerel ilerleme işlemleri
lib/*.test.ts              → Mantık ve yerel saklama testleri
tests/lib/*.test.ts        → Test ortamına bağlı davranış testleri
theme.config.js            → Uygulama renk paleti
app.config.ts              → Dil Hafızası uygulama adı ve özellikleri
```

## Code Style

Veriler saf TypeScript fonksiyonları içinde tutulur; ekranlar bu verileri yalnızca tüketir. Fonksiyon adları fiille başlar, türler açık tanımlanır ve uygulama metinleri Türkçedir.

```ts
export function getCompletionPercent(progress: StoryProgress): number {
  return Math.round((progress.completedStageIds.length / MEMORY_STAGES.length) * 100);
}
```

## Testing Strategy

Hafıza aşaması sırası, yüzde hesabı ve varsayılan ilerleme saf fonksiyon testleri ile kapsanır. Yerel ilerleme kaydının yazma/okuma davranışı için AsyncStorage taklidi kullanılan test eklenir. Her üretim fonksiyonu önce başarısız bir test ile tanımlanır, sonra en küçük uygulama yazılır. Son doğrulamada `pnpm test`, `pnpm check` ve `pnpm lint` çalıştırılır; mobil önizlemede hikâye dinleme, aşama geçişi ve ilerleme kaydı manuel test edilir.

## Boundaries

- **Always:** Yetişkinlere uygun ve A1 düzeyinde içerik kullanmak; tüm düğmeleri erişilebilir etiketlerle ve görünür geri bildirimle sunmak; metin seslendirmesinde `en-US` ve yavaş hız kullanmak; cihazda yalnızca hassas olmayan ilerleme verisi saklamak.
- **Ask first:** Yeni hikâye üretimi için LLM kullanmak, konuşma kaydı/mikrofon erişimi eklemek, bulut senkronizasyonu veya kullanıcı hesabı eklemek, bildirim planlamak.
- **Never:** Kullanıcıdan API anahtarı istemek; gerçek bir ses kaydı yokken bunu ses kaydı gibi sunmak; çocukça içerik kullanmak; güvenlik bilgisi saklamak.

## Success Criteria

1. Uygulama adı **Dil Hafızası** olarak görünür ve iOS/Android dikey kullanım için yapılandırılır.
2. Kullanıcı “Dilek’s Busy Wednesday” hikâyesini İngilizce ve Türkçe satırlarla okuyabilir; Türkçe anlam satırlarını açıp kapatabilir.
3. Kullanıcı “Dinle” düğmesiyle hikâyenin İngilizce metnini yavaş hızda dinler; “Durdur” düğmesi seslendirmeyi keser.
4. Hafıza ekranında beş aşama vardır: Tanış, Parçala, Tekrar Et, Tamamla, Geri Çağır.
5. Kullanıcı aşamaları sırayla tamamlar; tamamlanan aşama, ilerleme yüzdesi ve tekrar önerisi görünür.
6. İlerleme uygulama yeniden açıldığında AsyncStorage üzerinden geri yüklenir.
7. Uygulama TypeScript kontrolü, lint ve test komutlarından hatasız geçer; mobil/web önizlemesinde ana akış çalışır.

## Open Questions

İlk sürümde hikâye tek içerik olarak gelir. Yeni hikâyelerin nasıl seçileceği, dinleme sesinin insan sesine dönüştürülmesi, kullanıcının sesli yanıtlarının değerlendirilmesi ve günlük bildirimler sonraki sürüm kararlarıdır.


## Addendum: Telaffuz Değerlendirme, Ders 4–6 ve Günlük Tekrar

Bu iterasyon, kaydedilmiş telaffuzları sunucu tarafı yapay zekâ ile cümle metniyle karşılaştırarak anında öğretici geri bildirim verme, market alışverişi/yol tarifi/doktor randevusu temalarında Ders 4–6 içerikleri ve ana ekranda dünkü derse dönüş kartı ekleme hedeflerini kapsar.

AI sonucu `score`, `summary`, `whatWentWell`, `focusAreas` ve `nextTry` alanlarından oluşur. Sonuç yaklaşık/pratik amaçlı sunulur; kesin fonetik laboratuvar ölçümü iddia edilmez. Ses kaydı istemciden base64 olarak sunucuya gönderilir, 2 MB ile sınırlandırılır, geçici storage nesnesi olarak kullanılır ve LLM anahtarı istemciye açılmaz. Günlük Tekrar kartının kapatma durumu AsyncStorage'da saklanır.

Kabul kriterleri: Ders 4–6 ders kartlarında görünür; her ders seçilen numaraya göre doğru görseli ve 7–9 cümlelik A1 diyaloğu açar; kayıt sonrası AI değerlendirme aksiyonu yükleniyor/başarı/hata durumlarını gösterir; skor ve düzeltme alanları görünür; Günlük Tekrar kartı dünkü dersi açar ve kapatılınca yerel olarak gizlenir.


## Addendum: Profil İlerlemesi, Günlük Bildirim ve Ders 7–9

Bu iterasyon, telaffuz denemelerini ders numarasına göre cihazda saklayan bir profil ekranı, seçilebilir saatte tekrarlayan yerel Günlük Tekrar bildirimi ve restoran siparişi, otel rezervasyonu, iş görüşmesi temalarında Ders 7–9 içeriklerini kapsar.

Profil ekranı; toplam deneme, ortalama puan, ders bazlı puan çubukları ve en yeni denemelerin tarih/saat, hedef cümle ve puan bilgisini gösterir. AI değerlendirmesi tamamlandığında ilgili `lessonNumber`, cümle, puan ve kısa geri bildirim yerel geçmişe eklenir. Geçmiş cihazda tutulur; sunucuya ayrıca gönderilmez.

Bildirim ayarı kullanıcıdan saat ve dakika alır, iOS/Android bildirim iznini ister, önceki günlük bildirimi iptal edip yeni saat için tekrar eden yerel bildirim planlar. Web önizlemesinde ayar formu açıklama gösterir; gerçek telefon bildirimi yalnızca native platformlarda etkinleşir.

Ders 7: Restaurant Order, Ders 8: Hotel Reservation, Ders 9: Job Interview başlıklarıyla en az 8 başlangıç-orta seviye diyalog satırı ve görsel hafıza görseli bulunur. Ders kartı, hikâye görseli ve ders numarası aynı merkezi veri modelinden beslenir.

Kabul kriterleri: profil sekmesi açılır; geçmiş denemelerden ders bazlı ortalama grafik üretilir; yeni AI sonucu geçmişe yazılır; saat doğrulaması 00:00–23:59 aralığındadır; izin reddi ve web durumu anlaşılır gösterilir; seçilen saat için günlük bildirim planlanır; Ders 7–9 ana ekranda ve hikâye ekranında açılır.


## Addendum: Haftalık Trend, Hedef Puanı, Bildirim Derin Bağlantısı ve Ders 10–12

Bu iterasyon dört kullanıcı akışını kapsar: profil sayfasında son yedi takvim gününün telaffuz puan trendini göstermek, kullanıcının 1–100 arasında hedef puan belirlemesini cihazda saklamak, Günlük Tekrar bildirimine dokunulduğunda bildirim hazırlanırken bilinen önceki derse ait hikâyeyi doğrudan açmak ve havaalanı/telefon görüşmesi/sunum yapma temalarında Ders 10–12 içeriklerini yeni görsellerle eklemek.

Haftalık grafik her takvim günü için bir veri noktası üretir. Deneme olmayan günler boş görünür; sahte veya sabit puan üretilmez. Hedef puan yalnızca 1–100 aralığında tam sayı olarak kabul edilir, boş bırakılırsa hedef tanımlı değil durumu gösterilir ve AsyncStorage'da saklanır. Grafik hedef çizgisini veya hedefe yakınlık metnini aynı kartta gösterir.

Günlük bildirim payload'ı `route`, `type` ve bilinen `lessonNumber` alanlarını taşıyabilir. Bildirim hazırlanırken son çalışılan ders bulunuyorsa rota `/stories?lesson=<lessonNumber>` olarak yazılır; hedef yoksa güvenli biçimde `/` kullanılır. Uygulama açıkken veya soğuk başlangıçta notification response dinleyicisi bu rotayı Expo Router ile açar. Web ortamı native bildirimi çalıştırmaz ve kullanıcıya platform açıklaması gösterir.

Ders 10: Airport Check-in, Ders 11: A Phone Call, Ders 12: Giving a Presentation başlıklarıyla yetişkin günlük yaşamına uygun en az 8 İngilizce/Türkçe diyalog satırı, odak kelimeleri ve görsel hafıza görseli bulunur. Merkezi ders kartı, hikâye ekranı görsel map'i ve ders sayacı aynı ders numarasını kullanır.

Kabul kriterleri: haftalık trend son yedi takvim gününü doğru gruplayıp ortalamaları gösterir; hedef puan kaydedilip yeniden açılışta yüklenir ve geçersiz değerleri reddeder; bildirim payload'ı önceki derse ait deep link taşır ve router response listener bunu açar; Ders 10–12 ana ekranda ve hikâye ekranında doğru görsel ve diyaloglarla açılır; test, TypeScript, lint ve mobil önizleme kontrolleri geçer.
