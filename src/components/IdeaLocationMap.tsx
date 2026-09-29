import { StyleSheet, View } from "react-native"
import { Text } from "react-native-paper"

import { colors } from "../theme"

type Props = {
  latitude: number
  longitude: number
}

export function IdeaLocationMap({ latitude, longitude }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.text}>
        {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    height: 170,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
  },
  text: { color: colors.inkMuted },
})
