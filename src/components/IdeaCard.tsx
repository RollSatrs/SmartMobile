import { MaterialCommunityIcons } from "@expo/vector-icons"
import { Image, Pressable, StyleSheet, View } from "react-native"
import { Text } from "react-native-paper"

import { ideaStatusConfig } from "../ideas/status"
import type { IdeaRecord } from "../ideas/types"
import { colors } from "../theme"

type Props = {
  idea: IdeaRecord
  onPress: () => void
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date(value))

function IdeaPreview({ idea }: { idea: IdeaRecord }) {
  if (!idea.photoUrl.startsWith("mock://")) {
    return <Image source={{ uri: idea.photoUrl }} style={styles.image} />
  }

  const icon = idea.category?.includes("Освещение")
    ? "lightbulb-on-outline"
    : idea.category?.includes("Экология")
      ? "tree-outline"
      : "city-variant-outline"

  return (
    <View style={styles.placeholderImage}>
      <MaterialCommunityIcons name={icon} size={38} color={colors.primary} />
    </View>
  )
}

export function IdeaCard({ idea, onPress }: Props) {
  const status = ideaStatusConfig[idea.status]

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <IdeaPreview idea={idea} />
      <View style={styles.body}>
        <View style={styles.metaRow}>
          <View style={[styles.status, { backgroundColor: status.background }]}>
            <MaterialCommunityIcons name={status.icon} size={15} color={status.color} />
            <Text variant="labelSmall" style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
          {idea.hasUnreadUpdate ? (
            <View style={styles.unreadWrap}>
              <View style={styles.unreadDot} />
              <Text variant="labelSmall" style={styles.unreadText}>
                Новое
              </Text>
            </View>
          ) : null}
        </View>

        <Text variant="titleMedium" numberOfLines={2} style={styles.title}>
          {idea.title}
        </Text>

        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker-outline" size={17} color={colors.inkMuted} />
          <Text variant="bodySmall" numberOfLines={1} style={styles.locationText}>
            {idea.addressDistrict}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text variant="labelSmall" style={styles.date}>
            {formatDate(idea.createdAt)}
          </Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.inkMuted} />
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    minHeight: 176,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: "#1D3A34",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.993 }] },
  image: { width: 118, height: "100%", backgroundColor: colors.surfaceMuted },
  placeholderImage: {
    width: 118,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DDEFE7",
  },
  body: { flex: 1, padding: 14, gap: 9 },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  status: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusText: { fontWeight: "800" },
  unreadWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.secondary },
  unreadText: { color: colors.secondary, fontWeight: "800" },
  title: { color: colors.ink, fontWeight: "800", lineHeight: 21 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { color: colors.inkMuted, flex: 1 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: "auto" },
  date: { color: colors.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 },
})
