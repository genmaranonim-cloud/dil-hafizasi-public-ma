import { useEffect, useState } from "react";
import { AccessibilityInfo, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import type { CelebrationEvent } from "@/lib/celebration";

export function CelebrationOverlay({ event, onFinished }: { event: CelebrationEvent | null; onFinished: () => void }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const progress = useSharedValue(0);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReducedMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReducedMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!event) return;
    progress.value = 0;
    progress.value = withTiming(1, { duration: reducedMotion ? 1 : 500, easing: Easing.out(Easing.cubic) });
    const timer = setTimeout(onFinished, reducedMotion ? 1800 : 2800);
    return () => clearTimeout(timer);
  }, [event, onFinished, progress, reducedMotion]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * -16 }, { scale: 0.92 + progress.value * 0.08 }],
  }));
  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.65 + progress.value * 0.35 }, { rotate: `${progress.value * 14}deg` }],
  }));

  if (!event) return null;

  return (
    <View pointerEvents="none" style={styles.overlay} accessibilityLiveRegion="polite">
      <Animated.View style={[styles.sparkle, styles.sparkleOne, sparkleStyle]}><Text style={styles.sparkleText}>✦</Text></Animated.View>
      <Animated.View style={[styles.sparkle, styles.sparkleTwo, sparkleStyle]}><Text style={styles.sparkleText}>✦</Text></Animated.View>
      <Animated.View style={[styles.card, event.kind === "badge" ? styles.badgeCard : styles.streakCard, cardStyle]}>
        <View style={styles.iconCircle}><Text style={styles.iconText}>{event.kind === "badge" ? "★" : "🔥"}</Text></View>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>{event.kind === "badge" ? "BAŞARI ANI" : "ÇALIŞMA SERİSİ"}</Text>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.message}>{event.message}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", top: 18, left: 18, right: 18, alignItems: "center", zIndex: 20 },
  card: { width: "100%", maxWidth: 520, minHeight: 76, borderRadius: 20, padding: 13, flexDirection: "row", alignItems: "center", shadowColor: "#15283C", shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  badgeCard: { backgroundColor: "#B64D45" },
  streakCard: { backgroundColor: "#1E3A5F" },
  iconCircle: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#F3DFA7", alignItems: "center", justifyContent: "center", marginRight: 12 },
  iconText: { color: "#754A22", fontSize: 23, fontWeight: "900" },
  copy: { flex: 1 },
  eyebrow: { color: "#FBE5C7", fontSize: 9.5, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: "#FFFDF8", fontSize: 17, fontWeight: "900", marginTop: 2 },
  message: { color: "#FFF1DD", fontSize: 12.5, lineHeight: 17, marginTop: 2 },
  sparkle: { position: "absolute", zIndex: 21 },
  sparkleOne: { top: -7, right: "25%" },
  sparkleTwo: { top: 15, left: "17%" },
  sparkleText: { color: "#F3DFA7", fontSize: 25, fontWeight: "900" },
});
