import { StyleSheet, View } from "react-native"
import { Text } from "react-native-paper"

import { colors } from "../theme"
import type { IdeaMapProps } from "./IdeaMap.types"

export function IdeaMap({ value }: IdeaMapProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {value ? `${value.latitude}, ${value.longitude}` : "Карта недоступна на этой платформе"}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 260,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
  },
  text: { color: colors.inkMuted },
})
