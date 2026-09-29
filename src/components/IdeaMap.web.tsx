import { Pressable, StyleSheet, View } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { Text } from "react-native-paper"

import { colors } from "../theme"
import type { IdeaMapProps } from "./IdeaMap.types"

const SEMEY_CENTER = { latitude: 50.4111, longitude: 80.2275 }

export function IdeaMap({ value, onChange }: IdeaMapProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onChange(SEMEY_CENTER)}
      style={({ pressed }) => [styles.map, pressed && styles.pressed]}
    >
      <View style={styles.gridHorizontal} />
      <View style={styles.gridVertical} />
      <MaterialCommunityIcons name="map-marker" size={42} color={colors.primary} />
      <Text variant="titleMedium" style={styles.title}>
        {value ? "Точка выбрана" : "Web-preview карты"}
      </Text>
      <Text variant="bodySmall" style={styles.copy}>
        {value
          ? `${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}`
          : "Нажмите, чтобы выбрать центр Семея. Интерактивная карта доступна в мобильном приложении."}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  map: {
    height: 260,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    backgroundColor: "#DFECE6",
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "48%",
    height: 2,
    backgroundColor: "rgba(23,107,91,0.12)",
  },
  gridVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "48%",
    width: 2,
    backgroundColor: "rgba(23,107,91,0.12)",
  },
  title: { color: colors.ink, fontWeight: "800", marginTop: 8 },
  copy: { color: colors.inkMuted, textAlign: "center", marginTop: 5, lineHeight: 18 },
  pressed: { opacity: 0.82 },
})
