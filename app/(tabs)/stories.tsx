import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system/legacy";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioPlayer, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import * as Speech from "expo-speech";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Image, Platform, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { formatRecordingTime, getAnalysisMimeType, getPracticePhrase } from "@/lib/audio-practice";
import { getBrowserRecordingMimeType } from "@/lib/browser-audio";
import { markLessonVisited } from "@/lib/daily-review-store";
import { recordPronunciationAttempt } from "@/lib/pronunciation-history";
import { trpc } from "@/lib/trpc";
import type { PronunciationReview } from "@/lib/pronunciation-review";
import { buildSpeechText, getStoryByLesson, STORY, type StoryLine } from "@/lib/story-memory";

const STORY_IMAGES = {
  1: require("../../assets/images/lesson-01-dilek-morning.jpg"),
  2: require("../../assets/images/lesson-02-coffee-shop.jpg"),
  3: require("../../assets/images/lesson-03-weekend-plan.jpg"),
  4: require("../../assets/images/lesson-04-grocery.jpg"),
  5: require("../../assets/images/lesson-05-directions.jpg"),
  6: require("../../assets/images/lesson-06-doctor.jpg"),
  7: require("../../assets/images/lesson-07-restaurant.jpg"),
  8: require("../../assets/images/lesson-08-hotel.jpg"),
  9: require("../../assets/images/lesson-09-interview.jpg"),
  10: require("../../assets/images/lesson-10-airport.jpg"),
  11: require("../../assets/images/lesson-11-phone-call.jpg"),
  12: require("../../assets/images/lesson-12-presentation.jpg"),
} as const;

const RATES = [
  { label: "Yavaş", value: 0.72 },
  { label: "Normal", value: 0.9 },
  { label: "Akıcı", value: 1 },
] as const;

async function audioUriToBase64(uri: string): Promise<string> {
  if (Platform.OS !== "web") {
    return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  }

  const response = await fetch(uri);
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return globalThis.btoa(binary);
}

