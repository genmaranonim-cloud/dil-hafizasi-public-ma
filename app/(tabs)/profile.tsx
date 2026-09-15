import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect, useRouter } from "expo-router";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Platform, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";

import { startOAuthLogin } from "@/constants/oauth";
import { ScreenContainer } from "@/components/screen-container";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { CelebrationOverlay } from "@/components/ui/celebration-overlay";
import { useAuth } from "@/hooks/use-auth";
import { cancelDailyReminder, scheduleDailyReminder } from "@/lib/daily-reminder-native";
import { formatReminderTime, parseReminderTime } from "@/lib/daily-reminder";
import { clearDailyReminderTime, loadDailyReminderTime, saveDailyReminderTime } from "@/lib/daily-reminder-store";
import { loadDailyReview } from "@/lib/daily-review-store";
import { createBackup, parseBackup, restoreBackup, serializeBackup } from "@/lib/backup";
import { loadCloudSyncBaseline, mergeBackupPayloads, saveCloudSyncBaseline } from "@/lib/cloud-sync";
import { clearTargetScore, loadTargetScore, parseTargetScore, saveTargetScore } from "@/lib/profile-goals";
import { loadStoryProgress } from "@/lib/progress-store";
import { buildProgressRows } from "@/lib/progress-summary";
import {
  getRecentAttempts,
  loadPronunciationHistory,
  summarizeWeeklyPronunciation,
  summarizePronunciationHistory,
  type PronunciationAttempt,
} from "@/lib/pronunciation-history";
import { buildProgressShareText } from "@/lib/share-progress";
import { MEMORY_STAGES } from "@/lib/story-memory";
import { buildScoreTimeline, calculateCurrentStreak, getWeeklyBadges } from "@/lib/learning-motivation";
import { buildLessonComparisonTimeline, summarizeLessonComparison } from "@/lib/lesson-comparison";
import { getCelebrationEvent, type CelebrationEvent } from "@/lib/celebration";
import { maybeNotifyStreakAtRisk, requestBrowserStreakNotificationPermission } from "@/lib/browser-streak-notification";
import { isStreakNotificationSnoozed, snoozeStreakNotificationForToday } from "@/lib/streak-notification";
import { loadStreakNotificationSchedule, loadStreakNotificationTime, saveStreakNotificationSchedule, type StreakNotificationSchedule } from "@/lib/streak-notification-time";
import { loadThemePreference } from "@/lib/theme-preference";
import { useThemeContext } from "@/lib/theme-provider";
import { trpc } from "@/lib/trpc";
import { PUBLIC_WEB_EDITION } from "@/lib/public-edition";

function formatAttemptDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tarih bilinmiyor";
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

type TimelineRange = 7 | 30 | "all";

function timelineRangeLabel(range: TimelineRange): string {
  return range === "all" ? "Tüm zamanlar" : `Son ${range} gün`;
}

function shouldShowTimelineLabel(index: number, length: number): boolean {
  if (length <= 7) return true;
  const step = Math.max(1, Math.ceil(length / 6));
  return index === 0 || index === length - 1 || index % step === 0;
}

function buildSvgLinePoints(scores: readonly (number | null)[]): string {
  const available = scores.filter((score): score is number => score !== null);
  if (available.length < 2) return "";
  let previous = available[0];
  return scores.map((score, index) => {
    previous = score ?? previous;
    const x = 12 + (index * 296) / Math.max(1, scores.length - 1);
    const y = 108 - (previous * 0.92);
    return `${x},${Math.max(10, Math.min(108, y))}`;
  }).join(" ");
}

