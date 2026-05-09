import { View, Text, StyleSheet, FlatList } from "react-native";
import dayjs from "dayjs";
import { useLocalSearchParams } from "expo-router";
import { colors } from "@/src/shared/theme/colors";
import { typography } from "@/src/shared/theme/typography";
import { MonthGrid } from "./components/month-grid";
import { useNormalizedSafeAreaInsets } from "@/src/shared/hooks/use-normalized-safe-area-insets";
import { useQuery } from "@tanstack/react-query";
import { groupPhotosByMonth } from "./lib/group-photos";
import { getPhotosByYear } from "./queries/get-photos-by-year";
import { Footer } from "./components/footer";

function buildMonthsData(photos: any[], year: string) {
  const byMonth = groupPhotosByMonth(photos);
  const isCurrentYear = parseInt(year) === dayjs().year();
  const monthsToShow = isCurrentYear ? dayjs().month() + 1 : 12;

  return Array.from({ length: monthsToShow }, (_, i) => {
    const date = dayjs().year(parseInt(year)).month(i);
    const monthKey = date.format("YYYY-MM");
    return {
      monthKey: monthKey,
      photos: byMonth.get(monthKey) ?? [],
    };
  });
}

export function YearViewScreen() {
  const { year } = useLocalSearchParams<{ year: string }>();
  const insets = useNormalizedSafeAreaInsets();

  const { data: photos = [] } = useQuery({
    queryKey: ["photos", "year", year],
    queryFn: () => getPhotosByYear(year),
  });

  const monthsData = buildMonthsData(photos, year);

  const renderMonthGrid = ({ item }: { item: (typeof monthsData)[0] }) => (
    <View style={styles.monthSection}>
      <Text style={styles.monthTitle}>
        {dayjs(item.monthKey).format("MMMM")}
      </Text>
      <MonthGrid monthKey={item.monthKey} photos={item.photos} />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        inverted
        data={[...monthsData].reverse()}
        renderItem={renderMonthGrid}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.top + 36, paddingTop: insets.bottom + 110 },
        ]}
        keyExtractor={(item) => item.monthKey}
      />
      <Footer />
    </View>
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
