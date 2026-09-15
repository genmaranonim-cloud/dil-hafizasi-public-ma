import { describe, expect, test } from "vitest";

import { getPressMotionSpec, getScreenTransitionSpec } from "../../lib/motion";

describe("motion policy", () => {
  test("keeps normal press feedback subtle and under the UI motion budget", () => {
    const spec = getPressMotionSpec(false);

    expect(spec.pressedScale).toBe(0.97);
    expect(spec.pressDuration).toBeLessThan(160);
    expect(spec.releaseDuration).toBeLessThan(300);
  });

  test("removes movement while preserving gentle opacity feedback for reduced motion", () => {
    const spec = getPressMotionSpec(true);

    expect(spec.pressedScale).toBe(1);
    expect(spec.pressedOpacity).toBeLessThan(1);
    expect(spec.pressDuration).toBeLessThanOrEqual(160);
  });

  test("uses a short fade for route transitions", () => {
    const spec = getScreenTransitionSpec();

    expect(spec.animation).toBe("fade");
    expect(spec.duration).toBeLessThan(300);
  });
});
