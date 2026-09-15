import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Platform, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { getBadgeCollection, type BadgeCollectionItem } from "@/lib/learning-motivation";
import { loadPronunciationHistory } from "@/lib/pronunciation-history";
import { useThemeContext } from "@/lib/theme-provider";
import { BADGE_THEMES, buildBadgeCardSvg, buildBadgeShareText, getBadgeTheme, type BadgeThemeId } from "@/lib/badge-share";

function formatBadgeDate(value: string | null): string {
  if (!value) return "Henüz kazanılmadı";
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export default function BadgesScreen() {
  const router = useRouter();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";
  const [badges, setBadges] = useState<BadgeCollectionItem[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<BadgeCollectionItem | null>(null);
  const [shareMessage, setShareMessage] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [badgeTheme, setBadgeTheme] = useState<BadgeThemeId>("ocean");

  useFocusEffect(
    useCallback(() => {
      void loadPronunciationHistory().then((history) => {
        const collection = getBadgeCollection(history);
        setBadges(collection);
        setSelectedBadge((current) => current && collection.some((badge) => badge.id === current.id) ? collection.find((badge) => badge.id === current.id) ?? current : collection.find((badge) => badge.earned) ?? null);
      });
    }, []),
  );

  const handleShareBadge = async () => {
    if (!selectedBadge?.earned || !selectedBadge.earnedAt) {
      setShareMessage("Paylaşmak için kazanılmış bir rozet seç.");
      return;
    }
    const input = { title: selectedBadge.title, description: selectedBadge.description, earnedAt: selectedBadge.earnedAt, displayName, theme: badgeTheme };
    const text = buildBadgeShareText(input);
    try {
      if (Platform.OS === "web") {
        const svg = buildBadgeCardSvg(input);
        const file = new File([svg], `dil-hafizasi-${selectedBadge.id}.svg`, { type: "image/svg+xml" });
        if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ title: `Rozet: ${selectedBadge.title}`, text, files: [file] });
          setShareMessage("Başarı kartın paylaşım menüsünde açıldı.");
        } else if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          setShareMessage("Kart açıklaması panoya kopyalandı; kart önizlemesini ekran görüntüsü olarak paylaşabilirsin.");
        } else {
          throw new Error("Bu tarayıcı paylaşım özelliğini desteklemiyor.");
        }
      } else {
        await Share.share({ title: `Rozet: ${selectedBadge.title}`, message: text });
        setShareMessage("Başarı kartının paylaşım metni açıldı.");
      }
    } catch (error) {
      if (error && typeof error === "object" && "name" in error && error.name === "AbortError") return;
      setShareMessage(error instanceof Error ? error.message : "Başarı kartı paylaşılamadı.");
    }
  };

  return (
    <ScreenContainer className="px-5 pt-4" edges={["top", "left", "right"]}>
      <FlatList
        data={badges}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <AnimatedPressable accessibilityLabel="Profile dön" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
              <MaterialIcons name="arrow-back" size={18} color={isDark ? "#E8C887" : "#1E3A5F"} />
              <Text style={[styles.backText, isDark && styles.darkText]}>Profile dön</Text>
            </AnimatedPressable>
            <Text style={[styles.kicker, isDark && styles.darkAccent]}>DİL HAFIZASI · KOLEKSİYON</Text>
            <Text style={[styles.title, isDark && styles.darkText]}>Başarılarını gör.</Text>
            <Text style={[styles.subtitle, isDark && styles.darkMuted]}>Her rozet, sesini kullanarak attığın küçük ama gerçek bir adımı hatırlatır.</Text>
            <View style={[styles.summaryCard, isDark && styles.darkCard]}>
              <View style={styles.summaryIcon}><MaterialIcons name="workspace-premium" size={24} color="#FFFDF8" /></View>
              <View style={styles.summaryCopy}>
                <Text style={[styles.summaryTitle, isDark && styles.darkText]}>Rozet koleksiyonun</Text>
                <Text style={[styles.summaryText, isDark && styles.darkMuted]}>{badges.filter((badge) => badge.earned).length} / {badges.length} rozet kazanıldı</Text>
              </View>
            </View>
            {selectedBadge ? <View style={styles.shareSection}>
              <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Paylaşılabilir başarı kartı</Text>
              <View style={[styles.shareCard, { backgroundColor: getBadgeTheme(badgeTheme).background }, isDark && styles.shareCardDark]}>
                <View style={styles.shareCardIcon}><Text style={styles.shareCardIconText}>★</Text></View>
                <Text style={styles.shareCardKicker}>DİL HAFIZASI · BAŞARI</Text>
                <Text style={styles.shareCardTitle}>{selectedBadge.title}</Text>
                <Text style={styles.shareCardDescription}>{selectedBadge.description}</Text>
                <Text style={styles.shareCardDate}>{displayName.trim() ? `${displayName.trim()} · ` : ""}{selectedBadge.earnedAt ? `Kazanıldı · ${formatBadgeDate(selectedBadge.earnedAt)}` : "Rozet henüz kazanılmadı"}</Text>
              </View>
              <Text style={[styles.customizationLabel, isDark && styles.darkMuted]}>Kartta görünecek ad</Text>
              <TextInput accessibilityLabel="Başarı kartı adı" value={displayName} onChangeText={setDisplayName} placeholder="Adını yaz (isteğe bağlı)" placeholderTextColor={isDark ? "#8FA5B8" : "#9A958B"} style={[styles.nameInput, isDark && styles.nameInputDark]} maxLength={40} />
              <Text style={[styles.customizationLabel, isDark && styles.darkMuted]}>Renk teması</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themeOptions} accessibilityLabel="Başarı kartı renk teması">
                {BADGE_THEMES.map((theme) => <AnimatedPressable key={theme.id} accessibilityLabel={`${theme.label} renk teması`} accessibilityState={{ selected: badgeTheme === theme.id }} onPress={() => setBadgeTheme(theme.id)} style={({ pressed }) => [styles.themeOption, { backgroundColor: theme.background }, badgeTheme === theme.id && styles.themeOptionSelected, pressed && styles.pressed]}><Text style={styles.themeOptionText}>{theme.label}</Text></AnimatedPressable>)}
              </ScrollView>
              <AnimatedPressable accessibilityLabel="Başarı kartını paylaş" onPress={() => void handleShareBadge()} style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}>
                <MaterialIcons name="ios-share" size={17} color="#FFFDF8" />
                <Text style={styles.shareButtonText}>Başarı kartını paylaş</Text>
              </AnimatedPressable>
              {shareMessage ? <Text accessibilityLiveRegion="polite" style={[styles.shareMessage, isDark && styles.darkMuted]}>{shareMessage}</Text> : null}
            </View> : null}
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Tüm rozetler</Text>
          </View>
        }
        renderItem={({ item }) => (
          <AnimatedPressable onPress={() => item.earned ? setSelectedBadge(item) : undefined} style={({ pressed }) => [styles.badgeCard, isDark && styles.darkCard, item.earned && styles.badgeCardEarned, pressed && styles.pressed]} accessibilityLabel={`${item.title} rozeti ${item.earned ? "kazanıldı" : "kilitli"}`}>
            <View style={[styles.badgeIcon, item.earned && styles.badgeIconEarned]}><MaterialIcons name={item.icon} size={24} color={item.earned ? "#FFFDF8" : isDark ? "#8FA5B8" : "#9A958B"} /></View>
            <View style={styles.badgeCopy}>
              <View style={styles.badgeTitleRow}>
                <Text style={[styles.badgeTitle, isDark && styles.darkText]}>{item.title}</Text>
                {item.earned ? <MaterialIcons name="check-circle" size={18} color="#4E8B70" /> : <MaterialIcons name="lock-outline" size={17} color={isDark ? "#8FA5B8" : "#9A958B"} />}
              </View>
              <Text style={[styles.badgeDescription, isDark && styles.darkMuted]}>{item.description}</Text>
              <Text style={[styles.badgeDate, item.earned && styles.badgeDateEarned, isDark && styles.darkMuted]}>{item.earned ? `Kazanıldı · ${formatBadgeDate(item.earnedAt)}` : formatBadgeDate(item.earnedAt)}</Text>
            </View>
          </AnimatedPressable>
        )}
        ListEmptyComponent={<Text style={[styles.emptyText, isDark && styles.darkMuted]}>Rozetlerin hazırlanıyor.</Text>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 30, width: "100%", maxWidth: 760, alignSelf: "center" },
  backButton: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 38, alignSelf: "flex-start", marginBottom: 23 },
  backText: { color: "#1E3A5F", fontSize: 13, fontWeight: "800" },
  kicker: { color: "#B64D45", fontSize: 11, fontWeight: "900", letterSpacing: 1.3, marginBottom: 7 },
  title: { color: "#172A3A", fontSize: 30, lineHeight: 37, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { color: "#5C6873", fontSize: 13.5, lineHeight: 19, marginTop: 5, maxWidth: 560 },
  summaryCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#1E3A5F", borderRadius: 18, padding: 15, marginTop: 22, marginBottom: 26 },
  summaryIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#B64D45", alignItems: "center", justifyContent: "center", marginRight: 12 },
  summaryCopy: { flex: 1 },
  summaryTitle: { color: "#FFFDF8", fontSize: 17, fontWeight: "900" },
  summaryText: { color: "#D6E1EE", fontSize: 12.5, marginTop: 3 },
  sectionTitle: { color: "#172A3A", fontSize: 20, fontWeight: "800", marginBottom: 12 },
  shareSection: { marginBottom: 25 },
  shareCard: { backgroundColor: "#1E3A5F", borderRadius: 20, minHeight: 225, padding: 22, marginBottom: 10 },
  shareCardDark: { backgroundColor: "#14283B" },
  shareCardIcon: { width: 55, height: 55, borderRadius: 17, backgroundColor: "#B64D45", alignItems: "center", justifyContent: "center", marginBottom: 18 },
  shareCardIconText: { color: "#FFFDF8", fontSize: 31, fontWeight: "900" },
  shareCardKicker: { color: "#F3DFA7", fontSize: 10.5, fontWeight: "900", letterSpacing: 1.2 },
  shareCardTitle: { color: "#FFFDF8", fontSize: 27, lineHeight: 33, fontWeight: "900", marginTop: 8 },
  shareCardDescription: { color: "#E7F0F4", fontSize: 13, lineHeight: 18, marginTop: 5 },
  shareCardDate: { color: "#F3DFA7", fontSize: 12, fontWeight: "800", marginTop: 15 },
  customizationLabel: { color: "#5C6873", fontSize: 12, fontWeight: "800", marginTop: 8, marginBottom: 5 },
  nameInput: { minHeight: 42, borderRadius: 11, borderWidth: 1, borderColor: "#E5DDCF", backgroundColor: "#FFFDF8", paddingHorizontal: 12, color: "#172A3A", fontSize: 13 },
  nameInputDark: { backgroundColor: "#203248", borderColor: "#375068", color: "#F6F1E6" },
  themeOptions: { gap: 7, paddingBottom: 2 },
  themeOption: { minHeight: 34, borderRadius: 10, paddingHorizontal: 12, justifyContent: "center", borderWidth: 2, borderColor: "transparent" },
  themeOptionSelected: { borderColor: "#F3DFA7" },
  themeOptionText: { color: "#FFFDF8", fontSize: 11.5, fontWeight: "800" },
  shareButton: { minHeight: 44, borderRadius: 12, backgroundColor: "#1E3A5F", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  shareButtonText: { color: "#FFFDF8", fontSize: 13, fontWeight: "800" },
  shareMessage: { color: "#4E8B70", fontSize: 12, lineHeight: 17, marginTop: 8 },
  badgeCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFDF8", borderRadius: 17, borderWidth: 1, borderColor: "#E5DDCF", padding: 14, marginBottom: 10 },
  badgeCardEarned: { backgroundColor: "#FFF8E7", borderColor: "#E9D49E" },
  darkCard: { backgroundColor: "#203248", borderColor: "#375068" },
  badgeIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: "#E4E1D9", alignItems: "center", justifyContent: "center", marginRight: 13 },
  badgeIconEarned: { backgroundColor: "#B64D45" },
  badgeCopy: { flex: 1 },
  badgeTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  badgeTitle: { color: "#172A3A", fontSize: 16, fontWeight: "900" },
  badgeDescription: { color: "#5C6873", fontSize: 12.5, lineHeight: 17, marginTop: 3 },
  badgeDate: { color: "#8C877D", fontSize: 11.5, marginTop: 6 },
  badgeDateEarned: { color: "#4E8B70", fontWeight: "800" },
  emptyText: { color: "#5C6873", textAlign: "center", paddingVertical: 20 },
  darkText: { color: "#F6F1E6" },
  darkMuted: { color: "#B9C4D0" },
  darkAccent: { color: "#EE867E" },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.86 },
});
