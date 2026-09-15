export type ExternalService = {
  id: "openai" | "gemini" | "elevenlabs";
  name: string;
  description: string;
  url: string;
  guide: readonly string[];
  icon: "auto-awesome" | "psychology" | "graphic-eq";
  accent: string;
};

export const EXTERNAL_SERVICES: readonly ExternalService[] = [
  {
    id: "openai",
    name: "OpenAI",
    description: "API anahtarı ve platform ayarları",
    url: "https://platform.openai.com/api-keys",
    guide: [
      "Resmi sayfayı aç ve OpenAI hesabınla giriş yap.",
      "Dashboard içinden API Keys bölümüne git ve Create secret key seç.",
      "Anahtara bir ad ver, oluştur ve gösterildiğinde güvenli bir yere kopyala.",
      "Anahtarı uygulama koduna veya Git'e koyma; sunucu secret'ı ya da ortam değişkeni kullan.",
    ],
    icon: "auto-awesome",
    accent: "#1E3A5F",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Google AI Studio API anahtarı",
    url: "https://aistudio.google.com/app/apikey",
    guide: [
      "AI Studio sayfasını aç ve Google hesabınla giriş yap.",
      "Bir proje seç veya gerekirse Google Cloud projesini içe aktar.",
      "Create API key düğmesine dokun, projeyi seç ve anahtarı oluştur.",
      "Anahtarı gizli tut; Gemini API ile sınırlandır ve uygulama içine gömmek yerine secret olarak sakla.",
    ],
    icon: "psychology",
    accent: "#4E8B70",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description: "Ses ve telaffuz API anahtarı",
    url: "https://elevenlabs.io/app/settings/api-keys",
    guide: [
      "Resmi sayfayı aç ve ElevenLabs hesabına giriş yap veya hesap oluştur.",
      "API Keys / Settings bölümünde yeni anahtar oluşturma seçeneğini aç.",
      "Anahtara açıklayıcı bir ad ver; sunulan izin ve kullanım limitlerini ihtiyacına göre daralt.",
      "Anahtarı güvenli bir secret olarak sakla ve istemci uygulamasına doğrudan yazma.",
    ],
    icon: "graphic-eq",
    accent: "#B64D45",
  },
];

export function getExternalService(id: string): ExternalService | undefined {
  return EXTERNAL_SERVICES.find((service) => service.id === id);
}

export function isSafeExternalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}
