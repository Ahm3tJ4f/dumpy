import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import { ActivityIndicator } from "react-native";
import { SQLiteDatabase, SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { DATABASE_NAME } from "@/src/shared/db/client";
import * as schema from "@/src/shared/db/schema";
import { Suspense, useEffect } from "react";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import migrations from "../../drizzle/migrations";
import { YearStackHeader } from "@/src/screens/year-view/components/year-stack-header";

const queryClient = new QueryClient();

function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

SplashScreen.preventAutoHideAsync();

async function migrateDb(expoDb: SQLiteDatabase) {
  const db = drizzle(expoDb, { schema });
  await migrate(db, migrations);
}

// Dev tool: Drizzle Studio - only runs in development
function DrizzleStudioDevTools() {
  const expoDb = useSQLiteContext();
  useDrizzleStudio(expoDb);
  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "satoshi-light": require("../../assets/fonts/satoshi/Satoshi-Light.ttf"),
    "satoshi-regular": require("../../assets/fonts/satoshi/Satoshi-Regular.ttf"),
    "satoshi-medium": require("../../assets/fonts/satoshi/Satoshi-Medium.ttf"),
    "satoshi-bold": require("../../assets/fonts/satoshi/Satoshi-Bold.ttf"),
    "satoshi-italic": require("../../assets/fonts/satoshi/Satoshi-Italic.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        onInit={migrateDb}
        options={{ enableChangeListener: true }}
        useSuspense
      >
        <QueryProvider>
          <DrizzleStudioDevTools />
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />

            {/* Year View with Progressive Blur Header */}
            <Stack.Screen
              name="[year]/index"
              options={{
                header: () => <YearStackHeader />,
              }}
            />

            <Stack.Screen
              name="[year]/[month]/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="[year]/[month]/[day]"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="camera"
              options={{
                presentation: "modal",
                headerShown: false,
              }}
            />
          </Stack>
        </QueryProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
