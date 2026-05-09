import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useNormalizedSafeAreaInsets(minBottom: number = 24) {
  const insets = useSafeAreaInsets();

  return {
    ...insets,
    bottom: Math.max(insets.bottom, minBottom),
  };
}
