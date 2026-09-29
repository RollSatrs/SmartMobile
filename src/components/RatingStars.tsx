import { MaterialCommunityIcons } from "@expo/vector-icons"
import { Pressable, StyleSheet, View } from "react-native"

import { colors } from "../theme"

type Props = {
  value: number
  onChange?: (value: number) => void
  size?: number
}

export function RatingStars({ value, onChange, size = 32 }: Props) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {[1, 2, 3, 4, 5].map((rating) => (
        <Pressable
          key={rating}
          accessibilityRole={onChange ? "radio" : "image"}
          accessibilityLabel={`${rating} из 5`}
          accessibilityState={onChange ? { checked: value === rating } : undefined}
          disabled={!onChange}
          hitSlop={6}
          onPress={() => onChange?.(rating)}
          style={({ pressed }) => [styles.star, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons
            name={rating <= value ? "star" : "star-outline"}
            size={size}
            color={rating <= value ? colors.secondary : colors.border}
          />
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  star: { paddingVertical: 2 },
  pressed: { opacity: 0.65, transform: [{ scale: 0.94 }] },
})
