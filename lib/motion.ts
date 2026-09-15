export type PressMotionSpec = {
  pressedScale: number;
  pressedOpacity: number;
  pressDuration: number;
  releaseDuration: number;
};

export type ScreenTransitionSpec = {
  animation: "fade";
  duration: number;
};

export function getPressMotionSpec(reducedMotion: boolean): PressMotionSpec {
  if (reducedMotion) {
    return {
      pressedScale: 1,
      pressedOpacity: 0.82,
      pressDuration: 80,
      releaseDuration: 140,
    };
  }

  return {
    pressedScale: 0.97,
    pressedOpacity: 0.92,
    pressDuration: 90,
    releaseDuration: 180,
  };
}

export function getScreenTransitionSpec(): ScreenTransitionSpec {
  return {
    animation: "fade",
    duration: 220,
  };
}
