import { Platform, StyleSheet } from "react-native";
import { colors } from "./colors";

const webTextProps = Platform.OS === "web"
  ? {
      fontSynthesis: "none" as const,
      WebkitFontSmoothing: "antialiased" as const,
      MozOsxFontSmoothing: "grayscale" as const,
    }
  : {};

function makeVariant(
  fontFamily: string,
  fontSize: number,
  lineHeight: number,
  letterSpacing: number,
) {
  return {
    fontFamily,
    fontSize,
    lineHeight,
    letterSpacing,
    color: colors.neutral[900],
    ...webTextProps,
  };
}

export const typography = StyleSheet.create({
  // xs — 12px
  xsLight: makeVariant("satoshi-light", 12, 16, 0),
  xsRegular: makeVariant("satoshi-regular", 12, 16, 0),
  xsMedium: makeVariant("satoshi-medium", 12, 16, 0),
  xsBold: makeVariant("satoshi-bold", 12, 16, 0),

  // sm — 14px
  smLight: makeVariant("satoshi-light", 14, 20, 0),
  smRegular: makeVariant("satoshi-regular", 14, 20, 0),
  smMedium: makeVariant("satoshi-medium", 14, 20, 0),
  smBold: makeVariant("satoshi-bold", 14, 20, 0),

  // base — 16px
  baseLight: makeVariant("satoshi-light", 16, 24, 0),
  baseRegular: makeVariant("satoshi-regular", 16, 24, 0),
  baseMedium: makeVariant("satoshi-medium", 16, 24, 0),
  baseBold: makeVariant("satoshi-bold", 16, 24, 0),

  // lg — 18px
  lgLight: makeVariant("satoshi-light", 18, 26, -0.1),
  lgRegular: makeVariant("satoshi-regular", 18, 26, -0.1),
  lgMedium: makeVariant("satoshi-medium", 18, 26, -0.1),
  lgBold: makeVariant("satoshi-bold", 18, 26, -0.1),

  // xl — 20px
  xlLight: makeVariant("satoshi-light", 20, 28, -0.2),
  xlRegular: makeVariant("satoshi-regular", 20, 28, -0.2),
  xlMedium: makeVariant("satoshi-medium", 20, 28, -0.2),
  xlBold: makeVariant("satoshi-bold", 20, 28, -0.2),

  // 2xl — 24px
  "2xlLight": makeVariant("satoshi-light", 24, 32, -0.4),
  "2xlRegular": makeVariant("satoshi-regular", 24, 32, -0.4),
  "2xlMedium": makeVariant("satoshi-medium", 24, 32, -0.4),
  "2xlBold": makeVariant("satoshi-bold", 24, 32, -0.4),

  // 3xl — 28px
  "3xlLight": makeVariant("satoshi-light", 28, 36, -0.6),
  "3xlRegular": makeVariant("satoshi-regular", 28, 36, -0.6),
  "3xlMedium": makeVariant("satoshi-medium", 28, 36, -0.6),
  "3xlBold": makeVariant("satoshi-bold", 28, 36, -0.6),

  // 4xl — 32px
  "4xlLight": makeVariant("satoshi-light", 32, 40, -0.8),
  "4xlRegular": makeVariant("satoshi-regular", 32, 40, -0.8),
  "4xlMedium": makeVariant("satoshi-medium", 32, 40, -0.8),
  "4xlBold": makeVariant("satoshi-bold", 32, 40, -0.8),

  // 5xl — 36px
  "5xlLight": makeVariant("satoshi-light", 36, 44, -1),
  "5xlRegular": makeVariant("satoshi-regular", 36, 44, -1),
  "5xlMedium": makeVariant("satoshi-medium", 36, 44, -1),
  "5xlBold": makeVariant("satoshi-bold", 36, 44, -1),
});
