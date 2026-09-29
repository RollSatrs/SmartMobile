import { useCallback, useState } from "react"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { ScrollView, StyleSheet, View } from "react-native"
import { ActivityIndicator, Button, IconButton, Text } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

import { useAuth } from "../auth/AuthContext"
import { insightsService } from "../insights/insightsService"
import type { DistrictRankingEntry } from "../insights/types"
import type { RootStackParamList } from "../navigation/types"
import { colors } from "../theme"

type Props = NativeStackScreenProps<RootStackParamList, "DistrictRanking">

const RANK_BADGES = ["#F2C879", colors.border, colors.border]

export function DistrictRankingScreen({ navigation }: Props) {
  const { user } = useAuth()
  const [ranking, setRanking] = useState<DistrictRankingEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await insightsService.getDistrictRanking()
      setRanking(result)
      setError("")
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Не удалось загрузить рейтинг")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  const leader = ranking[0]
  const maxScore = Math.max(...ranking.map((item) => item.score), 1)
  const isResident = user?.role === "resident"

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text variant="titleMedium" style={styles.headerTitle}>
          Рейтинг районов
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="alert-circle-outline" size={38} color={colors.danger} />
          <Text style={styles.error}>{error}</Text>
          <Button mode="outlined" onPress={() => void load()}>
            Повторить
          </Button>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {leader ? (
            <View style={styles.badgeCard}>
              <View style={styles.badgeIcon}>
                <MaterialCommunityIcons name="trophy-outline" size={22} color={colors.primaryDark} />
              </View>
              <View style={styles.badgeCopy}>
                <Text variant="labelSmall" style={styles.badgeLabel}>
                  Самый отзывчивый акимат месяца
                </Text>
                <Text variant="titleMedium" style={styles.badgeDistrict}>
                  {leader.district}
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.list}>
            {ranking.map((entry, index) => (
              <View key={entry.district} style={styles.row}>
                <View
                  style={[
                    styles.rank,
                    { backgroundColor: index < 3 ? RANK_BADGES[index] : colors.surfaceMuted },
                  ]}
                >
                  <Text variant="labelLarge" style={styles.rankText}>
                    {index + 1}
                  </Text>
                </View>
                <View style={styles.rowBody}>
                  <Text variant="titleSmall" style={styles.rowTitle}>
                    {entry.district}
                  </Text>
                  <View style={styles.rowTrack}>
                    <View style={[styles.rowFill, { width: `${(entry.score / maxScore) * 100}%` }]} />
                  </View>
                  <Text variant="labelSmall" style={styles.rowMeta}>
                    {entry.resolvedCount} из {entry.ideaCount} решено · {entry.resolvedPercent}%
                  </Text>
                </View>
                <View style={styles.scoreBlock}>
                  <Text variant="titleMedium" style={styles.scoreValue}>
                    {entry.score}
                  </Text>
                  <Text variant="labelSmall" style={styles.scoreCaption}>
                    баллов
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {isResident ? (
            <View style={styles.personalCard}>
              <Text variant="labelSmall" style={styles.personalLabel}>
                Твой вклад
              </Text>
              <Text variant="bodyMedium" style={styles.personalCopy}>
                Каждая решённая идея добавляет очки твоему району в общий рейтинг
              </Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerTitle: { flex: 1, textAlign: "center", color: colors.ink, fontWeight: "800" },
  headerSpacer: { width: 48 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 24 },
  error: { color: colors.danger, textAlign: "center" },
  content: { width: "100%", maxWidth: 680, alignSelf: "center", padding: 20, paddingBottom: 42, gap: 16 },
  badgeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.primaryDark,
    borderRadius: 20,
    padding: 18,
  },
  badgeIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2C879",
  },
  badgeCopy: { flex: 1 },
  badgeLabel: { color: "#C7D6D2", fontWeight: "700" },
  badgeDistrict: { color: "#FFFFFF", fontWeight: "800", marginTop: 2 },
  list: { gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  rank: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rankText: { color: colors.ink, fontWeight: "800" },
  rowBody: { flex: 1, gap: 6 },
  rowTitle: { color: colors.ink, fontWeight: "800" },
  rowTrack: { height: 6, borderRadius: 4, backgroundColor: colors.surfaceMuted, overflow: "hidden" },
  rowFill: { height: "100%", borderRadius: 4, backgroundColor: colors.primary },
  rowMeta: { color: colors.inkMuted },
  scoreBlock: { alignItems: "flex-end" },
  scoreValue: { color: colors.ink, fontWeight: "800" },
  scoreCaption: { color: colors.inkMuted },
  personalCard: { backgroundColor: colors.surfaceMuted, borderRadius: 16, padding: 16, gap: 4 },
  personalLabel: { color: colors.primary, fontWeight: "800" },
  personalCopy: { color: colors.ink, lineHeight: 19 },
})
