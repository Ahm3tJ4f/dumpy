import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CameraIcon, GearIcon, UploadSimpleIcon } from "phosphor-react-native";
import { useNormalizedSafeAreaInsets } from "@/src/shared/hooks/use-normalized-safe-area-insets";
import { colors } from "@/src/shared/theme/colors";
import { db } from "@/src/shared/db/client";
import { photos as photosTable, type Photo } from "@/src/shared/db/schema";
import { getPhotosByYear } from "../queries/get-photos-by-year";

function getTodayPhotos(photos: Photo[]) {
  const today = dayjs().startOf("day");
  return photos.filter((p) => dayjs.unix(p.createdAt).isSame(today, "day"));
}

async function savePhotos(uris: string[], sortOrder: number) {
  const entries = uris.map((uri) => ({
    uri,
    sortOrder,
  }));
  await db.insert(photosTable).values(entries);
}

export function Footer() {
  const insets = useNormalizedSafeAreaInsets();
  const { year } = useLocalSearchParams<{ year: string }>();
  const queryClient = useQueryClient();

  const { data: photos = [] } = useQuery({
    queryKey: ["photos", "year", year],
    queryFn: () => getPhotosByYear(year),
  });

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      allowsEditing: false,
    });

    if (result.canceled) return;

    const todayPhotos = getTodayPhotos(photos);
    await savePhotos([result.assets[0].uri], todayPhotos.length);
    queryClient.invalidateQueries({ queryKey: ["photos", "year", year] });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleImageUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 1,
      allowsEditing: false,
      allowsMultipleSelection: true,
    });
    if (result.canceled) return;

    const todayPhotos = getTodayPhotos(photos);
    const uris = result.assets.map((asset) => asset.uri);
    await savePhotos(uris, todayPhotos.length);
    queryClient.invalidateQueries({ queryKey: ["photos", "year", year] });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSettings = () => {
    // router.push("/settings");
  };

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: insets.bottom + 110,
      }}
    >
      <MaskedView
        style={StyleSheet.absoluteFill}
        maskElement={
          <LinearGradient
            colors={["transparent", "green", "#000000"]}
            locations={[0, 0.35]}
            style={{ flex: 1 }}
          />
        }
      >
        <BlurView intensity={25} style={{ flex: 1 }} tint="light" />
      </MaskedView>
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.footer,
          { paddingBottom: insets.bottom },
        ]}
      >
        <Pressable
          onPress={handleCamera}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={({ pressed }) => [
            { transform: [{ scale: pressed ? 0.96 : 1 }] },
          ]}
          android_ripple={{ color: "rgba(0,0,0,0.1)", borderless: true }}
        >
          <LinearGradient
            colors={[colors.vibrantCoral, colors.softPeach, colors.drySage]}
            style={styles.cameraButtonGradient}
          >
            <View style={styles.cameraButtonInner}>
              <CameraIcon size={36} color={colors.neutral[200]} />
            </View>
          </LinearGradient>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.uploadButton,
            { transform: [{ scale: pressed ? 0.96 : 1 }] },
          ]}
          onPress={handleImageUpload}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          android_ripple={{ color: "rgba(0,0,0,0.1)", borderless: true }}
        >
          <UploadSimpleIcon size={20} color={colors.neutral[700]} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingTop: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  cameraButtonGradient: {
    width: 82,
    height: 82,
    borderRadius: "50%",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraButtonInner: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButton: {
    position: "absolute",
    top: "40%",
    right: "15%",
    width: 50,
    height: 50,
    borderRadius: 9999,
    backgroundColor: colors.neutral[200],
    borderWidth: 0.5,
    borderColor: colors.neutral[300],
    alignItems: "center",
    justifyContent: "center",
  },
  settingsButton: {
    position: "absolute",
    top: "40%",
    left: "15%",
    width: 50,
    height: 50,
    borderRadius: 9999,
    backgroundColor: colors.neutral[200],
    borderWidth: 0.5,
    borderColor: colors.neutral[300],
    alignItems: "center",
    justifyContent: "center",
  },
});
