import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import dayjs from "dayjs";
import { useLocalSearchParams } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CameraIcon, UploadSimpleIcon } from "phosphor-react-native";
import { useNormalizedSafeAreaInsets } from "@/src/shared/hooks/use-normalized-safe-area-insets";
import { colors } from "@/src/shared/theme/colors";
import { typography } from "@/src/shared/theme/typography";
import { db } from "@/src/shared/db/client";
import { photos as photosTable, type Photo } from "@/src/shared/db/schema";
import { getPhotosByYear } from "../queries/get-photos-by-year";

function getTodayPhotos(photos: Photo[]) {
  const today = dayjs().startOf("day");
  return photos.filter((p) => dayjs.unix(p.createdAt).isSame(today, "day"));
}

async function savePhotos(uris: string[], sortOrder: number) {
  await db.insert(photosTable).values(uris.map((uri) => ({ sortOrder, uri })));
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
        >
          <LinearGradient
            colors={[colors.softPeach, colors.winePlum]}
            // locations={[0.3, 0.99]}
            style={styles.cameraButtonGradient}
          >
            <View style={styles.cameraButtonInner}>
              <CameraIcon size={36} color={colors.neutral[200]} />
            </View>
          </LinearGradient>
        </Pressable>
        <Pressable
          style={styles.uploadButton}
          onPress={handleImageUpload}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <UploadSimpleIcon size={28} color={colors.neutral[700]} />
          <Text style={styles.uploadButtonText}>Upload</Text>
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
    width: 72,
    height: 72,
    borderRadius: "50%",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButton: {
    position: "absolute",
    top: "25%",
    right: "15%",
    width: 72,
    height: 72,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  uploadButtonText: {
    ...typography.xsBold,
    color: colors.neutral[800],
  },
});
