import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "satoshi-light": require("../../assets/fonts/satoshi/Satoshi-Light.ttf"),
    "satoshi-regular": require("../../assets/fonts/satoshi/Satoshi-Regular.ttf"),
    "satoshi-medium": require("../../assets/fonts/satoshi/Satoshi-Medium.ttf"),
    "satoshi-bold": require("../../assets/fonts/satoshi/Satoshi-Bold.ttf"),
    "satoshi-italic": require("../../assets/fonts/satoshi/Satoshi-Italic.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="camera" />
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
