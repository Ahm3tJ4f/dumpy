import { useState, useEffect } from "react";
import { AccessibilityInfo } from "react-native";

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function check() {
      const enabled = await AccessibilityInfo.isReduceMotionEnabled();
      if (isMounted) setReducedMotion(enabled);
    }

    check();

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => {
        if (isMounted) setReducedMotion(enabled);
      }
    );

    return () => {
      isMounted = false;
      subscription?.remove?.();
    };
  }, []);

  return reducedMotion;
}
