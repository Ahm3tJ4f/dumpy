import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import dayjs from "dayjs";
import { colors } from "@/src/shared/theme/colors";
import { typography } from "@/src/shared/theme/typography";
import type { Photo } from "@/src/shared/db/schema";
import { groupPhotosByDay } from "../lib/group-photos";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const toSource = (uri: string | number) =>
  typeof uri === "number" ? uri : { uri };

interface Cell {
  day: number | null;
  photos: Photo[];
}

const buildMonthGrid = (monthKey: string, photos: Photo[]): Cell[][] => {
  const date = dayjs(monthKey);
  const firstDayOfWeek = (date.day() + 6) % 7;
  const daysInMonth = date.daysInMonth();
  const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;

  const byDay = groupPhotosByDay(photos);

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayIndex = i - firstDayOfWeek + 1;

    if (dayIndex < 1 || dayIndex > daysInMonth) {
      return { day: null, photos: [] };
    }

    const dateKey = date.date(dayIndex).format("YYYY-MM-DD");
    return { day: dayIndex, photos: byDay.get(dateKey) ?? [] };
  });

  // TODO check later if we can go flat list instead of 2D
  return Array.from({ length: totalCells / 7 }, (_, i) =>
    cells.slice(i * 7, i * 7 + 7),
  );
};

function WeekdaysRow() {
  return (
    <View style={styles.weekdayRow}>
      {WEEKDAYS.map((label) => (
        <Text key={label} style={styles.weekdayLabel}>
          {label}
        </Text>
      ))}
    </View>
  );
}

interface MonthGridProps {
  monthKey: string;
  photos: Photo[];
}

export function MonthGrid({ monthKey, photos }: MonthGridProps) {
  const rows = buildMonthGrid(monthKey, photos);

  return (
    <View style={styles.card}>
      <WeekdaysRow />
      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, cellIndex) => {
              if (cell.day === null) {
                return <View key={cellIndex} style={styles.cell} />;
              }

              if (cell.photos.length === 0) {
                return (
                  <View key={cellIndex} style={styles.cell}>
                    <View style={styles.emptyCell} />
                  </View>
                );
              }

              return (
                <View key={cellIndex} style={styles.cell}>
                  {cell.photos.length > 1 && (
                    <View style={styles.bgImageWrapper}>
                      <Image
                        source={toSource(cell.photos[1].uri)}
                        style={styles.bgImage}
                        contentFit="cover"
                      />
                    </View>
                  )}
                  <View style={styles.imageCell}>
                    <Image
                      source={toSource(cell.photos[0].uri)}
                      style={styles.image}
                      contentFit="cover"
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 4,
    borderWidth: 0.5,
    borderColor: colors.neutral[200],
    justifyContent: "center",
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 3,
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  weekdayLabel: {
    ...typography.xsMedium,
    flex: 1,
    maxWidth: 40,
    lineHeight: 40,
    textAlign: "center",
    color: colors.neutral[700],
  },
  grid: {
    gap: 8,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 40,
    maxHeight: 40,
  },
  emptyCell: {
    flex: 1,
    backgroundColor: colors.neutral[100],
    borderWidth: 0.5,
    borderColor: colors.neutral[200],
    borderRadius: 6,
  },
  imageCell: {
    flex: 1,
    borderRadius: 6,
    overflow: "hidden",
  },
  bgImageWrapper: {
    position: "absolute",
    right: -2,
    top: -2,
    width: 36,
    height: 36,
    borderRadius: 6,
    overflow: "hidden",
    opacity: 0.5,
    transform: [
      { translateX: 2 },
      { translateY: -2 },
      { rotate: `${(5 * Math.PI) / 180}rad` },
    ],
    transformOrigin: "center",
  },
  image: {
    flex: 1,
    width: 40,
    height: 40,
  },
  bgImage: {
    width: 36,
    height: 36,
  },
});