export default function StoriesScreen() {
  const params = useLocalSearchParams<{ lesson?: string }>();
  const lessonNumber = Number(params.lesson ?? "1");
  const story = getStoryByLesson(lessonNumber) ?? STORY;
  const [showTurkish, setShowTurkish] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [rate, setRate] = useState<(typeof RATES)[number]["value"]>(0.72);
  const [practiceLineId, setPracticeLineId] = useState(story.lines[0]?.id ?? 1);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingMessage, setRecordingMessage] = useState("Cümleyi seç, sonra kendi sesinle söyle.");
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [pronunciationReview, setPronunciationReview] = useState<PronunciationReview | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [browserRecording, setBrowserRecording] = useState(false);
  const [browserRecordingMime, setBrowserRecordingMime] = useState<string | null>(null);
  const browserRecorderRef = useRef<MediaRecorder | null>(null);
  const browserChunksRef = useRef<Blob[]>([]);
  const browserAudioRef = useRef<HTMLAudioElement | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const player = useAudioPlayer(recordingUri);
  const analyzeMutation = trpc.pronunciation.analyze.useMutation();
  const practicePhrase = useMemo(() => getPracticePhrase(story, practiceLineId), [story, practiceLineId]);
  const isRecording = Platform.OS === "web" ? browserRecording : recorderState.isRecording;
  const analysisMimeType = getAnalysisMimeType(Platform.OS, browserRecordingMime ?? undefined);

  // A lesson route change must clear transient recording and review state before the next practice.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setPracticeLineId(story.lines[0]?.id ?? 1);
    setRecordingUri(null);
    setBrowserRecordingMime(null);
    setRecordingMessage("Cümleyi seç, sonra kendi sesinle söyle.");
    setRecordingError(null);
    setPronunciationReview(null);
    setAnalysisError(null);
  }, [story.id, story.lines]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    void markLessonVisited(story.lessonNumber, story.title);
  }, [story.id, story.lessonNumber, story.title]);

  useEffect(() => {
    return () => {
      void Speech.stop();
      browserRecorderRef.current?.stop();
      browserAudioRef.current?.pause();
    };
  }, []);

  const handleListen = async () => {
    await Speech.stop();
    setIsListening(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Speech.speak(buildSpeechText(story), {
      language: "en-US",
      rate,
      pitch: 1,
      onDone: () => setIsListening(false),
      onStopped: () => setIsListening(false),
      onError: () => setIsListening(false),
    });
  };

  const handleStop = async () => {
    await Speech.stop();
    setIsListening(false);
  };

  const handleStartRecording = async () => {
    setRecordingError(null);
    setRecordingMessage("Mikrofon açık · cümleyi doğal biçimde söyle.");
    try {
      if (Platform.OS === "web") {
        if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
          setRecordingError("Bu tarayıcı mikrofonlu kaydı desteklemiyor. Safari'yi güncelleyip tekrar dene.");
          setRecordingMessage("Tarayıcı kaydı kullanılamıyor.");
          return;
        }

        const supportedMime = getBrowserRecordingMimeType((mimeType) => MediaRecorder.isTypeSupported(mimeType));
        if (!supportedMime) {
          setRecordingError("Bu tarayıcı desteklenen bir ses formatı sunmuyor.");
          setRecordingMessage("Ses formatı desteklenmiyor.");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: supportedMime });
        browserChunksRef.current = [];
        setBrowserRecordingMime(supportedMime);
        setRecordingUri(null);
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) browserChunksRef.current.push(event.data);
        };
        mediaRecorder.onstop = () => {
          const blob = new Blob(browserChunksRef.current, { type: mediaRecorder.mimeType || supportedMime });
          const nextUri = URL.createObjectURL(blob);
          setRecordingUri((previousUri) => {
            if (previousUri?.startsWith("blob:")) URL.revokeObjectURL(previousUri);
            return nextUri;
          });
          stream.getTracks().forEach((track) => track.stop());
          setBrowserRecording(false);
          setRecordingMessage("Kayıt hazır · şimdi telaffuzunu analiz edebilirsin.");
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        };
        browserRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setBrowserRecording(true);
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return;
      }

      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setRecordingError("Telaffuz pratiği için mikrofon izni gerekiyor.");
        setRecordingMessage("Mikrofon izni verilmedi.");
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      setRecordingError("Mikrofon başlatılamadı. Cihaz ayarlarından mikrofon iznini kontrol et.");
      setRecordingMessage("Kayıt başlatılamadı.");
    }
  };

  const handleStopRecording = async () => {
    try {
      if (Platform.OS === "web") {
        browserRecorderRef.current?.stop();
        return;
      }

      await recorder.stop();
      setRecordingUri(recorder.uri);
      setPronunciationReview(null);
      setAnalysisError(null);
      setRecordingMessage(recorder.uri ? "Kaydın hazır · tekrar dinleyebilirsin." : "Kayıt tamamlandı.");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setRecordingError("Kayıt tamamlanamadı. Lütfen tekrar dene.");
    }
  };

  const handleAnalyzePronunciation = async () => {
    if (!recordingUri || !analysisMimeType || analyzeMutation.isPending) return;
    setAnalysisError(null);
    try {
      setRecordingMessage("Sesin analiz ediliyor · birkaç saniye sürebilir.");
      const audioBase64 = await audioUriToBase64(recordingUri);
      const review = await analyzeMutation.mutateAsync({ phrase: practicePhrase, audioBase64, mimeType: analysisMimeType });
      setPronunciationReview(review);
      void recordPronunciationAttempt({
        id: `${story.lessonNumber}-${Date.now()}`,
        lessonNumber: story.lessonNumber,
        phrase: practicePhrase,
        score: review.score,
        summary: review.summary,
        createdAt: new Date().toISOString(),
      });
      setRecordingMessage("Değerlendirme hazır · bir sonraki denemeye odaklan.");
    } catch {
      setAnalysisError("Değerlendirme yapılamadı. İnternet bağlantını kontrol edip tekrar dene.");
      setRecordingMessage("Analiz tamamlanamadı.");
    }
  };

  const handlePlayRecording = () => {
    if (!recordingUri) {
      return;
    }
    if (Platform.OS === "web") {
      browserAudioRef.current?.pause();
      const audio = new Audio(recordingUri);
      browserAudioRef.current = audio;
      void audio.play();
    } else {
      player.replace(recordingUri);
      player.play();
    }
    setRecordingMessage("Kendi sesini dinliyorsun.");
  };

  const renderLine = ({ item, index }: { item: StoryLine; index: number }) => {
    const isPracticeLine = item.id === practiceLineId;
    return (
      <View style={[styles.lineCard, isPracticeLine && styles.lineCardSelected, index === story.lines.length - 1 && styles.lastLineCard]}>
        <View style={styles.lineNumber} accessibilityLabel={`Hikâye cümlesi ${index + 1}`}>
          <Text style={styles.lineNumberText}>{index + 1}</Text>
        </View>
        <View style={styles.lineTextWrap}>
          <Text style={styles.englishText}>{item.english}</Text>
          {showTurkish ? <Text style={styles.turkishText}>{item.turkish}</Text> : null}
        </View>
        <AnimatedPressable
          accessibilityLabel={`${index + 1}. cümleyi telaffuz pratiği için seç`}
          accessibilityState={{ selected: isPracticeLine }}
          onPress={() => {
            setPracticeLineId(item.id);
            setRecordingUri(null);
            setPronunciationReview(null);
            setAnalysisError(null);
            setRecordingMessage("Cümleyi seç, sonra kendi sesinle söyle.");
          }}
          style={({ pressed }) => [styles.speakLineButton, isPracticeLine && styles.speakLineButtonSelected, pressed && styles.pressed]}
        >
          <MaterialIcons name="mic-none" size={16} color={isPracticeLine ? "#FFFDF8" : "#1E3A5F"} />
        </AnimatedPressable>
      </View>
    );
  };

  return (
    <ScreenContainer className="px-5 pt-4" edges={["top", "left", "right"]}>
      <FlatList
        data={story.lines}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderLine}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Text style={styles.kicker}>DERS {String(story.lessonNumber).padStart(2, "0")} · HİKÂYE {story.lessonNumber}</Text>
            <Text style={styles.title}>{story.title}</Text>
            <Text style={styles.subtitle}>{story.turkishTitle} · {story.level}</Text>

            <View style={styles.listeningCard}>
              <View style={styles.listeningHeader}>
                <View style={styles.headphonesIcon}>
                  <MaterialIcons name="headphones" size={26} color="#1E3A5F" />
                </View>
                <View style={styles.listeningTitleWrap}>
                  <Text style={styles.listeningEyebrow}>DİNLEME MODU</Text>
                  <Text style={styles.listeningTitle}>İngilizceyi kulakla tanı</Text>
                </View>
              </View>
              <Text style={styles.listeningDescription}>İlk turda metni takip et; her kelimeyi anlamaya veya ezberlemeye çalışma.</Text>
              <View style={styles.rateGroup} accessibilityLabel="Seslendirme hızı">
                {RATES.map((option) => (
                  <AnimatedPressable
                    key={option.label}
                    accessibilityLabel={`${option.label} okuma hızı`}
                    accessibilityState={{ selected: rate === option.value }}
                    onPress={() => setRate(option.value)}
                    style={({ pressed }) => [styles.rateButton, rate === option.value && styles.rateButtonActive, pressed && styles.pressed]}
                  >
                    <Text style={[styles.rateText, rate === option.value && styles.rateTextActive]}>{option.label}</Text>
                  </AnimatedPressable>
                ))}
              </View>
              <View style={styles.controlRow}>
                <AnimatedPressable accessibilityLabel="Hikâyeyi İngilizce dinle" onPress={() => void handleListen()} style={({ pressed }) => [styles.listenButton, pressed && styles.pressed]}>
                  <MaterialIcons name="play-arrow" size={24} color="#FFFDF8" />
                  <Text style={styles.listenButtonText}>{isListening ? "Baştan dinle" : "Dinle"}</Text>
                </AnimatedPressable>
                <AnimatedPressable accessibilityLabel="Sesli okumayı durdur" disabled={!isListening} onPress={() => void handleStop()} style={({ pressed }) => [styles.stopButton, !isListening && styles.disabledButton, pressed && isListening && styles.pressed]}>
                  <MaterialIcons name="stop" size={19} color="#1E3A5F" />
                  <Text style={styles.stopButtonText}>Durdur</Text>
                </AnimatedPressable>
              </View>
            </View>

            <View style={styles.sceneCard}>
              <Image source={STORY_IMAGES[story.lessonNumber as keyof typeof STORY_IMAGES] ?? STORY_IMAGES[1]} style={styles.sceneImage} accessibilityLabel={`${story.title} ders görseli`} />
              <View style={styles.sceneCaption}>
                <Text style={styles.sceneEyebrow}>DERS {String(story.lessonNumber).padStart(2, "0")} · GÖRSEL HAFIZA</Text>
                <Text style={styles.sceneTitle}>{story.focusWords.slice(0, 3).join(" · ")}</Text>
                <Text style={styles.sceneText}>Hikâyeyi zihninde bir görüntüyle eşleştir.</Text>
              </View>
            </View>

            <View style={styles.practiceCard}>
              <View style={styles.practiceHeader}>
                <View style={styles.micIcon}><MaterialIcons name="record-voice-over" size={24} color="#FFFDF8" /></View>
                <View style={styles.practiceTitleWrap}>
                  <Text style={styles.practiceEyebrow}>SESİNLE DENE</Text>
                  <Text style={styles.practiceTitle}>Telaffuz pratiği</Text>
                </View>
                  <Text style={styles.recordTime}>{isRecording ? "Kayıt sürüyor" : formatRecordingTime(recorderState.durationMillis)}</Text>
              </View>
              <Text style={styles.practiceInstruction}>Cümleyi seç, İngilizceyi gör ve kendi sesinle tekrar et. Amaç rahat konuşmaya alışmak.</Text>
              <View style={styles.practicePhraseBox}>
                <Text style={styles.practicePhrase}>{practicePhrase}</Text>
                <Text style={styles.practiceStatus}>{recordingMessage}</Text>
              </View>
              {recordingError ? <Text accessibilityLiveRegion="polite" style={styles.recordingError}>{recordingError}</Text> : null}
              <View style={styles.recordControlRow}>
                <AnimatedPressable
                  accessibilityLabel={isRecording ? "Telaffuz kaydını durdur" : "Telaffuz kaydını başlat"}
                  onPress={() => void (isRecording ? handleStopRecording() : handleStartRecording())}
                  style={({ pressed }) => [styles.recordButton, isRecording && styles.recordButtonActive, pressed && styles.pressed]}
                >
                  <MaterialIcons name={isRecording ? "stop" : "mic"} size={21} color="#FFFDF8" />
                  <Text style={styles.recordButtonText}>{isRecording ? "Kaydı bitir" : "Kaydet"}</Text>
                </AnimatedPressable>
                <AnimatedPressable accessibilityLabel="Telaffuz kaydını dinle" disabled={!recordingUri || isRecording} onPress={handlePlayRecording} style={({ pressed }) => [styles.playRecordingButton, (!recordingUri || isRecording) && styles.disabledButton, pressed && styles.pressed]}>
                  <MaterialIcons name="replay" size={19} color="#1E3A5F" />
                  <Text style={styles.playRecordingText}>Tekrar dinle</Text>
                </AnimatedPressable>
              </View>
              {recordingUri && analysisMimeType ? (
                <AnimatedPressable
                  accessibilityLabel="Telaffuzumu yapay zekâ ile değerlendir"
                  disabled={analyzeMutation.isPending}
                  onPress={() => void handleAnalyzePronunciation()}
                  style={({ pressed }) => [styles.analyzeButton, analyzeMutation.isPending && styles.disabledButton, pressed && styles.pressed]}
                >
                  <MaterialIcons name={analyzeMutation.isPending ? "hourglass-top" : "auto-awesome"} size={19} color="#1E3A5F" />
                  <Text style={styles.analyzeButtonText}>{analyzeMutation.isPending ? "Telaffuzun analiz ediliyor…" : "Telaffuzumu değerlendir"}</Text>
                </AnimatedPressable>
              ) : null}
              {recordingUri && !analysisMimeType ? <Text style={styles.analysisNotice}>AI değerlendirmesi, iOS veya Android uygulamasında kaydettiğin sesler için kullanılabilir.</Text> : null}
              {recordingUri && analysisMimeType ? <Text style={styles.analysisNotice}>Değerlendirme için ses kaydın güvenli sunucuya gönderilir; sonuç yaklaşık, pratik amaçlı geri bildirimdir.</Text> : null}
              {analysisError ? <Text accessibilityLiveRegion="polite" style={styles.analysisError}>{analysisError}</Text> : null}
              {pronunciationReview ? (
                <View style={styles.reviewCard} accessibilityLiveRegion="polite">
                  <View style={styles.reviewHeader}>
                    <View style={styles.scoreCircle}>
                      <Text style={styles.scoreValue}>{pronunciationReview.score}</Text>
                      <Text style={styles.scoreLabel}>/100</Text>
                    </View>
                    <View style={styles.reviewTitleWrap}>
                      <Text style={styles.reviewEyebrow}>YAKLAŞIK AI GERİ BİLDİRİMİ</Text>
                      <Text style={styles.reviewTitle}>Bir sonraki denemeye hazırsın</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewSummary}>{pronunciationReview.summary}</Text>
                  {pronunciationReview.whatWentWell.length > 0 ? (
                    <View style={styles.reviewSection}>
                      <Text style={styles.reviewSectionTitle}>İyi gidenler</Text>
                      {pronunciationReview.whatWentWell.map((item) => <Text key={item} style={styles.reviewBullet}>• {item}</Text>)}
                    </View>
                  ) : null}
                  {pronunciationReview.focusAreas.length > 0 ? (
                    <View style={styles.reviewSection}>
                      <Text style={styles.reviewSectionTitle}>Odaklanılacak yer</Text>
                      {pronunciationReview.focusAreas.map((area) => (
                        <View key={`${area.phrase}-${area.issue}`} style={styles.focusArea}>
                          <Text style={styles.focusPhrase}>{area.phrase}</Text>
                          <Text style={styles.focusIssue}>{area.issue}</Text>
                          <Text style={styles.focusTip}>İpucu: {area.tip}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  <View style={styles.nextTryBox}>
                    <MaterialIcons name="replay" size={17} color="#4E8B70" />
                    <Text style={styles.nextTryText}>{pronunciationReview.nextTry}</Text>
                  </View>
                </View>
              ) : null}
            </View>

            <View style={styles.storyHeaderRow}>
              <View>
                <Text style={styles.storyLabel}>HİKÂYE METNİ</Text>
                <Text style={styles.storyHint}>Mikrofon simgesiyle çalışacağın cümleyi seç.</Text>
              </View>
              <AnimatedPressable accessibilityLabel={showTurkish ? "Türkçe anlamları gizle" : "Türkçe anlamları göster"} accessibilityState={{ selected: showTurkish }} onPress={() => setShowTurkish((current) => !current)} style={({ pressed }) => [styles.translationButton, showTurkish && styles.translationButtonActive, pressed && styles.pressed]}>
                <MaterialIcons name={showTurkish ? "visibility" : "visibility-off"} size={17} color="#1E3A5F" />
                <Text style={styles.translationText}>{showTurkish ? "Türkçe açık" : "Türkçe kapalı"}</Text>
              </AnimatedPressable>
            </View>
          </View>
        }
        ListFooterComponent={<View style={styles.footerNote}><MaterialIcons name="lightbulb-outline" size={20} color="#A9702D" /><Text style={styles.footerText}>Metni birkaç gün yeniden dinlemek, tanıdık kalıpların daha doğal gelmesini sağlar.</Text></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 28, width: "100%", maxWidth: 980, alignSelf: "center" },
  kicker: { fontSize: 12, fontWeight: "800", letterSpacing: 1.4, color: "#B64D45", marginBottom: 8 },
  title: { color: "#172A3A", fontSize: 30, fontWeight: "800", letterSpacing: -0.5, lineHeight: 37 },
  subtitle: { color: "#5C6873", fontSize: 14, marginTop: 5, marginBottom: 20 },
  listeningCard: { backgroundColor: "#E5EEF3", borderRadius: 22, padding: 18, marginBottom: 24, borderWidth: 1, borderColor: "#C9D9E2" },
  listeningHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  headphonesIcon: { height: 46, width: 46, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: "#F3DFA7" },
  listeningTitleWrap: { flex: 1 },
  listeningEyebrow: { color: "#58718B", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  listeningTitle: { color: "#1E3A5F", fontSize: 17, fontWeight: "800", marginTop: 2 },
  listeningDescription: { color: "#40566A", fontSize: 14, lineHeight: 20, marginTop: 14, marginBottom: 15 },
  rateGroup: { flexDirection: "row", gap: 8, marginBottom: 15 },
  rateButton: { flex: 1, minHeight: 38, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#FFFDF8", borderWidth: 1, borderColor: "#D4E0E8" },
  rateButtonActive: { backgroundColor: "#1E3A5F", borderColor: "#1E3A5F" },
  rateText: { color: "#36536B", fontSize: 13, fontWeight: "700" },
  rateTextActive: { color: "#FFFDF8" },
  controlRow: { flexDirection: "row", gap: 9 },
  listenButton: { flex: 1, minHeight: 47, borderRadius: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#1E3A5F" },
  listenButtonText: { color: "#FFFDF8", fontSize: 15, fontWeight: "800" },
  stopButton: { minWidth: 104, minHeight: 47, borderRadius: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: "#FFFDF8", borderWidth: 1, borderColor: "#B7C8D5" },
  stopButtonText: { color: "#1E3A5F", fontSize: 14, fontWeight: "800" },
  disabledButton: { opacity: 0.45 },
  sceneCard: { borderRadius: 19, overflow: "hidden", backgroundColor: "#FFFDF8", borderWidth: 1, borderColor: "#E5DDCF", marginBottom: 20 },
  sceneImage: { width: "100%", height: 154 },
  sceneCaption: { padding: 13 },
  sceneEyebrow: { color: "#B64D45", fontSize: 10.5, fontWeight: "800", letterSpacing: 0.8 },
  sceneTitle: { color: "#172A3A", fontSize: 16, fontWeight: "800", marginTop: 4 },
  sceneText: { color: "#5C6873", fontSize: 12.5, marginTop: 3 },
  practiceCard: { backgroundColor: "#254D3D", borderRadius: 21, padding: 18, marginBottom: 24 },
  practiceHeader: { flexDirection: "row", alignItems: "center", gap: 11 },
  micIcon: { width: 45, height: 45, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#4E8B70" },
  practiceTitleWrap: { flex: 1 },
  practiceEyebrow: { color: "#BBD8C4", fontSize: 10.5, fontWeight: "800", letterSpacing: 0.8 },
  practiceTitle: { color: "#FFFDF8", fontSize: 18, fontWeight: "800", marginTop: 2 },
  recordTime: { color: "#F3DFA7", fontSize: 16, fontWeight: "800", fontVariant: ["tabular-nums"] },
  practiceInstruction: { color: "#DDEBE1", fontSize: 13.5, lineHeight: 19, marginTop: 14 },
  practicePhraseBox: { backgroundColor: "#F2F7F2", borderRadius: 13, padding: 13, marginTop: 14 },
  practicePhrase: { color: "#1D3B2E", fontSize: 16, fontWeight: "800", lineHeight: 22 },
  practiceStatus: { color: "#4E715C", fontSize: 12, marginTop: 5 },
  recordingError: { color: "#F6C2B9", fontSize: 12.5, lineHeight: 17, marginTop: 9 },
  recordControlRow: { flexDirection: "row", gap: 9, marginTop: 14 },
  recordButton: { flex: 1, minHeight: 47, borderRadius: 13, backgroundColor: "#B64D45", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  recordButtonActive: { backgroundColor: "#8D3733" },
  recordButtonText: { color: "#FFFDF8", fontSize: 14.5, fontWeight: "800" },
  playRecordingButton: { flex: 1, minHeight: 47, borderRadius: 13, backgroundColor: "#F3DFA7", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  playRecordingText: { color: "#1E3A5F", fontSize: 14, fontWeight: "800" },
  analyzeButton: { minHeight: 46, borderRadius: 13, backgroundColor: "#FFF2C8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 10 },
  analyzeButtonText: { color: "#1E3A5F", fontSize: 14, fontWeight: "800" },
  analysisNotice: { color: "#DDEBE1", fontSize: 11.5, lineHeight: 16, marginTop: 8 },
  analysisError: { color: "#F6C2B9", fontSize: 12.5, lineHeight: 17, marginTop: 10 },
  reviewCard: { backgroundColor: "#F4F8F3", borderRadius: 16, padding: 14, marginTop: 13, borderWidth: 1, borderColor: "#BFD7C4" },
  reviewHeader: { flexDirection: "row", alignItems: "center", gap: 11 },
  scoreCircle: { width: 58, height: 58, borderRadius: 29, backgroundColor: "#4E8B70", alignItems: "center", justifyContent: "center" },
  scoreValue: { color: "#FFFDF8", fontSize: 21, fontWeight: "800" },
  scoreLabel: { color: "#DDEBE1", fontSize: 10, fontWeight: "700", marginTop: -2 },
  reviewTitleWrap: { flex: 1 },
  reviewEyebrow: { color: "#4E8B70", fontSize: 9.5, fontWeight: "800", letterSpacing: 0.7 },
  reviewTitle: { color: "#254D3D", fontSize: 16, lineHeight: 20, fontWeight: "800", marginTop: 3 },
  reviewSummary: { color: "#385845", fontSize: 13, lineHeight: 18, marginTop: 13 },
  reviewSection: { marginTop: 12 },
  reviewSectionTitle: { color: "#254D3D", fontSize: 13, fontWeight: "800", marginBottom: 5 },
  reviewBullet: { color: "#476653", fontSize: 12.5, lineHeight: 18 },
  focusArea: { backgroundColor: "#FFFDF8", borderRadius: 10, padding: 9, marginTop: 6 },
  focusPhrase: { color: "#254D3D", fontSize: 12.5, fontWeight: "800" },
  focusIssue: { color: "#5C6873", fontSize: 12, lineHeight: 17, marginTop: 2 },
  focusTip: { color: "#4E8B70", fontSize: 12, lineHeight: 17, marginTop: 2 },
  nextTryBox: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "#E3F0E6", borderRadius: 10, padding: 9, marginTop: 12 },
  nextTryText: { flex: 1, color: "#315B40", fontSize: 12.5, lineHeight: 17, fontWeight: "700" },
  storyHeaderRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12 },
  storyLabel: { color: "#172A3A", fontSize: 17, fontWeight: "800" },
  storyHint: { color: "#5C6873", fontSize: 12.5, marginTop: 3 },
  translationButton: { minHeight: 38, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, borderRadius: 10, backgroundColor: "#FFFDF8", borderWidth: 1, borderColor: "#DFD8C7" },
  translationButtonActive: { backgroundColor: "#F3DFA7", borderColor: "#E4C77F" },
  translationText: { color: "#1E3A5F", fontSize: 12, fontWeight: "800" },
  lineCard: { flexDirection: "row", alignItems: "center", paddingVertical: 13, borderTopWidth: 1, borderTopColor: "#E4DDCF" },
  lineCardSelected: { backgroundColor: "#EDF4EF", borderRadius: 12, paddingHorizontal: 8, borderTopColor: "#B9D3C1" },
  lastLineCard: { borderBottomWidth: 1, borderBottomColor: "#E4DDCF" },
  lineNumber: { width: 28, height: 28, borderRadius: 9, backgroundColor: "#F0ECE2", alignItems: "center", justifyContent: "center", marginRight: 11, marginTop: 1 },
  lineNumberText: { color: "#67737E", fontSize: 12, fontWeight: "800" },
  lineTextWrap: { flex: 1 },
  englishText: { color: "#172A3A", fontSize: 16, lineHeight: 22, fontWeight: "700" },
  turkishText: { color: "#5C6873", fontSize: 13.5, lineHeight: 19, marginTop: 5 },
  speakLineButton: { width: 36, height: 36, borderRadius: 11, backgroundColor: "#FFFDF8", borderWidth: 1, borderColor: "#D6D0C2", alignItems: "center", justifyContent: "center", marginLeft: 8 },
  speakLineButtonSelected: { backgroundColor: "#4E8B70", borderColor: "#4E8B70" },
  footerNote: { flexDirection: "row", backgroundColor: "#F7E9C9", borderRadius: 16, padding: 15, gap: 10, marginTop: 20 },
  footerText: { flex: 1, color: "#6B5129", fontSize: 13, lineHeight: 18 },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.86 },
});
