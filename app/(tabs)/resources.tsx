import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import * as Linking from "expo-linking";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { EXTERNAL_SERVICES, isSafeExternalUrl, type ExternalService } from "@/lib/external-links";

async function openExternalUrl(url: string): Promise<boolean> {
  if (!isSafeExternalUrl(url)) return false;
  if (Platform.OS === "web") return window.open(url, "_blank", "noopener,noreferrer") !== null;
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

export default function ResourcesScreen() {
  const [message, setMessage] = useState<string | null>(null);

  const handleOpen = async (service: ExternalService) => {
    setMessage(null);
    const opened = await openExternalUrl(service.url);
    if (!opened) setMessage(`${service.name} bağlantısı açılamadı. URL'yi daha sonra tekrar deneyebilirsin.`);
  };

  return (
    <ScreenContainer className="px-5 pt-4" edges={["top", "left", "right"]}>
      <FlatList
        data={EXTERNAL_SERVICES}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <View style={styles.topRow}>
              <View style={styles.titleCopy}>
                <Text style={styles.kicker}>DİL HAFIZASI · KAYNAKLAR</Text>
                <Text style={styles.title}>Hizmetlere ayrı git.</Text>
                <Text style={styles.subtitle}>API anahtarını uygulamaya eklemeden, resmi sayfaları güvenle aç.</Text>
              </View>
              <View style={styles.headerIcon}><MaterialIcons name="open-in-new" size={24} color="#FFFDF8" /></View>
            </View>
            <View style={styles.infoCard}>
              <MaterialIcons name="security" size={22} color="#4E8B70" />
              <Text style={styles.infoText}>Anahtarını yalnızca açılan hizmetin resmi panelinde oluştur. Anahtarı buraya veya sohbet mesajlarına yazma.</Text>
            </View>
            <Text style={styles.sectionTitle}>Resmi bağlantılar</Text>
            <Text style={styles.sectionSubtitle}>Kartlara dokununca cihazının tarayıcısında açılır.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.serviceGroup}>
            <View style={styles.serviceCard}>
              <View style={[styles.serviceIcon, { backgroundColor: item.accent }]}>
                <MaterialIcons name={item.icon} size={24} color="#FFFDF8" />
              </View>
              <View style={styles.serviceCopy}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.serviceDescription}>{item.description}</Text>
                <Text style={styles.serviceUrl} numberOfLines={1}>{item.url.replace("https://", "")}</Text>
              </View>
              <AnimatedPressable
                accessibilityLabel={`${item.name} resmi sayfasını aç`}
                onPress={() => void handleOpen(item)}
                style={({ pressed }) => [styles.openButton, { borderColor: item.accent }, pressed && styles.pressed]}
              >
                <MaterialIcons name="arrow-forward" size={19} color={item.accent} />
              </AnimatedPressable>
            </View>
            <View style={styles.guideCard}>
              <View style={styles.guideHeader}>
                <MaterialIcons name="format-list-numbered" size={19} color={item.accent} />
                <Text style={styles.guideTitle}>Nasıl alınır?</Text>
              </View>
              {item.guide.map((step, index) => (
                <View key={`${item.id}-step-${index + 1}`} style={styles.guideStep}>
                  <View style={[styles.stepNumber, { backgroundColor: item.accent }]}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        ListFooterComponent={
          <View>
            {message ? <Text accessibilityLiveRegion="polite" style={styles.errorMessage}>{message}</Text> : null}
            <Text style={styles.footerText}>Bu bağlantılar yalnızca resmi web sayfalarını açar; uygulama herhangi bir API anahtarı saklamaz.</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 30, width: "100%", maxWidth: 980, alignSelf: "center" },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  titleCopy: { flex: 1, paddingRight: 14 },
  kicker: { fontSize: 12, fontWeight: "800", letterSpacing: 1.4, color: "#B64D45", marginBottom: 7 },
  title: { color: "#172A3A", fontSize: 30, lineHeight: 37, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { color: "#5C6873", fontSize: 13.5, lineHeight: 19, marginTop: 5 },
  headerIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#1E3A5F", alignItems: "center", justifyContent: "center" },
  infoCard: { flexDirection: "row", gap: 10, alignItems: "flex-start", backgroundColor: "#EAF2EE", borderRadius: 17, borderWidth: 1, borderColor: "#C9DDCF", padding: 14, marginBottom: 26 },
  infoText: { flex: 1, color: "#416353", fontSize: 12.5, lineHeight: 18 },
  sectionTitle: { color: "#172A3A", fontSize: 21, fontWeight: "800" },
  sectionSubtitle: { color: "#5C6873", fontSize: 13, marginTop: 3, marginBottom: 13 },
  serviceGroup: { marginBottom: 10 },
  serviceCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFDF8", borderRadius: 18, borderWidth: 1, borderColor: "#E5DDCF", padding: 14, marginBottom: 10 },
  serviceIcon: { width: 46, height: 46, borderRadius: 15, alignItems: "center", justifyContent: "center", marginRight: 12 },
  serviceCopy: { flex: 1, minWidth: 0 },
  serviceName: { color: "#172A3A", fontSize: 16, fontWeight: "800" },
  serviceDescription: { color: "#5C6873", fontSize: 12.5, marginTop: 3 },
  serviceUrl: { color: "#9E9587", fontSize: 10.5, marginTop: 6 },
  openButton: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center", marginLeft: 10 },
  guideCard: { backgroundColor: "#F7F3EA", borderRadius: 15, borderWidth: 1, borderColor: "#E5DDCF", padding: 13, marginTop: -2 },
  guideHeader: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 9 },
  guideTitle: { color: "#172A3A", fontSize: 13.5, fontWeight: "800" },
  guideStep: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  stepNumber: { width: 21, height: 21, borderRadius: 8, alignItems: "center", justifyContent: "center", marginRight: 8, marginTop: 1 },
  stepNumberText: { color: "#FFFDF8", fontSize: 10.5, fontWeight: "800" },
  stepText: { flex: 1, color: "#5C6873", fontSize: 12, lineHeight: 17 },
  errorMessage: { color: "#B64D45", backgroundColor: "#F8E1DB", borderRadius: 12, padding: 11, fontSize: 12, lineHeight: 17, marginTop: 5 },
  footerText: { color: "#7B847E", fontSize: 12, lineHeight: 17, textAlign: "center", marginTop: 21, paddingHorizontal: 8 },
  pressed: { transform: [{ scale: 0.96 }], opacity: 0.8 },
});