export default function ProfileScreen() {
  const router = useRouter();
  const { colorScheme, preference, setColorScheme } = useThemeContext();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth({ autoFetch: !PUBLIC_WEB_EDITION });
  const cloudSnapshot = trpc.sync.get.useQuery(undefined, { enabled: isAuthenticated && !PUBLIC_WEB_EDITION, retry: false });
  const saveCloudSnapshot = trpc.sync.save.useMutation();
  const isDark = colorScheme === "dark";
  const [history, setHistory] = useState<PronunciationAttempt[]>([]);
  const [timeValue, setTimeValue] = useState("20:00");
  const [reminderMessage, setReminderMessage] = useState("Her gün belirlediğin saatte hatırlatacağız.");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [targetInput, setTargetInput] = useState("");
  const [targetScore, setTargetScore] = useState<number | null>(null);
  const [targetMessage, setTargetMessage] = useState("Henüz hedef belirlemedin.");
  const [completedStageCount, setCompletedStageCount] = useState(0);
  const [backupMessage, setBackupMessage] = useState("Yedek dosyası yalnızca bu cihazdaki öğrenme verilerini içerir.");
  const [shareMessage, setShareMessage] = useState("");
  const [timelineRange, setTimelineRange] = useState<TimelineRange>(7);
  const [lessonFilter, setLessonFilter] = useState<number | "all">("all");
  const [comparisonFirstLesson, setComparisonFirstLesson] = useState(1);
  const [comparisonSecondLesson, setComparisonSecondLesson] = useState(2);
  const [celebrationEvent, setCelebrationEvent] = useState<CelebrationEvent | null>(null);
  const [streakNotificationMessage, setStreakNotificationMessage] = useState("Serin risk altındaysa tarayıcıdan nazikçe haber verelim.");
  const [streakSnoozed, setStreakSnoozed] = useState(false);
  const [weekdayStreakTimeValue, setWeekdayStreakTimeValue] = useState("20:00");
  const [weekendStreakTimeValue, setWeekendStreakTimeValue] = useState("10:00");
  const [streakSchedule, setStreakSchedule] = useState<StreakNotificationSchedule | null>(null);
  const [cloudSyncMessage, setCloudSyncMessage] = useState("Giriş yaptığında ilerlemen cihazların arasında güvenle eşitlenir.");
  const [isSyncing, setIsSyncing] = useState(false);
  const previousStreakRef = useRef<number | null>(null);
  const previousBadgeIdsRef = useRef<string[] | null>(null);
  const initialSyncUserIdRef = useRef<number | null>(null);
  const dismissCelebration = useCallback(() => setCelebrationEvent(null), []);

  const refreshProfile = useCallback(async () => {
    const [savedHistory, savedTarget, savedProgress] = await Promise.all([
      loadPronunciationHistory(),
      loadTargetScore(),
      loadStoryProgress(),
    ]);
    setHistory(savedHistory);
    setTargetScore(savedTarget);
    setTargetInput(savedTarget === null ? "" : String(savedTarget));
    setTargetMessage(savedTarget === null ? "Henüz hedef belirlemedin." : `Hedefin: ${savedTarget}/100`);
    setCompletedStageCount(savedProgress.completedStageIds.length);
    const nextStreak = calculateCurrentStreak(savedHistory);
    const nextBadgeIds = getWeeklyBadges(savedHistory).filter((badge) => badge.earned).map((badge) => badge.id);
    if (previousStreakRef.current !== null && previousBadgeIdsRef.current !== null) {
      const event = getCelebrationEvent(previousStreakRef.current, nextStreak, previousBadgeIdsRef.current, nextBadgeIds);
      if (event) setCelebrationEvent(event);
    }
    previousStreakRef.current = nextStreak;
    previousBadgeIdsRef.current = nextBadgeIds;
  }, []);

  const synchronizeCloud = useCallback(async (remotePayload?: string) => {
    if (!isAuthenticated || !user || isSyncing) return;
    setIsSyncing(true);
    setCloudSyncMessage("İlerleme verilerin güvenli biçimde eşitleniyor…");
    try {
      const local = await createBackup();
      const remote = remotePayload ? parseBackup(remotePayload) : null;
      const base = await loadCloudSyncBaseline(user.id);
      const merged = remote ? mergeBackupPayloads(local, remote, base) : local;
      const current = { ...merged, exportedAt: new Date().toISOString() };

      await restoreBackup(serializeBackup(current));
      const restoredTheme = await loadThemePreference();
      if (restoredTheme) await setColorScheme(restoredTheme);
      await saveCloudSnapshot.mutateAsync({ payload: serializeBackup(current) });
      await saveCloudSyncBaseline(user.id, current);
      await refreshProfile();
      setCloudSyncMessage(remote ? "Cihazlardaki ilerlemen birleştirildi ve buluta kaydedildi." : "Bu cihazdaki ilerlemen ilk kez buluta kaydedildi.");
    } catch (error) {
      setCloudSyncMessage(error instanceof Error ? `Senkronizasyon tamamlanamadı: ${error.message}` : "Senkronizasyon tamamlanamadı. Bağlantını kontrol edip tekrar dene.");
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated, isSyncing, refreshProfile, saveCloudSnapshot, setColorScheme, user]);

  useEffect(() => {
    if (!isAuthenticated || !user || !cloudSnapshot.isSuccess) return;
    if (initialSyncUserIdRef.current === user.id) return;
    initialSyncUserIdRef.current = user.id;
    void synchronizeCloud(cloudSnapshot.data.snapshot?.payload);
  }, [cloudSnapshot.data, cloudSnapshot.isSuccess, isAuthenticated, synchronizeCloud, user]);

  useFocusEffect(
    useCallback(() => {
      void refreshProfile();
    }, [refreshProfile]),
  );

  useEffect(() => {
    void Promise.all([loadStreakNotificationSchedule(), loadStreakNotificationTime()]).then(([savedSchedule, legacyTime]) => {
      const schedule = savedSchedule ?? (legacyTime ? { weekday: legacyTime, weekend: legacyTime } : null);
      if (!schedule) return;
      setStreakSchedule(schedule);
      setWeekdayStreakTimeValue(formatReminderTime(schedule.weekday));
      setWeekendStreakTimeValue(formatReminderTime(schedule.weekend));
    });
    void isStreakNotificationSnoozed().then(setStreakSnoozed);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" || history.length === 0 || !streakSchedule) return;
    const checkNotification = () => {
      void maybeNotifyStreakAtRisk(history, new Date(), streakSchedule).then((result) => {
        if (result === "shown") setStreakNotificationMessage("Bugünkü serini koruman için bildirim gönderildi.");
      });
    };
    checkNotification();
    const timer = setInterval(checkNotification, 30_000);
    return () => clearInterval(timer);
  }, [history, streakSchedule]);

  useEffect(() => {
    void loadDailyReminderTime().then((savedTime) => {
      if (!savedTime) return;
      setTimeValue(formatReminderTime(savedTime));
      setReminderEnabled(true);
      setReminderMessage(`Günlük tekrar ${formatReminderTime(savedTime)} için ayarlı.`);
    });
  }, []);

  const summaries = useMemo(() => summarizePronunciationHistory(history), [history]);
  const weeklyTrend = useMemo(() => summarizeWeeklyPronunciation(history), [history]);
  const recentAttempts = useMemo(() => getRecentAttempts(history, 12), [history]);
  const averageScore = history.length === 0 ? null : Math.round(history.reduce((total, item) => total + item.score, 0) / history.length);
  const progressRows = useMemo(
    () => buildProgressRows({ completedStages: completedStageCount, totalStages: MEMORY_STAGES.length, attemptedLessons: summaries.length, totalLessons: 12, averageScore, targetScore }),
    [averageScore, completedStageCount, summaries.length, targetScore],
  );
  const currentStreak = useMemo(() => calculateCurrentStreak(history), [history]);
  const weeklyBadges = useMemo(() => getWeeklyBadges(history), [history]);
  const lessonOptions = useMemo(() => Array.from({ length: 12 }, (_, index) => index + 1), []);
  const chartHistory = useMemo(() => lessonFilter === "all" ? history : history.filter((attempt) => attempt.lessonNumber === lessonFilter), [history, lessonFilter]);
  const scoreTimeline = useMemo(() => buildScoreTimeline(chartHistory, new Date(), timelineRange), [chartHistory, timelineRange]);
  const comparisonTimeline = useMemo(() => buildLessonComparisonTimeline(history, comparisonFirstLesson, comparisonSecondLesson, new Date(), timelineRange), [comparisonFirstLesson, comparisonSecondLesson, history, timelineRange]);
  const scorePoints = useMemo(() => {
    const available = scoreTimeline.filter((point) => point.averageScore !== null);
    if (available.length < 2) return "";
    return buildSvgLinePoints(scoreTimeline.map((point) => point.averageScore));
  }, [scoreTimeline]);
  const comparisonFirstPoints = useMemo(() => buildSvgLinePoints(comparisonTimeline.map((point) => point.firstScore)), [comparisonTimeline]);
  const comparisonSecondPoints = useMemo(() => buildSvgLinePoints(comparisonTimeline.map((point) => point.secondScore)), [comparisonTimeline]);
  const comparisonSummary = useMemo(() => summarizeLessonComparison(comparisonTimeline), [comparisonTimeline]);

  const handleSaveTarget = async () => {
    const parsedTarget = parseTargetScore(targetInput);
    if (parsedTarget === null) {
      setTargetMessage("Hedef puan 1–100 arasında tam sayı olmalı.");
      return;
    }
    await saveTargetScore(parsedTarget);
    setTargetScore(parsedTarget);
    setTargetInput(String(parsedTarget));
    setTargetMessage(`Hedefin: ${parsedTarget}/100`);
  };

  const handleFirstLessonChange = (lessonNumber: number) => {
    if (lessonNumber === comparisonSecondLesson) setComparisonSecondLesson(comparisonFirstLesson);
    setComparisonFirstLesson(lessonNumber);
  };

  const handleSecondLessonChange = (lessonNumber: number) => {
    if (lessonNumber === comparisonFirstLesson) setComparisonFirstLesson(comparisonSecondLesson);
    setComparisonSecondLesson(lessonNumber);
  };

  const handleLogin = () => {
    void startOAuthLogin();
  };

  const handleLogout = async () => {
    await logout();
    initialSyncUserIdRef.current = null;
    setCloudSyncMessage("Bu cihazdaki veriler korunuyor. Yeniden giriş yaptığında bulutla eşitleyebilirsin.");
  };

  const handleManualCloudSync = async () => {
    const result = await cloudSnapshot.refetch();
    if (result.error) {
      setCloudSyncMessage("Bulut verisine erişilemedi. Bağlantını kontrol edip tekrar dene.");
      return;
    }
    await synchronizeCloud(result.data?.snapshot?.payload);
  };

  const handleClearTarget = async () => {
    await clearTargetScore();
    setTargetScore(null);
    setTargetInput("");
    setTargetMessage("Henüz hedef belirlemedin.");
  };

  const handleEnableStreakNotifications = async () => {
    const weekday = parseReminderTime(weekdayStreakTimeValue);
    const weekend = parseReminderTime(weekendStreakTimeValue);
    if (!weekday || !weekend) {
      setStreakNotificationMessage("İki saati de 24 saat formatında yaz: hafta içi 20:00, hafta sonu 10:00.");
      return;
    }
    const permission = await requestBrowserStreakNotificationPermission();
    if (permission !== "granted") {
      setStreakNotificationMessage(permission === "denied" ? "Bildirim izni kapalı. Safari ayarlarından bu siteye bildirim izni verebilirsin." : "Bu tarayıcı bildirim iznini desteklemiyor.");
      return;
    }
    const schedule = { weekday, weekend };
    await saveStreakNotificationSchedule(schedule);
    setStreakSchedule(schedule);
    setWeekdayStreakTimeValue(formatReminderTime(weekday));
    setWeekendStreakTimeValue(formatReminderTime(weekend));
    setStreakNotificationMessage(`Bildirim açık; hafta içi ${formatReminderTime(weekday)}, hafta sonu ${formatReminderTime(weekend)} saatinde hatırlatacağız.`);
  };

  const handleSnoozeStreakNotification = async () => {
    await snoozeStreakNotificationForToday();
    setStreakSnoozed(true);
    setStreakNotificationMessage("Bugünkü streak hatırlatması ertelendi; yarın yeniden kontrol edeceğiz.");
  };

  const handleScheduleReminder = async () => {
    const parsedTime = parseReminderTime(timeValue);
    if (!parsedTime) {
      setReminderMessage("Saati 24 saat formatında yaz: 08:30.");
      setReminderEnabled(false);
      return;
    }

    const lastReview = await loadDailyReview();
    const result = await scheduleDailyReminder(parsedTime, lastReview ? { lessonNumber: lastReview.lessonNumber, title: lastReview.title } : null);
    if (result.status === "scheduled") {
      setReminderEnabled(true);
      await saveDailyReminderTime(parsedTime);
      setReminderMessage(`Günlük tekrar ${formatReminderTime(parsedTime)} için ayarlandı.`);
    } else if (result.status === "denied") {
      setReminderEnabled(false);
      setReminderMessage("Bildirim izni verilmedi. Telefon ayarlarından izin verip tekrar deneyebilirsin.");
    } else {
      setReminderEnabled(false);
      setReminderMessage("Telefon bildirimleri yalnızca iOS ve Android uygulamasında çalışır.");
    }
  };

  const handleDisableReminder = async () => {
    await cancelDailyReminder();
    await clearDailyReminderTime();
    setReminderEnabled(false);
    setReminderMessage("Günlük tekrar bildirimi kapatıldı.");
  };

  const handleExportBackup = async () => {
    if (Platform.OS !== "web") {
      setBackupMessage("Yedek dosyası dışa aktarma Safari/Chrome sürümünde kullanılabilir.");
      return;
    }
    const payload = await createBackup();
    const blob = new Blob([serializeBackup(payload)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `dil-hafizasi-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
    setBackupMessage("Yedek dosyası indirildi. Dosyayı güvenli bir yerde sakla.");
  };

  const handleImportBackup = () => {
    if (Platform.OS !== "web") {
      setBackupMessage("Yedek dosyası geri yükleme Safari/Chrome sürümünde kullanılabilir.");
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      void file.text().then(async (serialized) => {
        try {
          const payload = await restoreBackup(serialized);
          await refreshProfile();
          setBackupMessage(`Yedek geri yüklendi: ${new Date(payload.exportedAt).toLocaleDateString("tr-TR")}.`);
        } catch (error) {
          setBackupMessage(error instanceof Error ? error.message : "Yedek geri yüklenemedi.");
        }
      });
    };
    input.click();
  };

  const handleShareProgress = async () => {
    const text = buildProgressShareText({
      averageScore,
      targetScore,
      attemptCount: history.length,
      studiedLessonCount: summaries.length,
      completedStageCount,
      latestAttempt: recentAttempts[0] ? { phrase: recentAttempts[0].phrase, score: recentAttempts[0].score, summary: recentAttempts[0].summary } : undefined,
    });
    try {
      if (Platform.OS === "web") {
        if (typeof navigator.share === "function") {
          await navigator.share({ title: "Dil Hafızası ilerlemem", text });
          setShareMessage("İlerleme özetin paylaşıma açıldı.");
        } else if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          setShareMessage("İlerleme özetin panoya kopyalandı; istediğin yerde paylaşabilirsin.");
        } else {
          throw new Error("Bu tarayıcı paylaşım özelliğini desteklemiyor.");
        }
      } else {
        await Share.share({ title: "Dil Hafızası ilerlemem", message: text });
        setShareMessage("İlerleme özetin paylaşım menüsünde açıldı.");
      }
    } catch (error) {
      if (error && typeof error === "object" && "name" in error && error.name === "AbortError") return;
      setShareMessage(error instanceof Error ? error.message : "Paylaşım başlatılamadı.");
    }
  };

  return (
    <ScreenContainer className="px-5 pt-4" edges={["top", "left", "right"]}>
      <CelebrationOverlay event={celebrationEvent} onFinished={dismissCelebration} />
      <FlatList
        data={recentAttempts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <View style={styles.topRow}>
              <View>
                <Text style={[styles.kicker, isDark && styles.darkAccentText]}>DİL HAFIZASI · PROFİL</Text>
                <Text style={[styles.title, isDark && styles.darkText]}>Gelişimini gör.</Text>
                <Text style={[styles.subtitle, isDark && styles.darkMutedText]}>Her tekrar, cümlelerin sesine biraz daha yerleşir.</Text>
              </View>
              <View style={styles.profileIcon}><MaterialIcons name="person" size={25} color="#FFFDF8" /></View>
            </View>

            {!PUBLIC_WEB_EDITION ? <View style={[styles.cloudCard, isDark && styles.darkSurfaceCard]}>
              <View style={styles.cloudHeader}>
                <View style={styles.cloudIcon}><MaterialIcons name="cloud-sync" size={22} color="#FFFDF8" /></View>
                <View style={styles.cloudCopy}>
                  <Text style={[styles.cloudTitle, isDark && styles.darkText]}>Bulut senkronizasyonu</Text>
                  <Text style={[styles.cloudDescription, isDark && styles.darkMutedText]}>
                    {isAuthenticated ? `${user?.name ?? "Hesabın"} ile giriş yapıldı.` : "Farklı tarayıcı ve cihazlarda aynı ilerlemeyle devam et."}
                  </Text>
                </View>
              </View>
              {!isAuthenticated ? (
                <AnimatedPressable accessibilityLabel="Bulut senkronizasyonu için giriş yap" disabled={authLoading} onPress={handleLogin} style={({ pressed }) => [styles.cloudPrimaryButton, authLoading && styles.cloudButtonDisabled, pressed && styles.pressed]}>
                  <MaterialIcons name="login" size={18} color="#FFFDF8" />
                  <Text style={styles.cloudPrimaryButtonText}>{authLoading ? "Oturum kontrol ediliyor" : "Manus hesabınla giriş yap"}</Text>
                </AnimatedPressable>
              ) : (
                <View style={styles.cloudActions}>
                  <AnimatedPressable accessibilityLabel="Bulut verilerini şimdi eşitle" disabled={isSyncing} onPress={() => void handleManualCloudSync()} style={({ pressed }) => [styles.cloudPrimaryButton, isSyncing && styles.cloudButtonDisabled, pressed && styles.pressed]}>
                    <MaterialIcons name={isSyncing ? "sync" : "sync"} size={18} color="#FFFDF8" />
                    <Text style={styles.cloudPrimaryButtonText}>{isSyncing ? "Eşitleniyor…" : "Şimdi eşitle"}</Text>
                  </AnimatedPressable>
                  <AnimatedPressable accessibilityLabel="Bulut hesabından çıkış yap" onPress={() => void handleLogout()} style={({ pressed }) => [styles.cloudSecondaryButton, pressed && styles.pressed]}>
                    <Text style={styles.cloudSecondaryButtonText}>Çıkış yap</Text>
                  </AnimatedPressable>
                </View>
              )}
              <Text accessibilityLiveRegion="polite" style={[styles.cloudMessage, isDark && styles.darkMutedText]}>{cloudSyncMessage}</Text>
            </View> : null}

            <View style={styles.statsRow}>
              <View style={[styles.statCard, isDark && styles.darkSurfaceCard]}>
                <Text style={[styles.statValue, isDark && styles.darkText]}>{history.length}</Text>
                <Text style={[styles.statLabel, isDark && styles.darkMutedText]}>Toplam deneme</Text>
              </View>
              <View style={[styles.statCard, isDark && styles.darkSurfaceCard]}>
                <Text style={[styles.statValue, isDark && styles.darkText]}>{averageScore === null ? "—" : averageScore}</Text>
                <Text style={[styles.statLabel, isDark && styles.darkMutedText]}>Ortalama puan</Text>
              </View>
              <View style={[styles.statCard, isDark && styles.darkSurfaceCard]}>
                <Text style={[styles.statValue, isDark && styles.darkText]}>{summaries.length}</Text>
                <Text style={[styles.statLabel, isDark && styles.darkMutedText]}>Çalışılan ders</Text>
              </View>
            </View>

            <View style={[styles.motivationCard, isDark && styles.darkSurfaceCard]}>
              <View style={styles.motivationHeader}>
                <View style={styles.streakIcon}><MaterialIcons name="local-fire-department" size={25} color="#FFFDF8" /></View>
                <View style={styles.motivationCopy}>
                  <Text style={[styles.motivationEyebrow, isDark && styles.darkMutedText]}>GÜNLÜK ÇALIŞMA SERİSİ</Text>
                  <Text style={[styles.streakValue, isDark && styles.darkText]}>{currentStreak} gün</Text>
                  <Text style={[styles.motivationDescription, isDark && styles.darkMutedText]}>{currentStreak > 0 ? "Bugünkü kısa pratiğini tamamladın." : "Bugün bir cümle söyleyerek seriyi başlat."}</Text>
                </View>
              </View>
              <View style={styles.badgesHeader}>
                <View>
                  <Text style={[styles.badgesTitle, isDark && styles.darkText]}>Bu haftanın rozetleri</Text>
                  <Text style={[styles.sectionSubtitle, isDark && styles.darkMutedText]}>Küçük tekrarlar görünür bir ritme dönüşür.</Text>
                </View>
                <Text style={[styles.badgesCount, isDark && styles.darkAccentText]}>{weeklyBadges.filter((badge) => badge.earned).length}/{weeklyBadges.length}</Text>
              </View>
              <View style={styles.badgeGrid}>
                {weeklyBadges.map((badge) => (
                  <View key={badge.id} accessibilityLabel={`${badge.title} rozeti ${badge.earned ? "kazanıldı" : "kilitli"}`} style={[styles.badgeItem, badge.earned && styles.badgeItemEarned, isDark && styles.darkBadgeItem]}>
                    <View style={[styles.badgeIcon, badge.earned && styles.badgeIconEarned]}><MaterialIcons name={badge.icon} size={19} color={badge.earned ? "#FFFDF8" : "#9A958B"} /></View>
                    <Text style={[styles.badgeTitle, badge.earned && styles.badgeTitleEarned, isDark && styles.darkText]} numberOfLines={1}>{badge.title}</Text>
                    <Text style={[styles.badgeProgress, isDark && styles.darkMutedText]}>{badge.progress}/{badge.target}</Text>
                  </View>
                ))}
              </View>
              <AnimatedPressable accessibilityLabel="Streak bildirimlerini aç" onPress={() => void handleEnableStreakNotifications()} style={({ pressed }) => [styles.streakNotificationButton, pressed && styles.pressed]}>
                <MaterialIcons name="notifications-active" size={17} color="#1E3A5F" />
                <Text style={styles.streakNotificationButtonText}>Serimi korumak için haber ver</Text>
              </AnimatedPressable>
              <AnimatedPressable accessibilityLabel="Bugün streak hatırlatmasını ertele" disabled={streakSnoozed} onPress={() => void handleSnoozeStreakNotification()} style={({ pressed }) => [styles.streakSnoozeButton, streakSnoozed && styles.streakSnoozeButtonDisabled, pressed && styles.pressed]}>
                <MaterialIcons name={streakSnoozed ? "check" : "notifications-off"} size={16} color="#4E8B70" />
                <Text style={styles.streakSnoozeButtonText}>{streakSnoozed ? "Bugün hatırlatma ertelendi" : "Bugün hatırlatma"}</Text>
              </AnimatedPressable>
              <View style={styles.streakTimeGrid}>
                <View style={styles.streakTimeField}>
                  <Text style={[styles.streakTimeHint, isDark && styles.darkMutedText]}>Hafta içi</Text>
                  <TextInput accessibilityLabel="Hafta içi streak bildirim saati" value={weekdayStreakTimeValue} onChangeText={setWeekdayStreakTimeValue} keyboardType="numbers-and-punctuation" maxLength={5} placeholder="20:00" placeholderTextColor="#9E9587" style={styles.streakTimeInput} />
                </View>
                <View style={styles.streakTimeField}>
                  <Text style={[styles.streakTimeHint, isDark && styles.darkMutedText]}>Hafta sonu</Text>
                  <TextInput accessibilityLabel="Hafta sonu streak bildirim saati" value={weekendStreakTimeValue} onChangeText={setWeekendStreakTimeValue} keyboardType="numbers-and-punctuation" maxLength={5} placeholder="10:00" placeholderTextColor="#9E9587" style={styles.streakTimeInput} />
                </View>
              </View>
              <Text accessibilityLiveRegion="polite" style={[styles.streakNotificationMessage, isDark && styles.darkMutedText]}>{streakNotificationMessage}</Text>
              <AnimatedPressable accessibilityLabel="Rozet koleksiyonunu aç" onPress={() => router.push("/badges")} style={({ pressed }) => [styles.collectionButton, pressed && styles.pressed]}>
                <MaterialIcons name="workspace-premium" size={17} color="#B64D45" />
                <Text style={styles.collectionButtonText}>Tüm rozet koleksiyonunu gör</Text>
              </AnimatedPressable>
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Kaydedilen ilerlemen</Text>
                <Text style={styles.sectionSubtitle}>Hafıza, ders ve telaffuz hedefini birlikte gör</Text>
              </View>
              <MaterialIcons name="insights" size={24} color="#1E3A5F" />
            </View>
            <View style={styles.progressCard}>
              {progressRows.map((row) => (
                <View key={row.id} style={styles.progressRow}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>{row.label}</Text>
                    <Text style={styles.progressValue}>{row.value}/{row.total}</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${row.percent}%` }]} />
                  </View>
                </View>
              ))}
              <AnimatedPressable accessibilityLabel="İlerleme özetini paylaş" onPress={() => void handleShareProgress()} style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}>
                <MaterialIcons name="ios-share" size={17} color="#FFFDF8" />
                <Text style={styles.shareButtonText}>Günlük ilerlemeyi paylaş</Text>
              </AnimatedPressable>
              {shareMessage ? <Text accessibilityLiveRegion="polite" style={styles.shareMessage}>{shareMessage}</Text> : null}
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Haftalık skor trendi</Text>
                <Text style={styles.sectionSubtitle}>Son 7 takvim günündeki telaffuz ortalaman</Text>
              </View>
              <MaterialIcons name="show-chart" size={24} color="#4E8B70" />
            </View>
            <View style={styles.trendCard}>
              {weeklyTrend.map((point) => (
                <View key={point.dateKey} style={styles.trendRow}>
                  <Text style={styles.trendLabel}>{point.label}</Text>
                  <View style={styles.trendTrack}>
                    {point.averageScore !== null ? <View style={[styles.trendFill, { width: `${Math.max(7, point.averageScore)}%` }]} /> : null}
                  </View>
                  <Text style={styles.trendScore}>{point.averageScore === null ? "—" : point.averageScore}</Text>
                </View>
              ))}
              <Text style={styles.trendFootnote}>{targetScore === null ? "Hedef belirlediğinde bu kartta ilerlemeni karşılaştırabilirsin." : averageScore === null ? `Hedefin ${targetScore}/100 · İlk denemeni ekle.` : averageScore >= targetScore ? `Hedefin ${targetScore}/100 · Hedefinin üzerindesin.` : `Hedefin ${targetScore}/100 · Hedefine ${targetScore - averageScore} puan kaldı.`}</Text>
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Puanının gelişimi</Text>
                <Text style={styles.sectionSubtitle}>{timelineRangeLabel(timelineRange)} · {lessonFilter === "all" ? "tüm dersler" : `Ders ${String(lessonFilter).padStart(2, "0")}`} · günlük ortalamaların</Text>
              </View>
              <MaterialIcons name="timeline" size={24} color="#1E3A5F" />
            </View>
            <View style={styles.timelineFilters} accessibilityLabel="Grafik tarih aralığı">
              {([7, 30, "all"] as const).map((range) => (
                <AnimatedPressable
                  key={String(range)}
                  accessibilityLabel={`${timelineRangeLabel(range)} grafik filtresi`}
                  accessibilityState={{ selected: timelineRange === range }}
                  onPress={() => setTimelineRange(range)}
                  style={({ pressed }) => [styles.timelineFilter, timelineRange === range && styles.timelineFilterActive, isDark && styles.darkThemeOption, timelineRange === range && isDark && styles.darkThemeOptionSelected, pressed && styles.pressed]}
                >
                  <Text style={[styles.timelineFilterText, timelineRange === range && styles.timelineFilterTextActive, isDark && styles.darkMutedText]}>{range === "all" ? "Tümü" : `${range} gün`}</Text>
                </AnimatedPressable>
              ))}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.lessonFilters} accessibilityLabel="Grafik ders filtresi">
              <AnimatedPressable accessibilityLabel="Tüm dersler grafik filtresi" accessibilityState={{ selected: lessonFilter === "all" }} onPress={() => setLessonFilter("all")} style={({ pressed }) => [styles.timelineFilter, lessonFilter === "all" && styles.timelineFilterActive, isDark && styles.darkThemeOption, lessonFilter === "all" && isDark && styles.darkThemeOptionSelected, pressed && styles.pressed]}>
                <Text style={[styles.timelineFilterText, lessonFilter === "all" && styles.timelineFilterTextActive, isDark && styles.darkMutedText]}>Tüm dersler</Text>
              </AnimatedPressable>
              {lessonOptions.map((lessonNumber) => (
                <AnimatedPressable key={lessonNumber} accessibilityLabel={`Ders ${String(lessonNumber).padStart(2, "0")} grafik filtresi`} accessibilityState={{ selected: lessonFilter === lessonNumber }} onPress={() => setLessonFilter(lessonNumber)} style={({ pressed }) => [styles.timelineFilter, lessonFilter === lessonNumber && styles.timelineFilterActive, isDark && styles.darkThemeOption, lessonFilter === lessonNumber && isDark && styles.darkThemeOptionSelected, pressed && styles.pressed]}>
                  <Text style={[styles.timelineFilterText, lessonFilter === lessonNumber && styles.timelineFilterTextActive, isDark && styles.darkMutedText]}>Ders {String(lessonNumber).padStart(2, "0")}</Text>
                </AnimatedPressable>
              ))}
            </ScrollView>
            <View style={[styles.lineChartCard, isDark && styles.darkSurfaceCard]} accessibilityLabel={scorePoints ? `${timelineRangeLabel(timelineRange)} telaffuz puanı çizgi grafiği` : "Çizgi grafik için henüz yeterli telaffuz verisi yok"}>
              {scorePoints ? (
                <>
                  <Svg width="100%" height={130} viewBox="0 0 320 130">
                    <Line x1="12" y1="16" x2="308" y2="16" stroke={isDark ? "#375068" : "#E5DDCF"} strokeWidth="1" />
                    <Line x1="12" y1="62" x2="308" y2="62" stroke={isDark ? "#375068" : "#E5DDCF"} strokeWidth="1" />
                    <Line x1="12" y1="108" x2="308" y2="108" stroke={isDark ? "#375068" : "#E5DDCF"} strokeWidth="1" />
                    {targetScore !== null ? <Line x1="12" y1={Math.max(10, Math.min(108, 108 - targetScore * 0.92))} x2="308" y2={Math.max(10, Math.min(108, 108 - targetScore * 0.92))} stroke={isDark ? "#EE867E" : "#B64D45"} strokeWidth="2" strokeDasharray="6 5" /> : null}
                    <Polyline points={scorePoints} fill="none" stroke={isDark ? "#8FB5D8" : "#1E3A5F"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {scoreTimeline.map((point, index) => {
                      if (point.averageScore === null) return null;
                      const x = 12 + (index * 296) / Math.max(1, scoreTimeline.length - 1);
                      const y = Math.max(10, Math.min(108, 108 - (point.averageScore * 0.92)));
                      return <Circle key={point.dateKey} cx={x} cy={y} r="4" fill={isDark ? "#8FB5D8" : "#1E3A5F"} />;
                    })}
                  </Svg>
                  <View style={styles.lineChartLabels}>
                    {scoreTimeline.map((point, index) => <Text key={point.dateKey} style={[styles.lineChartLabel, isDark && styles.darkMutedText]}>{shouldShowTimelineLabel(index, scoreTimeline.length) ? point.label : ""}</Text>)}
                  </View>
                  {targetScore !== null ? <View style={styles.targetLegend}><View style={[styles.targetLegendLine, isDark && styles.targetLegendLineDark]} /><Text style={[styles.chartAccessibleSummary, isDark && styles.darkMutedText]}>Hedef puanın: {targetScore}</Text></View> : null}
                  <Text style={[styles.chartAccessibleSummary, isDark && styles.darkMutedText]}>Grafikte dolu günler çizgiyle bağlanır; boş günlerde önceki değerle görsel süreklilik korunur.</Text>
                </>
              ) : (
                <View style={styles.emptyLineChart}>
                  <MaterialIcons name="timeline" size={29} color={isDark ? "#8FA5B8" : "#B9B1A2"} />
                  <Text style={[styles.emptyTitle, isDark && styles.darkText]}>Çizgi grafik için veri bekleniyor</Text>
                  <Text style={[styles.emptyText, isDark && styles.darkMutedText]}>En az iki farklı günde telaffuz pratiği yaptığında gelişim çizgin burada görünecek.</Text>
                </View>
              )}
            </View>

            <View style={[styles.comparisonCard, isDark && styles.darkSurfaceCard]}>
              <View style={styles.sectionHeaderCompact}>
                <View>
                  <Text style={[styles.comparisonTitle, isDark && styles.darkText]}>İki dersi karşılaştır</Text>
                  <Text style={[styles.sectionSubtitle, isDark && styles.darkMutedText]}>Aynı günlerdeki telaffuz ortalamalarını gör.</Text>
                </View>
                <MaterialIcons name="compare-arrows" size={24} color="#B64D45" />
              </View>
              <Text style={[styles.comparisonLabel, isDark && styles.darkMutedText]}>Birinci ders</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.lessonFilters} accessibilityLabel="Birinci karşılaştırma dersi">
                {lessonOptions.map((lessonNumber) => <AnimatedPressable key={`first-${lessonNumber}`} accessibilityLabel={`Karşılaştırma birinci Ders ${String(lessonNumber).padStart(2, "0")}`} accessibilityState={{ selected: comparisonFirstLesson === lessonNumber }} onPress={() => handleFirstLessonChange(lessonNumber)} style={({ pressed }) => [styles.timelineFilter, comparisonFirstLesson === lessonNumber && styles.comparisonFirstActive, isDark && styles.darkThemeOption, pressed && styles.pressed]}><Text style={[styles.timelineFilterText, comparisonFirstLesson === lessonNumber && styles.timelineFilterTextActive, isDark && styles.darkMutedText]}>Ders {String(lessonNumber).padStart(2, "0")}</Text></AnimatedPressable>)}
              </ScrollView>
              <Text style={[styles.comparisonLabel, isDark && styles.darkMutedText]}>İkinci ders</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.lessonFilters} accessibilityLabel="İkinci karşılaştırma dersi">
                {lessonOptions.map((lessonNumber) => <AnimatedPressable key={`second-${lessonNumber}`} accessibilityLabel={`Karşılaştırma ikinci Ders ${String(lessonNumber).padStart(2, "0")}`} accessibilityState={{ selected: comparisonSecondLesson === lessonNumber }} onPress={() => handleSecondLessonChange(lessonNumber)} style={({ pressed }) => [styles.timelineFilter, comparisonSecondLesson === lessonNumber && styles.comparisonSecondActive, isDark && styles.darkThemeOption, pressed && styles.pressed]}><Text style={[styles.timelineFilterText, comparisonSecondLesson === lessonNumber && styles.timelineFilterTextActive, isDark && styles.darkMutedText]}>Ders {String(lessonNumber).padStart(2, "0")}</Text></AnimatedPressable>)}
              </ScrollView>
              <View style={styles.comparisonLegend}>
                <View style={[styles.legendDot, styles.legendDotFirst]} /><Text style={[styles.legendText, isDark && styles.darkMutedText]}>Ders {String(comparisonFirstLesson).padStart(2, "0")}</Text>
                <View style={[styles.legendDot, styles.legendDotSecond]} /><Text style={[styles.legendText, isDark && styles.darkMutedText]}>Ders {String(comparisonSecondLesson).padStart(2, "0")}</Text>
              </View>
              <View style={[styles.comparisonChart, isDark && styles.darkComparisonChart]} accessibilityLabel={`Ders ${comparisonFirstLesson} ve Ders ${comparisonSecondLesson} karşılaştırma grafiği`}>
                {comparisonFirstPoints || comparisonSecondPoints ? <><Svg width="100%" height={130} viewBox="0 0 320 130">
                  <Line x1="12" y1="16" x2="308" y2="16" stroke={isDark ? "#375068" : "#E5DDCF"} strokeWidth="1" />
                  <Line x1="12" y1="62" x2="308" y2="62" stroke={isDark ? "#375068" : "#E5DDCF"} strokeWidth="1" />
                  <Line x1="12" y1="108" x2="308" y2="108" stroke={isDark ? "#375068" : "#E5DDCF"} strokeWidth="1" />
                  {comparisonFirstPoints ? <Polyline points={comparisonFirstPoints} fill="none" stroke="#B64D45" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /> : null}
                  {comparisonSecondPoints ? <Polyline points={comparisonSecondPoints} fill="none" stroke="#4E8B70" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /> : null}
                  {comparisonTimeline.map((point, index) => { const x = 12 + (index * 296) / Math.max(1, comparisonTimeline.length - 1); return <Fragment key={point.dateKey}>{point.firstScore !== null ? <Circle cx={x} cy={Math.max(10, Math.min(108, 108 - (point.firstScore * 0.92)))} r="4" fill="#B64D45" /> : null}{point.secondScore !== null ? <Circle cx={x} cy={Math.max(10, Math.min(108, 108 - (point.secondScore * 0.92)))} r="4" fill="#4E8B70" /> : null}</Fragment>; })}
                </Svg><View style={styles.lineChartLabels}>{comparisonTimeline.map((point, index) => <Text key={point.dateKey} style={[styles.lineChartLabel, isDark && styles.darkMutedText]}>{shouldShowTimelineLabel(index, comparisonTimeline.length) ? point.label : ""}</Text>)}</View></> : <Text style={[styles.emptyText, isDark && styles.darkMutedText]}>Seçtiğin derslerde en az iki farklı gün puan oluştuğunda karşılaştırma burada görünecek.</Text>}
              </View>
              <View style={styles.comparisonSummary} accessibilityLabel="Ders karşılaştırma özeti">
                <View style={styles.comparisonMetric}><Text style={[styles.comparisonMetricValue, isDark && styles.darkText]}>{comparisonSummary.averageGap === null ? "—" : `${comparisonSummary.averageGap > 0 ? "+" : ""}${comparisonSummary.averageGap}`}</Text><Text style={[styles.comparisonMetricLabel, isDark && styles.darkMutedText]}>Ortalama fark · Ders {String(comparisonSecondLesson).padStart(2, "0")} − Ders {String(comparisonFirstLesson).padStart(2, "0")}</Text></View>
                <View style={styles.comparisonMetric}><Text style={[styles.comparisonMetricValue, isDark && styles.darkText]}>{comparisonSummary.firstGrowthPercent === null ? "—" : `${comparisonSummary.firstGrowthPercent > 0 ? "+" : ""}${comparisonSummary.firstGrowthPercent}%`}</Text><Text style={[styles.comparisonMetricLabel, isDark && styles.darkMutedText]}>Ders {String(comparisonFirstLesson).padStart(2, "0")} gelişim</Text></View>
                <View style={styles.comparisonMetric}><Text style={[styles.comparisonMetricValue, isDark && styles.darkText]}>{comparisonSummary.secondGrowthPercent === null ? "—" : `${comparisonSummary.secondGrowthPercent > 0 ? "+" : ""}${comparisonSummary.secondGrowthPercent}%`}</Text><Text style={[styles.comparisonMetricLabel, isDark && styles.darkMutedText]}>Ders {String(comparisonSecondLesson).padStart(2, "0")} gelişim</Text></View>
              </View>
            </View>

            <View style={styles.goalCard}>
              <View style={styles.goalIcon}><MaterialIcons name="flag" size={22} color="#B64D45" /></View>
              <View style={styles.goalCopy}>
                <Text style={styles.goalTitle}>Kendine hedef puan belirle</Text>
                <Text style={styles.goalDescription}>Her AI değerlendirmesinde gelişimini bu hedefle karşılaştır.</Text>
              </View>
              <View style={styles.goalInputRow}>
                <TextInput
                  accessibilityLabel="Hedef telaffuz puanı"
                  value={targetInput}
                  onChangeText={setTargetInput}
                  keyboardType="number-pad"
                  maxLength={3}
                  placeholder="85"
                  placeholderTextColor="#9E9587"
                  style={styles.goalInput}
                />
                <Text style={styles.goalSuffix}>/100</Text>
                <AnimatedPressable accessibilityLabel="Hedef puanı kaydet" onPress={() => void handleSaveTarget()} style={({ pressed }) => [styles.goalSaveButton, pressed && styles.pressed]}>
                  <Text style={styles.goalSaveText}>{targetScore === null ? "Kaydet" : "Güncelle"}</Text>
                </AnimatedPressable>
              </View>
              <Text accessibilityLiveRegion="polite" style={styles.goalMessage}>{targetMessage}</Text>
              {targetScore !== null ? <AnimatedPressable accessibilityLabel="Hedef puanı temizle" onPress={() => void handleClearTarget}><Text style={styles.goalClearText}>Hedefi kaldır</Text></AnimatedPressable> : null}
            </View>

            <View style={styles.backupCard}>
              <View style={styles.backupHeader}>
                <View style={styles.backupIcon}><MaterialIcons name="backup" size={22} color="#4E8B70" /></View>
                <View style={styles.backupCopy}>
                  <Text style={styles.backupTitle}>Verilerini yedekle</Text>
                  <Text style={styles.backupDescription}>İlerleme ve hedef puanını JSON dosyası olarak sakla.</Text>
                </View>
              </View>
              <View style={styles.backupActions}>
                <AnimatedPressable accessibilityLabel="Öğrenme verilerini dışa aktar" onPress={() => void handleExportBackup()} style={({ pressed }) => [styles.backupButton, pressed && styles.pressed]}>
                  <Text style={styles.backupButtonText}>Yedeği indir</Text>
                </AnimatedPressable>
                <AnimatedPressable accessibilityLabel="Öğrenme verilerini geri yükle" onPress={handleImportBackup} style={({ pressed }) => [styles.backupButtonSecondary, pressed && styles.pressed]}>
                  <Text style={styles.backupButtonSecondaryText}>Yedeği yükle</Text>
                </AnimatedPressable>
              </View>
              <Text accessibilityLiveRegion="polite" style={styles.backupMessage}>{backupMessage}</Text>
            </View>

            <View style={[styles.themeCard, isDark && styles.darkSurfaceCard]}>
              <View style={styles.themeHeader}>
                <View style={styles.themeIcon}><MaterialIcons name={isDark ? "dark-mode" : "light-mode"} size={22} color={isDark ? "#E6BA6F" : "#A9702D"} /></View>
                <View style={styles.backupCopy}>
                  <Text style={[styles.backupTitle, isDark && styles.darkText]}>Gece çalışma görünümü</Text>
                  <Text style={[styles.backupDescription, isDark && styles.darkMutedText]}>Gözlerini yormayan temayı seç; tercih bu cihazda saklanır.</Text>
                </View>
              </View>
              <View style={styles.themeOptions} accessibilityLabel="Tema seçimi">
                {(["system", "light", "dark"] as const).map((option) => (
                  <AnimatedPressable
                    key={option}
                    accessibilityLabel={`${option === "system" ? "Sistem" : option === "light" ? "Açık" : "Karanlık"} tema`}
                    accessibilityState={{ selected: preference === option }}
                    onPress={() => setColorScheme(option)}
                    style={({ pressed }) => [styles.themeOption, preference === option && styles.themeOptionSelected, isDark && styles.darkThemeOption, preference === option && isDark && styles.darkThemeOptionSelected, pressed && styles.pressed]}
                  >
                    <MaterialIcons name={option === "system" ? "settings-brightness" : option === "light" ? "light-mode" : "dark-mode"} size={17} color={preference === option ? "#FFFDF8" : isDark ? "#B9C4D0" : "#5C6873"} />
                    <Text style={[styles.themeOptionText, preference === option && styles.themeOptionTextSelected, isDark && styles.darkMutedText]}>{option === "system" ? "Sistem" : option === "light" ? "Açık" : "Karanlık"}</Text>
                  </AnimatedPressable>
                ))}
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Ders bazlı ilerleme</Text>
                <Text style={styles.sectionSubtitle}>Her ders için ortalama telaffuz puanın</Text>
              </View>
              <MaterialIcons name="bar-chart" size={24} color="#B64D45" />
            </View>
            <View style={styles.chartCard}>
              {summaries.length === 0 ? (
                <View style={styles.emptyChart}>
                  <MaterialIcons name="insights" size={30} color="#B9B1A2" />
                  <Text style={styles.emptyTitle}>Henüz puan yok</Text>
                  <Text style={styles.emptyText}>Bir hikâyede sesini değerlendir; ilk puanın burada görünsün.</Text>
                  <AnimatedPressable accessibilityLabel="İlk telaffuz pratiğine git" onPress={() => router.push("/stories")} style={({ pressed }) => [styles.smallButton, pressed && styles.pressed]}>
                    <Text style={styles.smallButtonText}>İlk pratiğe git</Text>
                  </AnimatedPressable>
                </View>
              ) : (
                summaries.map((summary) => (
                  <View key={summary.lessonNumber} style={styles.chartRow}>
                    <Text style={styles.chartLesson}>Ders {String(summary.lessonNumber).padStart(2, "0")}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${Math.max(7, summary.averageScore)}%` }]} />
                    </View>
                    <Text style={styles.chartScore}>{summary.averageScore}</Text>
                  </View>
                ))
              )}
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Günlük Tekrar bildirimi</Text>
                <Text style={styles.sectionSubtitle}>Telefonunda her gün kısa bir hatırlatma</Text>
              </View>
              <MaterialIcons name="notifications-none" size={24} color="#A9702D" />
            </View>
            <View style={styles.reminderCard}>
              <View style={styles.reminderIcon}><MaterialIcons name="schedule" size={23} color="#A9702D" /></View>
              <View style={styles.reminderCopy}>
                <Text style={styles.reminderTitle}>Hatırlatma saati</Text>
                <Text style={styles.reminderDescription}>Önceki dersini 30 dakika ile yeniden hatırla.</Text>
              </View>
              {reminderEnabled ? <View style={styles.enabledPill}><Text style={styles.enabledPillText}>AÇIK</Text></View> : null}
              <View style={styles.timeRow}>
                <TextInput
                  accessibilityLabel="Günlük tekrar saati"
                  value={timeValue}
                  onChangeText={setTimeValue}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                  placeholder="20:00"
                  placeholderTextColor="#9E9587"
                  style={styles.timeInput}
                />
                <AnimatedPressable accessibilityLabel="Günlük tekrar bildirimini ayarla" onPress={() => void handleScheduleReminder()} style={({ pressed }) => [styles.scheduleButton, pressed && styles.pressed]}>
                  <Text style={styles.scheduleButtonText}>{reminderEnabled ? "Güncelle" : "Ayarla"}</Text>
                </AnimatedPressable>
              </View>
              <Text accessibilityLiveRegion="polite" style={styles.reminderMessage}>{reminderMessage}</Text>
              {reminderEnabled ? <AnimatedPressable accessibilityLabel="Günlük tekrar bildirimini kapat" onPress={() => void handleDisableReminder()}><Text style={styles.disableText}>Bildirimi kapat</Text></AnimatedPressable> : null}
            </View>

            <View style={styles.historyHeader}>
              <View>
                <Text style={styles.sectionTitle}>Geçmiş denemeler</Text>
                <Text style={styles.sectionSubtitle}>En son AI değerlendirmelerin</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.historyRow}>
            <View style={styles.historyScore}><Text style={styles.historyScoreText}>{item.score}</Text></View>
            <View style={styles.historyCopy}>
              <Text style={styles.historyLesson}>Ders {String(item.lessonNumber).padStart(2, "0")} · {formatAttemptDate(item.createdAt)}</Text>
              <Text style={styles.historyPhrase} numberOfLines={2}>{item.phrase}</Text>
              <Text style={styles.historySummary} numberOfLines={1}>{item.summary}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyHistory}>Henüz kayıtlı bir deneme yok. Hikâyeler sekmesinden bir cümle seçerek başlayabilirsin.</Text>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 30, width: "100%", maxWidth: 980, alignSelf: "center" },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  kicker: { fontSize: 12, fontWeight: "800", letterSpacing: 1.4, color: "#B64D45", marginBottom: 7 },
  title: { color: "#172A3A", fontSize: 30, lineHeight: 37, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { color: "#5C6873", fontSize: 13.5, lineHeight: 19, marginTop: 5, maxWidth: 300 },
  profileIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#1E3A5F", alignItems: "center", justifyContent: "center" },
  cloudCard: { backgroundColor: "#EEF5F1", borderRadius: 18, borderWidth: 1, borderColor: "#C9DDCF", padding: 14, marginBottom: 20 },
  cloudHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 11 },
  cloudIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#4E8B70", alignItems: "center", justifyContent: "center" },
  cloudCopy: { flex: 1 },
  cloudTitle: { color: "#254D3D", fontSize: 16, fontWeight: "800" },
  cloudDescription: { color: "#5C7564", fontSize: 12.5, lineHeight: 17, marginTop: 3 },
  cloudActions: { flexDirection: "row", gap: 8 },
  cloudPrimaryButton: { minHeight: 42, flex: 1, borderRadius: 12, backgroundColor: "#1E3A5F", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingHorizontal: 12 },
  cloudPrimaryButtonText: { color: "#FFFDF8", fontSize: 12.5, fontWeight: "800" },
  cloudSecondaryButton: { minHeight: 42, minWidth: 78, borderRadius: 12, borderWidth: 1, borderColor: "#B9D0BD", backgroundColor: "#FFFDF8", alignItems: "center", justifyContent: "center", paddingHorizontal: 10 },
  cloudSecondaryButtonText: { color: "#37654B", fontSize: 12, fontWeight: "800" },
  cloudButtonDisabled: { opacity: 0.65 },
  cloudMessage: { color: "#416353", fontSize: 11.5, lineHeight: 16, marginTop: 9 },
  statsRow: { flexDirection: "row", gap: 9, marginBottom: 26 },
  statCard: { flex: 1, backgroundColor: "#FFFDF8", borderRadius: 16, padding: 13, borderWidth: 1, borderColor: "#E5DDCF" },
  statValue: { color: "#1E3A5F", fontSize: 23, fontWeight: "800" },
  statLabel: { color: "#6C756F", fontSize: 11, lineHeight: 15, marginTop: 3 },
  motivationCard: { backgroundColor: "#FFFDF8", borderRadius: 18, borderWidth: 1, borderColor: "#E5DDCF", padding: 15, marginBottom: 24 },
  motivationHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  streakIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#B64D45", alignItems: "center", justifyContent: "center", marginRight: 12 },
  motivationCopy: { flex: 1 },
  motivationEyebrow: { color: "#B64D45", fontSize: 10.5, fontWeight: "800", letterSpacing: 0.9 },
  streakValue: { color: "#172A3A", fontSize: 24, lineHeight: 28, fontWeight: "800", marginTop: 2 },
  motivationDescription: { color: "#5C6873", fontSize: 12.5, lineHeight: 17, marginTop: 2 },
  badgesHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 10 },
  badgesTitle: { color: "#172A3A", fontSize: 15, fontWeight: "800" },
  badgesCount: { color: "#B64D45", fontSize: 13, fontWeight: "800" },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badgeItem: { width: "23.5%", minHeight: 95, borderRadius: 13, backgroundColor: "#F2F0EA", alignItems: "center", justifyContent: "center", padding: 7, borderWidth: 1, borderColor: "#E5DDCF" },
  badgeItemEarned: { backgroundColor: "#F8EBCF", borderColor: "#E9D49E" },
  badgeIcon: { width: 31, height: 31, borderRadius: 11, backgroundColor: "#D9D6CE", alignItems: "center", justifyContent: "center", marginBottom: 5 },
  badgeIconEarned: { backgroundColor: "#B64D45" },
  badgeTitle: { color: "#85837C", fontSize: 10.5, fontWeight: "800", textAlign: "center" },
  badgeTitleEarned: { color: "#4C3B26" },
  badgeProgress: { color: "#8C877D", fontSize: 10, marginTop: 3 },
  streakNotificationButton: { minHeight: 40, borderRadius: 12, backgroundColor: "#F3DFA7", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 13 },
  streakNotificationButtonText: { color: "#1E3A5F", fontSize: 12.5, fontWeight: "800" },
  streakSnoozeButton: { minHeight: 38, borderRadius: 11, backgroundColor: "#EEF5EE", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8, borderWidth: 1, borderColor: "#C9DED0" },
  streakSnoozeButtonDisabled: { backgroundColor: "#E4EEE7", borderColor: "#B7D0C0", opacity: 0.8 },
  streakSnoozeButtonText: { color: "#376B52", fontSize: 12, fontWeight: "800" },
  streakTimeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 9 },
  streakTimeGrid: { flexDirection: "row", gap: 9, marginTop: 9 },
  streakTimeField: { flex: 1, gap: 5 },
  streakTimeInput: { width: "100%", minHeight: 40, backgroundColor: "#FFFDF8", borderRadius: 11, borderWidth: 1, borderColor: "#E1C98E", paddingHorizontal: 11, color: "#1E3A5F", fontSize: 14, fontWeight: "800" },
  streakTimeHint: { color: "#6C756F", fontSize: 11.5 },
  streakNotificationMessage: { color: "#6C756F", fontSize: 11.5, lineHeight: 16, marginTop: 7 },
  collectionButton: { minHeight: 38, borderRadius: 11, borderWidth: 1, borderColor: "#E9D49E", backgroundColor: "#FFF8E7", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 9 },
  collectionButtonText: { color: "#B64D45", fontSize: 12, fontWeight: "800" },
  darkSurfaceCard: { backgroundColor: "#203248", borderColor: "#375068" },
  darkBadgeItem: { backgroundColor: "#263B50", borderColor: "#375068" },
  darkText: { color: "#F6F1E6" },
  darkMutedText: { color: "#B9C4D0" },
  darkAccentText: { color: "#EE867E" },
  sectionHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 11 },
  sectionTitle: { color: "#172A3A", fontSize: 19, fontWeight: "800" },
  sectionSubtitle: { color: "#5C6873", fontSize: 12.5, marginTop: 3 },
  progressCard: { backgroundColor: "#EAF2EE", borderRadius: 18, borderWidth: 1, borderColor: "#C9DDCF", padding: 15, marginBottom: 24 },
  progressRow: { marginBottom: 11 },
  progressLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  progressLabel: { color: "#416353", fontSize: 12.5, fontWeight: "700" },
  progressValue: { color: "#254D3D", fontSize: 12, fontWeight: "800" },
  progressTrack: { height: 10, borderRadius: 6, backgroundColor: "#D1E2D7", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 6, backgroundColor: "#4E8B70" },
  shareButton: { minHeight: 43, borderRadius: 12, backgroundColor: "#1E3A5F", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 4 },
  shareButtonText: { color: "#FFFDF8", fontSize: 13, fontWeight: "800" },
  shareMessage: { color: "#416353", fontSize: 12, lineHeight: 17, textAlign: "center", marginTop: 8 },
  chartCard: { backgroundColor: "#FFFDF8", borderRadius: 18, borderWidth: 1, borderColor: "#E5DDCF", padding: 15, marginBottom: 24 },
  trendCard: { backgroundColor: "#EDF4EF", borderRadius: 18, borderWidth: 1, borderColor: "#C9DDCF", padding: 15, marginBottom: 13 },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 9, marginVertical: 5 },
  trendLabel: { color: "#52636D", width: 31, fontSize: 11.5, fontWeight: "800" },
  trendTrack: { flex: 1, height: 12, borderRadius: 7, backgroundColor: "#D9E7DC", overflow: "hidden" },
  trendFill: { height: "100%", borderRadius: 7, backgroundColor: "#4E8B70" },
  trendScore: { color: "#254D3D", width: 27, fontSize: 12, fontWeight: "800", textAlign: "right" },
  trendFootnote: { color: "#416353", fontSize: 12, lineHeight: 17, marginTop: 9 },
  lineChartCard: { backgroundColor: "#FFFDF8", borderRadius: 18, borderWidth: 1, borderColor: "#E5DDCF", padding: 13, marginBottom: 24 },
  timelineFilters: { flexDirection: "row", gap: 8, marginBottom: 10 },
  lessonFilters: { gap: 8, paddingBottom: 10 },
  timelineFilter: { minHeight: 36, paddingHorizontal: 13, borderRadius: 11, borderWidth: 1, borderColor: "#DFD8C7", backgroundColor: "#F7F3E8", alignItems: "center", justifyContent: "center" },
  timelineFilterActive: { backgroundColor: "#1E3A5F", borderColor: "#1E3A5F" },
  timelineFilterText: { color: "#5C6873", fontSize: 12, fontWeight: "800" },
  timelineFilterTextActive: { color: "#FFFDF8" },
  lineChartLabels: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 5, marginTop: -2 },
  lineChartLabel: { color: "#6C756F", fontSize: 10.5, fontWeight: "700" },
  targetLegend: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 6 },
  targetLegendLine: { width: 24, borderTopWidth: 2, borderTopColor: "#B64D45", borderStyle: "dashed" },
  targetLegendLineDark: { borderTopColor: "#EE867E" },
  chartAccessibleSummary: { color: "#6C756F", fontSize: 11.5, lineHeight: 16, marginTop: 9 },
  emptyLineChart: { alignItems: "center", paddingVertical: 13 },
  comparisonCard: { backgroundColor: "#FFFDF8", borderRadius: 18, borderWidth: 1, borderColor: "#E5DDCF", padding: 13, marginBottom: 24 },
  sectionHeaderCompact: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  comparisonTitle: { color: "#172A3A", fontSize: 17, fontWeight: "800" },
  comparisonLabel: { color: "#5C6873", fontSize: 11.5, fontWeight: "800", marginTop: 4, marginBottom: 6 },
  comparisonFirstActive: { backgroundColor: "#B64D45", borderColor: "#B64D45" },
  comparisonSecondActive: { backgroundColor: "#4E8B70", borderColor: "#4E8B70" },
  comparisonLegend: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 6 },
  legendDot: { width: 9, height: 9, borderRadius: 5, marginLeft: 5 },
  legendDotFirst: { backgroundColor: "#B64D45" },
  legendDotSecond: { backgroundColor: "#4E8B70" },
  legendText: { color: "#5C6873", fontSize: 11.5, fontWeight: "800", marginRight: 4 },
  comparisonChart: { minHeight: 138, borderRadius: 13, backgroundColor: "#F7F3E8", padding: 8, justifyContent: "center" },
  darkComparisonChart: { backgroundColor: "#263B50" },
  comparisonSummary: { flexDirection: "row", gap: 8, marginTop: 10 },
  comparisonMetric: { flex: 1, minHeight: 58, borderRadius: 12, backgroundColor: "#F7F3E8", padding: 9 },
  comparisonMetricValue: { color: "#1E3A5F", fontSize: 18, fontWeight: "900" },
  comparisonMetricLabel: { color: "#687076", fontSize: 9.5, lineHeight: 13, marginTop: 3 },
  goalCard: { backgroundColor: "#FFFDF8", borderRadius: 18, borderWidth: 1, borderColor: "#E5DDCF", padding: 15, marginBottom: 24 },
  goalIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#F8E1DB", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  goalCopy: { marginBottom: 12 },
  goalTitle: { color: "#172A3A", fontSize: 16, fontWeight: "800" },
  goalDescription: { color: "#5C6873", fontSize: 12.5, lineHeight: 17, marginTop: 3 },
  goalInputRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  goalInput: { width: 86, minHeight: 46, backgroundColor: "#F7F3EA", borderRadius: 12, borderWidth: 1, borderColor: "#DFD8C7", paddingHorizontal: 13, color: "#172A3A", fontSize: 16, fontWeight: "800" },
  goalSuffix: { color: "#5C6873", fontSize: 13, fontWeight: "800", marginRight: "auto" },
  goalSaveButton: { minWidth: 94, minHeight: 46, borderRadius: 12, backgroundColor: "#1E3A5F", alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  goalSaveText: { color: "#FFFDF8", fontSize: 13, fontWeight: "800" },
  goalMessage: { color: "#5C6873", fontSize: 12, lineHeight: 17, marginTop: 9 },
  goalClearText: { color: "#B64D45", fontSize: 12, fontWeight: "800", marginTop: 8 },
  backupCard: { backgroundColor: "#F3F6F1", borderRadius: 18, borderWidth: 1, borderColor: "#D6E1D3", padding: 15, marginBottom: 24 },
  backupHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 13 },
  backupIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#E1EFE4", alignItems: "center", justifyContent: "center" },
  backupCopy: { flex: 1 },
  backupTitle: { color: "#254D3D", fontSize: 16, fontWeight: "800" },
  backupDescription: { color: "#5C7564", fontSize: 12.5, lineHeight: 17, marginTop: 3 },
  backupActions: { flexDirection: "row", gap: 8 },
  backupButton: { flex: 1, minHeight: 43, borderRadius: 12, backgroundColor: "#4E8B70", alignItems: "center", justifyContent: "center", paddingHorizontal: 10 },
  backupButtonText: { color: "#FFFDF8", fontSize: 12.5, fontWeight: "800" },
  backupButtonSecondary: { flex: 1, minHeight: 43, borderRadius: 12, backgroundColor: "#FFFDF8", borderWidth: 1, borderColor: "#B9D0BD", alignItems: "center", justifyContent: "center", paddingHorizontal: 10 },
  backupButtonSecondaryText: { color: "#37654B", fontSize: 12.5, fontWeight: "800" },
  backupMessage: { color: "#5C7564", fontSize: 11.5, lineHeight: 16, marginTop: 9 },
  themeCard: { backgroundColor: "#FFFDF8", borderRadius: 18, borderWidth: 1, borderColor: "#E5DDCF", padding: 15, marginBottom: 24 },
  themeHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 13 },
  themeIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#F8EBCF", alignItems: "center", justifyContent: "center" },
  themeOptions: { flexDirection: "row", gap: 8 },
  themeOption: { flex: 1, minHeight: 42, borderRadius: 12, borderWidth: 1, borderColor: "#DFD8C7", backgroundColor: "#F7F3E8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  themeOptionSelected: { backgroundColor: "#1E3A5F", borderColor: "#1E3A5F" },
  darkThemeOption: { backgroundColor: "#263B50", borderColor: "#375068" },
  darkThemeOptionSelected: { backgroundColor: "#8FB5D8", borderColor: "#8FB5D8" },
  themeOptionText: { color: "#5C6873", fontSize: 12, fontWeight: "800" },
  themeOptionTextSelected: { color: "#FFFDF8" },
  chartRow: { flexDirection: "row", alignItems: "center", gap: 9, marginVertical: 7 },
  chartLesson: { color: "#52636D", width: 54, fontSize: 11.5, fontWeight: "800" },
  barTrack: { flex: 1, height: 13, borderRadius: 7, backgroundColor: "#E7EEE8", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 7, backgroundColor: "#4E8B70" },
  chartScore: { color: "#254D3D", width: 27, fontSize: 12, fontWeight: "800", textAlign: "right" },
  emptyChart: { alignItems: "center", paddingVertical: 11 },
  emptyTitle: { color: "#254D3D", fontSize: 16, fontWeight: "800", marginTop: 7 },
  emptyText: { color: "#5C6873", fontSize: 12.5, lineHeight: 18, textAlign: "center", marginTop: 4, maxWidth: 270 },
  smallButton: { backgroundColor: "#F3DFA7", borderRadius: 11, paddingHorizontal: 14, paddingVertical: 9, marginTop: 11 },
  smallButtonText: { color: "#1E3A5F", fontSize: 12.5, fontWeight: "800" },
  reminderCard: { backgroundColor: "#F8EBCF", borderRadius: 18, borderWidth: 1, borderColor: "#E9D49E", padding: 15, marginBottom: 24 },
  reminderIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#FFF8E9", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  reminderCopy: { marginBottom: 12 },
  reminderTitle: { color: "#4C3B26", fontSize: 16, fontWeight: "800" },
  reminderDescription: { color: "#806A4A", fontSize: 12.5, marginTop: 3 },
  enabledPill: { position: "absolute", top: 16, right: 15, backgroundColor: "#D3E7D9", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  enabledPillText: { color: "#315B40", fontSize: 10, fontWeight: "800" },
  timeRow: { flexDirection: "row", gap: 9 },
  timeInput: { flex: 1, minHeight: 46, backgroundColor: "#FFFDF8", borderRadius: 12, borderWidth: 1, borderColor: "#E1C98E", paddingHorizontal: 13, color: "#4C3B26", fontSize: 16, fontWeight: "800" },
  scheduleButton: { minWidth: 105, minHeight: 46, borderRadius: 12, backgroundColor: "#B64D45", alignItems: "center", justifyContent: "center" },
  scheduleButtonText: { color: "#FFFDF8", fontSize: 13.5, fontWeight: "800" },
  reminderMessage: { color: "#806A4A", fontSize: 12, lineHeight: 17, marginTop: 9 },
  disableText: { color: "#A34F43", fontSize: 12, fontWeight: "800", marginTop: 9 },
  historyHeader: { marginBottom: 11 },
  historyRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFDF8", borderRadius: 16, borderWidth: 1, borderColor: "#E5DDCF", padding: 12, marginBottom: 9 },
  historyScore: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#4E8B70", alignItems: "center", justifyContent: "center", marginRight: 11 },
  historyScoreText: { color: "#FFFDF8", fontSize: 17, fontWeight: "800" },
  historyCopy: { flex: 1 },
  historyLesson: { color: "#B64D45", fontSize: 10.5, fontWeight: "800", letterSpacing: 0.3 },
  historyPhrase: { color: "#172A3A", fontSize: 14, lineHeight: 19, fontWeight: "700", marginTop: 3 },
  historySummary: { color: "#6A756F", fontSize: 11.5, marginTop: 2 },
  emptyHistory: { color: "#5C6873", fontSize: 13, lineHeight: 19, textAlign: "center", paddingVertical: 15 },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.86 },
});
