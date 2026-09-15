import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { loadStoryProgress, saveStoryProgress } from "@/lib/progress-store";
import {
  completeStage,
  createInitialProgress,
  getCompletionPercent,
  getNextStage,
  isStageUnlocked,
  MEMORY_STAGE_DETAILS,
  STORY,
  type MemoryStage,
  type MemoryStageId,
  type StoryProgress,
} from "@/lib/story-memory";

const MEMORY_IMAGE = require("../../assets/images/memory-practice-desk.jpg");

export default function MemoryScreen() {
  const [progress, setProgress] = useState<StoryProgress>(createInitialProgress());
  const [activeStageId, setActiveStageId] = useState<MemoryStageId>("meet");
  const [isLoading, setIsLoading] = useState(true);
  const [revealedStageId, setRevealedStageId] = useState<MemoryStageId | null>(null);
  const [saveState, setSaveState] = useState("İlerlemen bu cihazda saklanır.");

  useEffect(() => {
    const restoreProgress = async () => {
      const storedProgress = await loadStoryProgress();
      setProgress(storedProgress);
      setActiveStageId(getNextStage(storedProgress) ?? "recall");
      setIsLoading(false);
    };

    void restoreProgress();
  }, []);

  const activeStage = useMemo(
    () => MEMORY_STAGE_DETAILS.find((stage) => stage.id === activeStageId) ?? MEMORY_STAGE_DETAILS[0],
    [activeStageId],
  );
  const completionPercent = getCompletionPercent(progress);
  const activeComplete = progress.completedStageIds.includes(activeStage.id);
  const canComplete = isStageUnlocked(progress, activeStage.id) && !activeComplete;

  const showAnswer = revealedStageId === activeStage.id;

  const completeActiveStage = async () => {
    if (!canComplete) {
      return;
    }

    const nextProgress = completeStage(progress, activeStage.id);
    setProgress(nextProgress);
    setSaveState("Aşama tamamlandı · İlerlemen kaydedildi.");
    await saveStoryProgress(nextProgress);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const nextStage = getNextStage(nextProgress);
    if (nextStage) {
      setActiveStageId(nextStage);
    }
  };

  const resetProgress = async () => {
    const initialProgress = createInitialProgress();
    setProgress(initialProgress);
    setActiveStageId("meet");
    setRevealedStageId(null);
    setSaveState("İlerleme sıfırlandı. Hikâyeyle yeniden tanışabilirsin.");
    await saveStoryProgress(initialProgress);
  };

  const renderStage = ({ item, index }: { item: MemoryStage; index: number }) => {
    const stageComplete = progress.completedStageIds.includes(item.id);
    const unlocked = isStageUnlocked(progress, item.id);
    const selected = item.id === activeStageId;

    return (
      <AnimatedPressable
        accessibilityLabel={`${item.title} aşaması, ${stageComplete ? "tamamlandı" : unlocked ? "açık" : "kilitli"}`}
        accessibilityState={{ disabled: !unlocked, selected }}
        disabled={!unlocked}
        onPress={() => setActiveStageId(item.id)}
        style={({ pressed }) => [
          styles.stageCard,
          selected && styles.stageCardSelected,
          !unlocked && styles.stageCardLocked,
          pressed && unlocked && styles.pressed,
        ]}
      >
        <View style={[styles.stageNumber, selected && styles.stageNumberSelected, !unlocked && styles.stageNumberLocked]}>
          {stageComplete ? (
            <MaterialIcons name="check" size={18} color={selected ? "#FFFDF8" : "#4E8B70"} />
          ) : !unlocked ? (
            <MaterialIcons name="lock-outline" size={16} color="#85909A" />
          ) : (
            <Text style={[styles.stageNumberText, selected && styles.stageNumberTextSelected]}>{index + 1}</Text>
          )}
        </View>
        <View style={styles.stageTextWrap}>
          <Text style={[styles.stageTitle, selected && styles.stageTitleSelected, !unlocked && styles.stageTitleLocked]}>{item.title}</Text>
          <Text style={[styles.stageDescription, !unlocked && styles.stageDescriptionLocked]}>{item.description}</Text>
        </View>
        <Text style={[styles.stageDuration, selected && styles.stageDurationSelected, !unlocked && styles.stageDurationLocked]}>{item.duration}</Text>
      </AnimatedPressable>
    );
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center" edges={["top", "left", "right"]}>
        <ActivityIndicator size="large" color="#1E3A5F" />
        <Text style={styles.loadingText}>Hafıza yolun hazırlanıyor…</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="px-5 pt-4" edges={["top", "left", "right"]}>
      <FlatList
        data={[...MEMORY_STAGE_DETAILS]}
        keyExtractor={(item) => item.id}
        renderItem={renderStage}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Text style={styles.kicker}>DİL HAFIZASI · DERS 01</Text>
            <Text style={styles.title}>Hikâyeyi test etme.{`\n`}Onunla tanışma.</Text>
            <Text style={styles.subtitle}>Aynı doğal İngilizceyi gör, duy, söyle ve sakin biçimde geri çağır.</Text>

            <View style={styles.memorySceneCard}>
              <Image source={MEMORY_IMAGE} style={styles.memorySceneImage} accessibilityLabel="Yetişkin öğrenci evde İngilizce çalışıyor" />
              <View style={styles.memorySceneCaption}>
                <Text style={styles.memorySceneEyebrow}>DERS 01 · HAFIZA MASASI</Text>
                <Text style={styles.memorySceneText}>Dinle · söyle · hatırla</Text>
              </View>
            </View>

            <View style={styles.progressCard}>
              <View style={styles.progressTopRow}>
                <View>
                  <Text style={styles.progressEyebrow}>DERS {String(STORY.lessonNumber).padStart(2, "0")} · {STORY.title.toUpperCase()}</Text>
                  <Text style={styles.progressTitle}>{completionPercent}% yerleşti</Text>
                </View>
                <View style={styles.progressBadge}>
                  <Text style={styles.progressBadgeText}>{progress.completedStageIds.length}/5</Text>
                </View>
              </View>
              <View style={styles.progressTrack} accessibilityLabel={`İlerleme yüzde ${completionPercent}`}>
                <View style={[styles.progressFill, { width: `${completionPercent}%` }]} />
              </View>
              <Text style={styles.progressHelper}>{saveState}</Text>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Bugünün hafıza yolu</Text>
              <Text style={styles.sectionSubtitle}>Aşamalar sırayla açılır</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <View>
            <View style={styles.activityCard}>
              <View style={styles.activityEyebrowRow}>
                <Text style={styles.activityEyebrow}>{activeStage.eyebrow}</Text>
                {activeComplete ? <Text style={styles.completeTag}>TAMAMLANDI</Text> : null}
              </View>
              <Text style={styles.activityTitle}>{activeStage.title}</Text>
              <Text style={styles.activityPrompt}>{activeStage.prompt}</Text>

              {activeStage.id === "chunk" ? (
                <View style={styles.chunkRow}>
                  {STORY.lines[3].chunks?.map((chunk) => (
                    <View key={chunk} style={styles.chunkPill}>
                      <Text style={styles.chunkText}>{chunk}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {activeStage.id === "complete" ? (
                <View style={styles.exerciseBox}>
                  <Text style={styles.exerciseLabel}>KÜÇÜK HATIRLAMA</Text>
                  <Text style={styles.exerciseQuestion}>Could you ____ me, please?</Text>
                  <AnimatedPressable
                    accessibilityLabel="Kelime tamamlama cevabını göster"
                    onPress={() => setRevealedStageId(activeStage.id)}
                    style={({ pressed }) => [styles.answerButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.answerButtonText}>{showAnswer ? "Cevap: help" : "Cevabı göster"}</Text>
                  </AnimatedPressable>
                </View>
              ) : null}

              {activeStage.id === "recall" ? (
                <View style={styles.exerciseBox}>
                  <Text style={styles.exerciseLabel}>TÜRKÇEDEN HATIRLA</Text>
                  <Text style={styles.exerciseQuestion}>“Şimdi raporumu bitirebilirim.”</Text>
                  <AnimatedPressable
                    accessibilityLabel="İngilizce cümleyi göster"
                    onPress={() => setRevealedStageId(activeStage.id)}
                    style={({ pressed }) => [styles.answerButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.answerButtonText}>{showAnswer ? "Now I can finish my report." : "Cevabı göster"}</Text>
                  </AnimatedPressable>
                </View>
              ) : null}

              <AnimatedPressable
                accessibilityLabel={activeComplete ? `${activeStage.title} aşaması tamamlandı` : `${activeStage.title} aşamasını tamamla`}
                accessibilityState={{ disabled: !canComplete }}
                disabled={!canComplete}
                onPress={() => void completeActiveStage()}
                style={({ pressed }) => [styles.completeButton, !canComplete && styles.completeButtonDisabled, pressed && canComplete && styles.pressed]}
              >
                <MaterialIcons name={activeComplete ? "check-circle" : "check-circle-outline"} size={21} color={canComplete ? "#FFFDF8" : "#75838F"} />
                <Text style={[styles.completeButtonText, !canComplete && styles.completeButtonTextDisabled]}>
                  {activeComplete ? "Bu aşama tamamlandı" : "Bu aşamayı tamamla"}
                </Text>
              </AnimatedPressable>
            </View>

            <AnimatedPressable
              accessibilityLabel="Hikâye ilerlemesini sıfırla"
              onPress={() => void resetProgress()}
              style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
            >
              <MaterialIcons name="restart-alt" size={18} color="#5C6873" />
              <Text style={styles.resetText}>Bu hikâyeyi baştan çalış</Text>
            </AnimatedPressable>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 28, width: "100%", maxWidth: 980, alignSelf: "center" },
  loadingText: { marginTop: 12, color: "#5C6873", fontSize: 14, fontWeight: "600" },
  kicker: { color: "#B64D45", fontSize: 12, fontWeight: "800", letterSpacing: 1.4, marginBottom: 8 },
  title: { color: "#172A3A", fontSize: 29, fontWeight: "800", lineHeight: 36, letterSpacing: -0.4 },
  subtitle: { color: "#5C6873", fontSize: 14.5, lineHeight: 21, marginTop: 8, marginBottom: 19 },
  memorySceneCard: { borderRadius: 19, overflow: "hidden", backgroundColor: "#FFFDF8", borderWidth: 1, borderColor: "#E5DDCF", marginBottom: 20 },
  memorySceneImage: { width: "100%", height: 153 },
  memorySceneCaption: { paddingHorizontal: 14, paddingVertical: 11, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  memorySceneEyebrow: { color: "#B64D45", fontSize: 10.5, fontWeight: "800", letterSpacing: 0.75 },
  memorySceneText: { color: "#4E8B70", fontSize: 12.5, fontWeight: "800" },
  progressCard: { backgroundColor: "#1E3A5F", borderRadius: 22, padding: 19, marginBottom: 25 },
  progressTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  progressEyebrow: { color: "#C8DAE7", fontSize: 10.5, fontWeight: "800", letterSpacing: 0.75 },
  progressTitle: { color: "#FFFDF8", fontSize: 22, fontWeight: "800", marginTop: 4 },
  progressBadge: { backgroundColor: "#F3DFA7", minWidth: 46, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  progressBadgeText: { color: "#1E3A5F", fontSize: 14, fontWeight: "800" },
  progressTrack: { height: 9, borderRadius: 999, backgroundColor: "#4B6684", overflow: "hidden", marginTop: 18 },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: "#85C2A2" },
  progressHelper: { color: "#D7E5EE", fontSize: 12.5, marginTop: 9 },
  sectionHeader: { marginBottom: 11 },
  sectionTitle: { color: "#172A3A", fontSize: 18, fontWeight: "800" },
  sectionSubtitle: { color: "#5C6873", fontSize: 12.5, marginTop: 3 },
  stageCard: { backgroundColor: "#FFFDF8", borderRadius: 17, padding: 14, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E5DDCF", marginBottom: 9 },
  stageCardSelected: { backgroundColor: "#E7EFF4", borderColor: "#9FBACD", borderWidth: 1.5 },
  stageCardLocked: { backgroundColor: "#F1EEE7", borderColor: "#E2DDD3" },
  stageNumber: { width: 37, height: 37, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#E7F1EB", marginRight: 12 },
  stageNumberSelected: { backgroundColor: "#1E3A5F" },
  stageNumberLocked: { backgroundColor: "#E3E0D9" },
  stageNumberText: { color: "#4E8B70", fontSize: 15, fontWeight: "800" },
  stageNumberTextSelected: { color: "#FFFDF8" },
  stageTextWrap: { flex: 1 },
  stageTitle: { color: "#172A3A", fontSize: 16, fontWeight: "800", marginBottom: 3 },
  stageTitleSelected: { color: "#1E3A5F" },
  stageTitleLocked: { color: "#7D858B" },
  stageDescription: { color: "#5C6873", fontSize: 12.5, lineHeight: 17, paddingRight: 8 },
  stageDescriptionLocked: { color: "#92979B" },
  stageDuration: { color: "#4E8B70", fontSize: 12, fontWeight: "800" },
  stageDurationSelected: { color: "#1E3A5F" },
  stageDurationLocked: { color: "#92979B" },
  activityCard: { marginTop: 15, backgroundColor: "#F7E9C9", borderRadius: 21, padding: 19 },
  activityEyebrowRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  activityEyebrow: { color: "#87642B", fontSize: 11, fontWeight: "800", letterSpacing: 0.75 },
  completeTag: { color: "#3B6E57", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  activityTitle: { color: "#4A371B", fontSize: 23, fontWeight: "800", marginTop: 6, marginBottom: 8 },
  activityPrompt: { color: "#614A27", fontSize: 14.5, lineHeight: 21 },
  chunkRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 16 },
  chunkPill: { backgroundColor: "#FFF8E9", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: "#E8D3A6" },
  chunkText: { color: "#614A27", fontSize: 13, fontWeight: "700" },
  exerciseBox: { marginTop: 15, backgroundColor: "#FFF8E9", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#E8D3A6" },
  exerciseLabel: { color: "#9A7436", fontSize: 10.5, fontWeight: "800", letterSpacing: 0.75 },
  exerciseQuestion: { color: "#4A371B", fontSize: 17, fontWeight: "800", marginTop: 6 },
  exerciseAnswer: { color: "#4E8B70", fontSize: 14, fontWeight: "700", marginTop: 7 },
  answerButton: { alignSelf: "flex-start", minHeight: 36, justifyContent: "center", paddingHorizontal: 10, borderRadius: 10, backgroundColor: "#F2E2B8", marginTop: 10 },
  answerButtonText: { color: "#614A27", fontSize: 13, fontWeight: "800" },
  completeButton: { minHeight: 48, marginTop: 18, borderRadius: 14, backgroundColor: "#1E3A5F", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  completeButtonDisabled: { backgroundColor: "#E2E2DD" },
  completeButtonText: { color: "#FFFDF8", fontSize: 15, fontWeight: "800" },
  completeButtonTextDisabled: { color: "#75838F" },
  resetButton: { marginTop: 15, alignSelf: "center", minHeight: 42, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12 },
  resetText: { color: "#5C6873", fontSize: 13, fontWeight: "700" },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.86 },
});
