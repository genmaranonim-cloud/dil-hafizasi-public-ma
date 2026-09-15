import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { dismissDailyReview, isDailyReviewDue, type DailyReviewState } from "@/lib/daily-review";
import { loadDailyReview, saveDailyReview } from "@/lib/daily-review-store";
import { LESSON_CARDS, STORY, type LessonCard } from "@/lib/story-memory";

const LESSON_IMAGES = {
  morning: require("../../assets/images/lesson-01-dilek-morning.jpg"),
  office: require("../../assets/images/lesson-02-coffee-shop.jpg"),
  memory: require("../../assets/images/lesson-03-weekend-plan.jpg"),
  grocery: require("../../assets/images/lesson-04-grocery.jpg"),
  directions: require("../../assets/images/lesson-05-directions.jpg"),
  doctor: require("../../assets/images/lesson-06-doctor.jpg"),
  restaurant: require("../../assets/images/lesson-07-restaurant.jpg"),
  hotel: require("../../assets/images/lesson-08-hotel.jpg"),
  interview: require("../../assets/images/lesson-09-interview.jpg"),
  airport: require("../../assets/images/lesson-10-airport.jpg"),
  phoneCall: require("../../assets/images/lesson-11-phone-call.jpg"),
  presentation: require("../../assets/images/lesson-12-presentation.jpg"),
} as const;

const DAILY_PLAN = [
  { id: "listen", minutes: "5 dk", title: "Dinle ve alış", detail: "Hikâyeyi yavaşça dinle. Ezberlemeye çalışma.", color: "#E6C88A" },
  { id: "words", minutes: "5 dk", title: "3 kelime seç", detail: "Bugün can, must ve could kalıplarını fark et.", color: "#A9D2C1" },
  { id: "speak", minutes: "10 dk", title: "Sesli tekrar et", detail: "Cümleleri önce kısa parçalar, sonra bütün hâlinde söyle.", color: "#E8AE9A" },
  { id: "pattern", minutes: "5 dk", title: "Kalıbı yakala", detail: "Could you help me, please? cümlesini üç kez söyle.", color: "#B7C8DB" },
  { id: "recall", minutes: "5 dk", title: "Geri çağır", detail: "Hikâyeyi kapatıp bir cümleyi Türkçeden hatırlamaya çalış.", color: "#A9D2C1" },
] as const;

