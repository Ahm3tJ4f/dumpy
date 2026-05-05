import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Canvas,
  Group,
  Image as SkiaImage,
  RoundedRect,
  Skia,
  Text as SkiaText,
  useFont,
  useImage,
} from "@shopify/react-native-skia";
import { colors } from "@/assets/theme/colors";
import { typography } from "@/assets/theme/typography";

const DAYS_IN_MONTH = 30;
const COLS = 7;
const CELL_SIZE = 34;
const GAP = 14;
const IMG_RADIUS = 6;
const BG_SIZE = 30;
const BG_OFFSET = 2;
const BG_ROTATION = (12 * Math.PI) / 180;
const BG_SHIFT_X = 6;
const BG_SHIFT_Y = -4;
const PAD = 6;
const BG_OPACITY = 0.5;
const HEADER_HEIGHT = 28;
const WEEKDAYS_LABEL_STYLE = typography.xsMedium;
const FONT_SIZE = WEEKDAYS_LABEL_STYLE.fontSize;
const WEEKDAY_FONT = require("@/assets/fonts/satoshi/Satoshi-Bold.ttf");

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const GRID_WIDTH = COLS * CELL_SIZE + (COLS - 1) * GAP;
const ROWS = Math.ceil(DAYS_IN_MONTH / COLS);
const GRID_HEIGHT = ROWS * CELL_SIZE + (ROWS - 1) * GAP;

const SAMPLE_IMAGE_MODULES = [
  require("@/assets/images/samples/sample-1.jpeg"),
  require("@/assets/images/samples/sample-2.jpeg"),
  require("@/assets/images/samples/sample-3.jpeg"),
  require("@/assets/images/samples/sample-4.jpeg"),
  require("@/assets/images/samples/sample-5.jpeg"),
  require("@/assets/images/samples/sample-6.jpeg"),
  require("@/assets/images/samples/sample-7.jpeg"),
];

function useSampleImages() {
  return [
    useImage(SAMPLE_IMAGE_MODULES[0]),
    useImage(SAMPLE_IMAGE_MODULES[1]),
    useImage(SAMPLE_IMAGE_MODULES[2]),
    useImage(SAMPLE_IMAGE_MODULES[3]),
    useImage(SAMPLE_IMAGE_MODULES[4]),
    useImage(SAMPLE_IMAGE_MODULES[5]),
    useImage(SAMPLE_IMAGE_MODULES[6]),
  ];
}

function getPhotosForMonth(monthIndex: number) {
  const imageIndices: Record<number, number[]> = {};
  const photos = new Set<number>();

  for (let day = 1; day <= DAYS_IN_MONTH; day++) {
    const seed = (day * 17 + monthIndex * 13) % 100;
    if (seed < 40) {
      const count = seed < 8 ? 3 : seed < 20 ? 2 : 1;
      imageIndices[day] = [];
      for (let i = 0; i < count; i++) {
        const idx = (monthIndex * 7 + day * 3 + i) % 7;
        imageIndices[day].push(idx);
      }
      photos.add(day);
    }
  }

  return { photos, imageIndices };
}

function MonthGrid({ monthIndex }: { monthIndex: number }) {
  const images = useSampleImages();
  const font = useFont(WEEKDAY_FONT, FONT_SIZE);
  const { photos, imageIndices } = getPhotosForMonth(monthIndex);

  const canvasWidth = GRID_WIDTH + PAD * 2;
  const canvasHeight = GRID_HEIGHT + PAD * 2 + HEADER_HEIGHT;

  return (
    <Canvas style={{ width: canvasWidth, height: canvasHeight }}>
      <Group transform={[{ translateX: PAD }, { translateY: PAD }]}>
        {WEEKDAYS.map((label, i) => {
          const textWidth = font ? font.measureText(label).width : FONT_SIZE;
          const x = i * (CELL_SIZE + GAP) + (CELL_SIZE - textWidth) / 2;
          return (
            <SkiaText
              key={i}
              x={x}
              y={FONT_SIZE}
              text={label}
              font={font}
              color={colors.neutral[600]}
            />
          );
        })}
      </Group>
      <Group
        transform={[{ translateX: PAD }, { translateY: PAD + HEADER_HEIGHT }]}
      >
        {Array.from({ length: DAYS_IN_MONTH }, (_, i) => {
          const day = i + 1;
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const x = col * (CELL_SIZE + GAP);
          const y = row * (CELL_SIZE + GAP);

          if (!photos.has(day)) {
            return (
              <RoundedRect
                key={day}
                x={x}
                y={y}
                width={CELL_SIZE}
                height={CELL_SIZE}
                r={IMG_RADIUS}
                color={colors.neutral[100]}
              />
            );
          }

          const indices = imageIndices[day];
          const hasMultiple = indices.length > 1;
          const mainImage = images[indices[0]];
          const clipRect = Skia.RRectXY(
            Skia.XYWHRect(x, y, CELL_SIZE, CELL_SIZE),
            IMG_RADIUS,
            IMG_RADIUS,
          );

          return (
            <Group key={day}>
              {hasMultiple && images[indices[1]] && (
                <Group opacity={BG_OPACITY}>
                  <Group
                    transform={[
                      { translateX: BG_SHIFT_X },
                      { translateY: BG_SHIFT_Y },
                    ]}
                  >
                    <Group
                      transform={[{ rotate: BG_ROTATION }]}
                      origin={{
                        x: x + BG_OFFSET + BG_SIZE / 2,
                        y: y + BG_OFFSET + BG_SIZE / 2,
                      }}
                    >
                      <Group
                        clip={Skia.RRectXY(
                          Skia.XYWHRect(
                            x + BG_OFFSET,
                            y + BG_OFFSET,
                            BG_SIZE,
                            BG_SIZE,
                          ),
                          IMG_RADIUS,
                          IMG_RADIUS,
                        )}
                      >
                        <SkiaImage
                          image={images[indices[1]]}
                          x={x + BG_OFFSET}
                          y={y + BG_OFFSET}
                          width={BG_SIZE}
                          height={BG_SIZE}
                          fit="cover"
                        />
                      </Group>
                    </Group>
                  </Group>
                </Group>
              )}
              {mainImage && (
                <Group clip={clipRect}>
                  <SkiaImage
                    image={mainImage}
                    x={x}
                    y={y}
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    fit="cover"
                  />
                </Group>
              )}
            </Group>
          );
        })}
      </Group>
    </Canvas>
  );
}

export default function Index() {
  const currentMonthIndex = new Date().getMonth();
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View>
          <Text style={styles.monthTitle}>{currentMonth}</Text>
          <View style={styles.card}>
            <MonthGrid monthIndex={currentMonthIndex} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  scroll: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: colors.neutral[200],
  },
  monthTitle: {
    ...typography["2xlBold"],
    color: colors.neutral[800],
    marginBottom: 12,
  },
});
