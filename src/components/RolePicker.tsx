import { MaterialCommunityIcons } from "@expo/vector-icons"
import { Pressable, StyleSheet, View } from "react-native"
import { Text } from "react-native-paper"

import type { UserRole } from "../auth/types"
import { colors } from "../theme"

type Props = {
  value: UserRole
  onChange: (role: UserRole) => void
}

const roles: Array<{
  value: UserRole
  title: string
  description: string
  icon: "account-heart-outline" | "office-building-outline"
}> = [
  {
    value: "resident",
    title: "Житель",
    description: "Предлагать идеи и следить за статусом",
    icon: "account-heart-outline",
  },
  {
    value: "gov_official",
    title: "Госорган",
    description: "Рассматривать обращения жителей",
    icon: "office-building-outline",
  },
]

export function RolePicker({ value, onChange }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text variant="labelLarge" style={styles.label}>
        Выберите роль
      </Text>
      <View style={styles.list}>
        {roles.map((role) => {
          const selected = value === role.value
          return (
            <Pressable
              key={role.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => onChange(role.value)}
              style={({ pressed }) => [
                styles.option,
                selected && styles.optionSelected,
                pressed && styles.optionPressed,
              ]}
            >
              <View style={[styles.iconBox, selected && styles.iconBoxSelected]}>
                <MaterialCommunityIcons
                  name={role.icon}
                  size={24}
                  color={selected ? "#FFFFFF" : colors.primary}
                />
              </View>
              <View style={styles.copy}>
                <Text variant="titleSmall" style={styles.optionTitle}>
                  {role.title}
                </Text>
                <Text variant="bodySmall" style={styles.optionDescription}>
                  {role.description}
                </Text>
              </View>
              <MaterialCommunityIcons
                name={selected ? "radiobox-marked" : "radiobox-blank"}
                size={22}
                color={selected ? colors.primary : colors.inkMuted}
              />
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: 10 },
  label: { color: colors.ink, fontWeight: "700" },
  list: { gap: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: "#F0F8F4" },
  optionPressed: { opacity: 0.78 },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
  },
  iconBoxSelected: { backgroundColor: colors.primary },
  copy: { flex: 1 },
  optionTitle: { color: colors.ink, fontWeight: "700" },
  optionDescription: { color: colors.inkMuted, marginTop: 2 },
})