function LessonCardItem({ item, onPress }: { item: LessonCard; onPress: () => void }) {
  const isActive = item.status === "active";

  return (
    <AnimatedPressable
      accessibilityLabel={`Ders ${String(item.lessonNumber).padStart(2, "0")}: ${item.title}`}
      accessibilityState={{ disabled: !isActive }}
      disabled={!isActive}
      onPress={onPress}
      style={({ pressed }) => [styles.lessonCard, !isActive && styles.lessonCardUpcoming, pressed && isActive && styles.pressed]}
    >
      <View style={styles.lessonImageWrap}>
        <Image source={LESSON_IMAGES[item.imageKey]} style={styles.lessonImage} />
        <View style={[styles.lessonNumberBadge, !isActive && styles.lessonNumberBadgeUpcoming]}>
          <Text style={styles.lessonNumberText}>{String(item.lessonNumber).padStart(2, "0")}</Text>
        </View>
        {!isActive ? (
          <View style={styles.lockBadge}>
            <MaterialIcons name="lock-outline" size={15} color="#5C6873" />
          </View>
        ) : null}
      </View>
      <View style={styles.lessonCardBody}>
        <Text style={styles.lessonCardEyebrow}>{isActive ? "ŞİMDİ ÇALIŞ" : "SIRADA"}</Text>
        <Text style={[styles.lessonCardTitle, !isActive && styles.lessonCardTitleUpcoming]} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.lessonCardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        <View style={styles.lessonMetaRow}>
          <Text style={styles.lessonMeta}>{item.duration}</Text>
          <Text style={styles.lessonDot}>·</Text>
          <Text style={styles.lessonMeta} numberOfLines={1}>{item.focus}</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

export default function TodayScreen() {
  const router = useRouter();
  const [dailyReview, setDailyReview] = useState<DailyReviewState | null>(null);

  useEffect(() => {
    void loadDailyReview().then((state) => setDailyReview(state && isDailyReviewDue(state) ? state : null));
  }, []);

  const handleDismissDailyReview = async () => {
    if (!dailyReview) return;
    const nextState = dismissDailyReview(dailyReview);
    setDailyReview(nextState);
    await saveDailyReview(nextState);
  };

  return (
    <ScreenContainer className="px-5 pt-4" edges={["top", "left", "right"]}>
      <FlatList
        data={DAILY_PLAN}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.topRow}>
              <View>
                <Text style={styles.kicker}>DİL HAFIZASI · GÜN 1</Text>
                <Text style={styles.greeting}>Bugün birlikte{`\n`}hikâyeye yerleşiyoruz.</Text>
              </View>
              <View style={styles.dayBadge} accessibilityLabel="Bugünün dersi">
                <Text style={styles.dayBadgeText}>Ders 01</Text>
              </View>
            </View>

            {dailyReview?.visible ? (
              <View style={styles.dailyReviewCard}>
                <View style={styles.dailyReviewIcon}>
                  <MaterialIcons name="history" size={24} color="#A9702D" />
                </View>
                <View style={styles.dailyReviewBody}>
                  <Text style={styles.dailyReviewEyebrow}>GÜNLÜK TEKRAR</Text>
                  <Text style={styles.dailyReviewTitle}>Dünkü derse dön</Text>
                  <Text style={styles.dailyReviewText}>Ders {String(dailyReview.lessonNumber).padStart(2, "0")} · {dailyReview.title}</Text>
                </View>
                <AnimatedPressable
                  accessibilityLabel="Dünkü dersi tekrar aç"
                  onPress={() => router.push({ pathname: "/stories", params: { lesson: String(dailyReview.lessonNumber) } })}
                  style={({ pressed }) => [styles.dailyReviewStart, pressed && styles.pressed]}
                >
                  <MaterialIcons name="play-arrow" size={20} color="#FFFDF8" />
                </AnimatedPressable>
                <AnimatedPressable accessibilityLabel="Günlük Tekrar kartını kapat" onPress={() => void handleDismissDailyReview()} style={({ pressed }) => [styles.dailyReviewClose, pressed && styles.pressed]}>
                  <MaterialIcons name="close" size={17} color="#7B6A52" />
                </AnimatedPressable>
              </View>
            ) : null}

            <View style={styles.heroCard}>
              <Image
                source={LESSON_IMAGES.morning}
                style={styles.heroImage}
                accessibilityLabel="Dilek sabah ofise giderken"
              />
              <View style={styles.heroHeader}>
                <View style={styles.bookIcon}>
                  <MaterialIcons name="auto-stories" size={27} color="#FFFDF8" />
                </View>
                <View style={styles.heroTextGroup}>
                  <Text style={styles.heroEyebrow}>DERS 01 · BUGÜNÜN HİKÂYESİ</Text>
                  <Text style={styles.heroTitle}>{STORY.title}</Text>
                  <Text style={styles.heroSubtitle}>{STORY.turkishTitle}</Text>
                </View>
              </View>
              <Text style={styles.heroDescription}>
                Kısa, gerçekçi ve yetişkin hayatına uygun bir hikâye. Aynı kalıpları duyarak, görerek ve söyleyerek öğren.
              </Text>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MaterialIcons name="schedule" size={16} color="#DDE8F1" />
                  <Text style={styles.metaText}>{STORY.duration}</Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialIcons name="school" size={16} color="#DDE8F1" />
                  <Text style={styles.metaText}>{STORY.level}</Text>
                </View>
              </View>
              <AnimatedPressable
                accessibilityLabel="Ders 01 hikâyesini aç"
                onPress={() => router.push("/stories")}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              >
                <MaterialIcons name="play-circle-filled" size={22} color="#1E3A5F" />
                <Text style={styles.primaryButtonText}>Ders 01&apos;e başla</Text>
              </AnimatedPressable>
            </View>

            <View style={styles.seriesHeader}>
              <View>
                <Text style={styles.sectionTitle}>Ders serisi</Text>
                <Text style={styles.sectionSubtitle}>{STORY.seriesTitle} · Günlük hayatın içinden</Text>
              </View>
              <Text style={styles.seriesCount}>01 / 12</Text>
            </View>
            <FlatList
              data={LESSON_CARDS}
              horizontal
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <LessonCardItem
                  item={item}
                  onPress={() => router.push({ pathname: "/stories", params: { lesson: String(item.lessonNumber) } })}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.lessonRail}
              style={styles.lessonRailList}
            />

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Ders 01&apos;in akışı</Text>
                <Text style={styles.sectionSubtitle}>30 dakika · Küçük adımlar, kalıcı izler</Text>
              </View>
              <Text style={styles.totalTime}>30 dk</Text>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.planRow}>
            <View style={[styles.minuteBadge, { backgroundColor: item.color }]}>
              <Text style={styles.minuteText}>{item.minutes}</Text>
            </View>
            <View style={styles.planText}>
              <Text style={styles.planTitle}>{item.title}</Text>
              <Text style={styles.planDetail}>{item.detail}</Text>
            </View>
            <View style={styles.planIndex}>
              <Text style={styles.planIndexText}>{String(index + 1).padStart(2, "0")}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.memoryPrompt}>
            <View style={styles.memoryPromptIcon}>
              <MaterialIcons name="psychology" size={24} color="#4E8B70" />
            </View>
            <View style={styles.memoryPromptBody}>
              <Text style={styles.memoryPromptTitle}>Ders değil, tanışıklık</Text>
              <Text style={styles.memoryPromptText}>
                Aynı hikâyeye birkaç gün dönmek, cümlelerin kulağına yerleşmesini sağlar.
              </Text>
            </View>
            <AnimatedPressable
              accessibilityLabel="Ders 01 hafıza aşamalarını aç"
              onPress={() => router.push("/memory")}
              style={({ pressed }) => [styles.arrowButton, pressed && styles.pressed]}
            >
              <MaterialIcons name="arrow-forward" size={20} color="#1E3A5F" />
            </AnimatedPressable>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 28, width: "100%", maxWidth: 980, alignSelf: "center" },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 },
  kicker: { fontSize: 12, fontWeight: "800", letterSpacing: 1.4, color: "#B64D45", marginBottom: 7 },
  greeting: { fontSize: 30, lineHeight: 37, fontWeight: "800", color: "#172A3A", letterSpacing: -0.5 },
  dayBadge: { backgroundColor: "#FFFDF8", borderWidth: 1, borderColor: "#DFD8C7", borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8, marginTop: 2 },
  dayBadgeText: { color: "#1E3A5F", fontWeight: "800", fontSize: 13 },
  heroCard: { backgroundColor: "#1E3A5F", borderRadius: 24, padding: 22, marginBottom: 26, shadowColor: "#1E3A5F", shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  heroImage: { width: "100%", height: 142, borderRadius: 17, marginBottom: 18 },
  heroHeader: { flexDirection: "row", alignItems: "center", gap: 14 },
  bookIcon: { width: 50, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#B64D45" },
  heroTextGroup: { flex: 1 },
  heroEyebrow: { color: "#CDE0EF", fontSize: 11, fontWeight: "800", letterSpacing: 1.1, marginBottom: 3 },
  heroTitle: { color: "#FFFDF8", fontSize: 21, lineHeight: 26, fontWeight: "800" },
  heroSubtitle: { color: "#DDE8F1", fontSize: 14, marginTop: 2 },
  heroDescription: { color: "#EAF1F6", fontSize: 15, lineHeight: 22, marginTop: 19, marginBottom: 17 },
  metaRow: { flexDirection: "row", gap: 14, marginBottom: 20 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { color: "#DDE8F1", fontSize: 13, fontWeight: "600" },
  primaryButton: { minHeight: 48, borderRadius: 14, backgroundColor: "#F3DFA7", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  primaryButtonText: { color: "#1E3A5F", fontSize: 16, fontWeight: "800" },
  seriesHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12 },
  seriesCount: { color: "#B64D45", fontSize: 14, fontWeight: "800" },
  lessonRailList: { marginHorizontal: -20, marginBottom: 24 },
  lessonRail: { paddingHorizontal: 20, gap: 11 },
  lessonCard: { width: 230, borderRadius: 18, overflow: "hidden", backgroundColor: "#FFFDF8", borderWidth: 1, borderColor: "#E5DDCF" },
  lessonCardUpcoming: { backgroundColor: "#F1EEE7", borderColor: "#E2DDD3" },
  lessonImageWrap: { height: 105, position: "relative" },
  lessonImage: { width: "100%", height: "100%" },
  lessonNumberBadge: { position: "absolute", top: 10, left: 10, minWidth: 34, height: 28, paddingHorizontal: 9, borderRadius: 10, backgroundColor: "#1E3A5F", alignItems: "center", justifyContent: "center" },
  lessonNumberBadgeUpcoming: { backgroundColor: "#FFFDF8" },
  lessonNumberText: { color: "#FFFDF8", fontSize: 12, fontWeight: "800" },
  lockBadge: { position: "absolute", top: 10, right: 10, width: 28, height: 28, borderRadius: 10, backgroundColor: "#FFFDF8", alignItems: "center", justifyContent: "center" },
  lessonCardBody: { padding: 13 },
  lessonCardEyebrow: { color: "#B64D45", fontSize: 10, fontWeight: "800", letterSpacing: 0.75, marginBottom: 4 },
  lessonCardTitle: { color: "#172A3A", fontSize: 15, fontWeight: "800" },
  lessonCardTitleUpcoming: { color: "#7D858B" },
  lessonCardSubtitle: { color: "#5C6873", fontSize: 12, marginTop: 3 },
  lessonMetaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 10 },
  lessonMeta: { color: "#4E8B70", fontSize: 11, fontWeight: "700", maxWidth: 115 },
  lessonDot: { color: "#B9B1A2", fontSize: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 13 },
  sectionTitle: { color: "#172A3A", fontSize: 21, fontWeight: "800" },
  sectionSubtitle: { color: "#5C6873", fontSize: 13, marginTop: 3 },
  totalTime: { color: "#4E8B70", fontSize: 15, fontWeight: "800" },
  planRow: { backgroundColor: "#FFFDF8", borderRadius: 17, padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E8E1D3" },
  minuteBadge: { width: 50, height: 50, borderRadius: 15, alignItems: "center", justifyContent: "center", marginRight: 13 },
  minuteText: { fontSize: 13, fontWeight: "800", color: "#172A3A" },
  planText: { flex: 1 },
  planTitle: { color: "#172A3A", fontSize: 16, fontWeight: "800", marginBottom: 3 },
  planDetail: { color: "#5C6873", fontSize: 13, lineHeight: 18, paddingRight: 4 },
  planIndex: { width: 28, alignItems: "flex-end" },
  planIndexText: { color: "#C7C0B2", fontSize: 12, fontWeight: "800" },
  memoryPrompt: { flexDirection: "row", alignItems: "center", backgroundColor: "#EAF2EE", borderRadius: 18, padding: 16, marginTop: 12 },
  memoryPromptIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#D3E7D9", alignItems: "center", justifyContent: "center", marginRight: 12 },
  memoryPromptBody: { flex: 1 },
  memoryPromptTitle: { color: "#254D3D", fontSize: 15, fontWeight: "800", marginBottom: 3 },
  memoryPromptText: { color: "#416353", fontSize: 12.5, lineHeight: 17 },
  arrowButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#FFFDF8", alignItems: "center", justifyContent: "center", marginLeft: 10 },
  dailyReviewCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8EBCF", borderRadius: 18, padding: 14, marginBottom: 18, borderWidth: 1, borderColor: "#E9D49E" },
  dailyReviewIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#FFF8E9", alignItems: "center", justifyContent: "center", marginRight: 11 },
  dailyReviewBody: { flex: 1, minWidth: 0 },
  dailyReviewEyebrow: { color: "#A9702D", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  dailyReviewTitle: { color: "#4C3B26", fontSize: 16, fontWeight: "800", marginTop: 2 },
  dailyReviewText: { color: "#806A4A", fontSize: 12.5, marginTop: 3 },
  dailyReviewStart: { width: 39, height: 39, borderRadius: 13, backgroundColor: "#B64D45", alignItems: "center", justifyContent: "center", marginLeft: 8 },
  dailyReviewClose: { width: 27, height: 27, borderRadius: 10, backgroundColor: "#F3DFA7", alignItems: "center", justifyContent: "center", marginLeft: 6, alignSelf: "flex-start" },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.86 },
});
