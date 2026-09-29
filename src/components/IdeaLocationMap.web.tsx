import { MaterialCommunityIcons } from "@expo/vector-icons"
import { StyleSheet, View } from "react-native"
import { Text } from "react-native-paper"

import { colors } from "../theme"

type Props = {
  latitude: number
  longitude: number
}

export function IdeaLocationMap({ latitude, longitude }: Props) {
  return (
    <View style={styles.map}>
      <View style={styles.gridHorizontal} />
      <View style={styles.gridVertical} />
      <MaterialCommunityIcons name="map-marker" size={32} color={colors.primary} />
      <Text variant="bodySmall" style={styles.copy}>
        {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  map: {
    height: 170,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
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
  copy: { color: colors.inkMuted },
})
