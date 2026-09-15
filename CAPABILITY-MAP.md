# Capability Map: Dil Hafızası Mobil MVP

| Module id | Responsibility | Depends on |
|---|---|---|
| story-content | A1 düzeyinde yetişkin hikâyesi, İngilizce/Türkçe cümle çiftleri, cümle parçaları ve hatırlama ipuçları | — |
| memory-engine | Beş aşamalı pratik sırası, aşama kilitleri, tamamlanma ve yüzde hesabı | story-content |
| practice-ui | Bugün, Hikâye ve Hafıza sekmeleri; dinleme ve kullanıcı etkileşimleri | story-content, memory-engine |
| local-progress | Aşama tamamlanma verisinin cihazda saklanması ve geri yüklenmesi | memory-engine |

Build order: `story-content` → `memory-engine` → `practice-ui` → `local-progress`

Bu harita ilk sürümün modül sınırlarını sabitler. Hikâye üretimi, konuşma kaydı değerlendirmesi, bildirimler ve cihazlar arası senkronizasyon kapsam dışındadır.
