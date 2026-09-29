import { StyleSheet, View } from "react-native"
import { ActivityIndicator, Text } from "react-native-paper"

import { colors } from "../theme"

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.mark}>
        <Text style={styles.letter}>A</Text>
      </View>
      <ActivityIndicator size="small" color={colors.primary} />
      <Text variant="bodyMedium" style={styles.caption}>
        Восстанавливаем сессию…
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: colors.background,
  },
  mark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    marginBottom: 8,
  },
  letter: { color: "#FFFFFF", fontSize: 30, fontWeight: "900" },
  caption: { color: colors.inkMuted },
})
