import { View, Text, StyleSheet, FlatList } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { colors } from "@/src/shared/theme/colors";
import { typography } from "@/src/shared/theme/typography";
import { MonthGrid } from "./components/month-grid";
import { useNormalizedSafeAreaInsets } from "@/src/shared/hooks/use-normalized-safe-area-insets";
import { useQuery } from "@tanstack/react-query";
import { groupPhotosByMonth } from "./lib/group-photos";
import { getPhotosByYear } from "./queries/get-photos-by-year";
import { Footer } from "./components/footer";
import { useReducedMotion } from "@/src/shared/hooks/use-reduced-motion";

const ENTERING_DELAY = 50;
const ENTERING_DURATION = 260;

function buildMonthsData(photos: any[], year: string) {
  const byMonth = groupPhotosByMonth(photos);
  const isCurrentYear = parseInt(year) === dayjs().year();
  const monthsToShow = isCurrentYear ? dayjs().month() + 1 : 12;

  return Array.from({ length: monthsToShow }, (_, i) => {
    const date = dayjs().year(parseInt(year)).month(i);
    const monthKey = date.format("YYYY-MM");
    return {
      monthKey,
      photos: byMonth.get(monthKey) ?? [],
    };
  });
}

interface MonthSectionProps {
  item: {
    monthKey: string;
    photos: any[];
  };
  index: number;
}

const MonthSection = memo(function MonthSection({ item, index }: MonthSectionProps) {
  const progress = useSharedValue(0);
  const [showImages, setShowImages] = useState(false);
  const hasAnimated = useRef(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    if (reducedMotion) {
      progress.value = 1;
      setShowImages(true);
      return;
    }

    progress.value = withDelay(
      index * ENTERING_DELAY,
      withTiming(
        1,
        { duration: ENTERING_DURATION, easing: Easing.out(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(setShowImages)(true);
        },
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * 16 },
      { scale: 0.97 + progress.value * 0.03 },
    ],
  }));

  return (
    <Animated.View style={[styles.monthSection, animatedStyle]}>
      <Text style={styles.monthTitle}>
        {dayjs(item.monthKey).format("MMMM")}
      </Text>
      <MonthGrid
        monthKey={item.monthKey}
        photos={item.photos}
        showImages={showImages}
      />
    </Animated.View>
  );
});

export function YearViewScreen() {
  const { year } = useLocalSearchParams<{ year: string }>();
  const insets = useNormalizedSafeAreaInsets();
  const router = useRouter();
  const selectedYear = parseInt(year);
  const currentYear = dayjs().year();

  const swipeGesture = useMemo(
    () =>
      Gesture.Exclusive(
        Gesture.Fling()
          .direction(1)
          .onEnd(() => {
            if (selectedYear > 2025) {
              runOnJS(router.setParams)({ year: (selectedYear - 1).toString() });
            }
          }),
        Gesture.Fling()
          .direction(2)
          .onEnd(() => {
            if (selectedYear < currentYear) {
              runOnJS(router.setParams)({ year: (selectedYear + 1).toString() });
            }
          }),
      ),
    [selectedYear, currentYear, router],
  );

  const { data: photos = [] } = useQuery({
    queryKey: ["photos", "year", year],
    queryFn: () => getPhotosByYear(year),
  });

  const monthsData = useMemo(
    () => buildMonthsData(photos, year),
    [photos, year],
  );
  const reversedMonths = useMemo(() => [...monthsData].reverse(), [monthsData]);

  const renderMonthGrid = useCallback(
    ({ item, index }: { item: (typeof monthsData)[0]; index: number }) => (
      <MonthSection item={item} index={index} />
    ),
    [],
  );

  return (
<GestureDetector gesture={swipeGesture}>
      <View style={styles.container}>
        <FlatList
          inverted
          data={reversedMonths}
          renderItem={renderMonthGrid}
          keyExtractor={(item) => item.monthKey}
          windowSize={3}
          initialNumToRender={2}
          maxToRenderPerBatch={1}
          updateCellsBatchingPeriod={100}
          removeClippedSubviews={true}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.top + 36, paddingTop: insets.bottom + 110 },
          ]}
        />
        <Footer />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  scrollContent: {
    padding: 16,
    gap: 32,
  },
  monthSection: {
    gap: 8,
  },
  monthTitle: {
    ...typography["xlBold"],
    color: colors.neutral[800],
  },
});
