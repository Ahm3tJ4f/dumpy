import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  useColorScheme,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { CameraIcon, ArrowCounterClockwiseIcon } from "phosphor-react-native";

export default function CameraScreen() {
  const [photo, setPhoto] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      allowsEditing: false,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const retake = () => setPhoto(null);

  if (photo) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Image source={{ uri: photo }} style={styles.photo} />
        <TouchableOpacity style={styles.retakeButton} onPress={retake}>
          <ArrowCounterClockwiseIcon size={20} color="#fff" />
          <Text style={styles.retakeText}>Retake</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorScheme === "dark" ? "#000" : "#f2f2f7" },
      ]}
    >
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <TouchableOpacity style={styles.shutterOuter} onPress={takePhoto}>
        <View style={styles.shutterInner}>
          <CameraIcon size={28} color="#fff" weight="fill" />
        </View>
      </TouchableOpacity>
      <Text
        style={[
          styles.label,
          { color: colorScheme === "dark" ? "#fff" : "#000" },
        ]}
      >
        Take a photo
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  shutterOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    marginTop: 16,
    opacity: 0.5,
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "contain",
  },
  retakeButton: {
    position: "absolute",
    bottom: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 20,
  },
  retakeText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
