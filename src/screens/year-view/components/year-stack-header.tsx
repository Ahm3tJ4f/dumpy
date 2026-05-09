import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CaretLeftIcon, CaretRightIcon } from "phosphor-react-native";
import { useRouter, useGlobalSearchParams } from "expo-router";
import dayjs from "dayjs";
import { typography } from "@/assets/theme/typography";
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
        { height: insets.top + 60, paddingTop: insets.top },
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
        {/*<View style={{ flex: 1, backgroundColor: "red" }}></View>*/}
      </MaskedView>
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.content,
          { paddingTop: insets.top },
        ]}
      >
        <TouchableOpacity
          onPress={handlePreviousYear}
          disabled={isPreviousDisabled}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <CaretLeftIcon
            size={24}
            weight="bold"
            color={
              isPreviousDisabled ? colors.neutral[300] : colors.neutral[900]
            }
          />
        </TouchableOpacity>
        <Text style={styles.selectedYear}>{selectedYear}</Text>
        <TouchableOpacity
          onPress={handleNextYear}
          disabled={isNextDisabled}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <CaretRightIcon
            size={24}
            weight="bold"
            color={isNextDisabled ? colors.neutral[500] : colors.neutral[900]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  content: {
    position: "absolute",
    paddingHorizontal: 90,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  selectedYear: {
    ...typography["xlBold"],
  },
});
