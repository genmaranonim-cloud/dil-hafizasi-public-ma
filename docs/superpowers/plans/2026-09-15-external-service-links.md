# Harici Hizmetleri Ayrı Sekmede Açılabilir Bağlantılar

## Amaç

API anahtarını uygulamaya eklemeden, kullanıcıya OpenAI, Google Gemini ve ElevenLabs resmi sayfalarını ayrı bir **Kaynaklar** sekmesinden açma imkânı vermek.

## Tasarım

Hizmet adı, kısa kullanım amacı, API anahtarının kullanıcı tarafından alınabileceği resmi URL ve güvenlik açıklaması tek bir TypeScript veri modelinde tutulur. Kaynaklar ekranındaki her kart `Linking.openURL` ile cihaz tarayıcısını veya web ortamında yeni sekmeyi açar. API anahtarları uygulamada saklanmaz ve kullanıcıdan anahtarı uygulamaya yapıştırması istenmez.

## Kabul ölçütleri

OpenAI, Google Gemini ve ElevenLabs kartları görünür; her kartta erişilebilir bir açma düğmesi bulunur; geçersiz URL durumunda kullanıcıya hata mesajı gösterilir; sekme iOS/Android ve web önizlemesinde açılır; test, TypeScript, lint ve mobil önizleme kontrolleri geçer.
