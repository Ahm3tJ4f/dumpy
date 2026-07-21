import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { CaretLeftIcon, CaretRightIcon } from "phosphor-react-native";
import { useRouter, useGlobalSearchParams } from "expo-router";
import dayjs from "dayjs";
import { typography } from "@/src/shared/theme/typography";
import { useNormalizedSafeAreaInsets } from "@/src/shared/hooks/use-normalized-safe-area-insets";
import { colors } from "@/src/shared/theme/colors";

export function YearStackHeader() {
  const insets = useNormalizedSafeAreaInsets();
  const router = useRouter();
  const { year } = useGlobalSearchParams<{ year: string }>();
  const selectedYear = parseInt(year);
  const currentYear = dayjs().year();

  const handlePreviousYear = () => {
    router.setParams({ year: (selectedYear - 1).toString() });
  };

  const handleNextYear = () => {
    if (selectedYear < currentYear) {
      router.setParams({ year: (selectedYear + 1).toString() });
    }
  };

  const isNextDisabled = selectedYear >= currentYear;
  const isPreviousDisabled = selectedYear <= 2025;

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { height: insets.top + 64 },
        styles.container,
      ]}
    >
      <MaskedView
        style={StyleSheet.absoluteFill}
        maskElement={
          <LinearGradient
            colors={["#000000", "green", "transparent"]}
            locations={[0, 0.6]}
            style={{ flex: 1 }}
          />
        }
      >
        <BlurView intensity={25} style={{ flex: 1 }} tint="light" />
      </MaskedView>
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <Pressable
          onPress={handlePreviousYear}
          disabled={isPreviousDisabled}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={({ pressed }) => [
            styles.iconButton,
            isPreviousDisabled && styles.iconButtonDisabled,
            {
              transform: [{ scale: pressed && !isPreviousDisabled ? 0.96 : 1 }],
            },
          ]}
          android_ripple={{ color: "rgba(0,0,0,0.1)", borderless: true }}
        >
          <CaretLeftIcon
            size={20}
            weight="regular"
            color={
              isPreviousDisabled ? colors.neutral[400] : colors.neutral[700]
            }
          />
        </Pressable>
        <Text style={styles.selectedYear}>{selectedYear}</Text>
        <Pressable
          onPress={handleNextYear}
          disabled={isNextDisabled}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={({ pressed }) => [
            styles.iconButton,
            isNextDisabled && styles.iconButtonDisabled,
            { transform: [{ scale: pressed && !isNextDisabled ? 0.96 : 1 }] },
          ]}
          android_ripple={{ color: "rgba(0,0,0,0.1)", borderless: true }}
        >
          <CaretRightIcon
            size={20}
            weight="regular"
            color={isNextDisabled ? colors.neutral[400] : colors.neutral[700]}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  content: {
    paddingHorizontal: 90,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedYear: {
    ...typography["2xlBold"],
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: colors.neutral[200],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: colors.neutral[300],
  },
  iconButtonDisabled: {
    opacity: 0.8,
  },
});
