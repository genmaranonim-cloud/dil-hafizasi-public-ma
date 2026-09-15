import { useEffect, useState } from "react";
import { AccessibilityInfo, Pressable, type PressableProps } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { getPressMotionSpec } from "@/lib/motion";

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

export function AnimatedPressable({ onPressIn, onPressOut, style, ...props }: PressableProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const pressed = useSharedValue(0);
  const motion = getPressMotionSpec(reducedMotion);

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

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(pressed.value ? motion.pressedOpacity : 1, {
      duration: pressed.value ? motion.pressDuration : motion.releaseDuration,
      easing: Easing.out(Easing.cubic),
    }),
    transform: [
      {
        scale: withTiming(pressed.value ? motion.pressedScale : 1, {
          duration: pressed.value ? motion.pressDuration : motion.releaseDuration,
          easing: Easing.out(Easing.cubic),
        }),
      },
    ],
  }), [motion.pressedOpacity, motion.pressedScale, motion.pressDuration, motion.releaseDuration]);

  return (
    <AnimatedPressableBase
      {...props}
      style={[style, animatedStyle]}
      onPressIn={(event) => {
        pressed.value = 1;
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.value = 0;
        onPressOut?.(event);
      }}
    />
  );
}
