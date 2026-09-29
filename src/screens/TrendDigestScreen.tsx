import { useCallback, useState } from "react"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { ScrollView, StyleSheet, View } from "react-native"
import { ActivityIndicator, Button, IconButton, Text } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

import { insightsService } from "../insights/insightsService"
import type { DigestResponse } from "../insights/types"
import type { RootStackParamList } from "../navigation/types"
import { colors } from "../theme"

type Props = NativeStackScreenProps<RootStackParamList, "TrendDigest">

const trendColor = (changePercent: number) =>
  changePercent > 0 ? colors.danger : colors.primary

const trendIcon = (changePercent: number) => (changePercent >= 0 ? "arrow-up" : "arrow-down")

export function TrendDigestScreen({ navigation }: Props) {
  const [digest, setDigest] = useState<DigestResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await insightsService.getDigest()
      setDigest(result)
      setError("")
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Не удалось загрузить дайджест")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  const maxCategoryCount = digest ? Math.max(...digest.categoryTotals.map((item) => item.count), 1) : 1

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text variant="titleMedium" style={styles.headerTitle}>
          Еженедельный дайджест
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error || !digest ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="alert-circle-outline" size={38} color={colors.danger} />
          <Text style={styles.error}>{error || "Данные недоступны"}</Text>
          <Button mode="outlined" onPress={() => void load()}>
            Повторить
          </Button>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text variant="bodySmall" style={styles.period}>
            г. Семей · {digest.periodLabel}
          </Text>

          {digest.headline ? (
            <View style={styles.headlineCard}>
              <View style={styles.headlineTop}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={16} color="#F2C879" />
                <Text variant="labelSmall" style={styles.headlineLabel}>
                  Главный инсайт недели
                </Text>
              </View>
              <View style={styles.headlineValueRow}>
                <Text variant="displaySmall" style={styles.headlineValue}>
                  {digest.headline.changePercent > 0 ? "+" : ""}
                  {digest.headline.changePercent}%
                </Text>
                <Text variant="labelLarge" style={styles.headlineSuffix}>
                  жалоб на {digest.headline.category.toLowerCase()}
                </Text>
              </View>
              <Text variant="bodySmall" style={styles.headlineCopy}>
                {digest.headline.district} — резкий рост за неделю ({digest.headline.previousCount} →{" "}
                {digest.headline.count} обращений). Рекомендуем внеплановую проверку.
              </Text>
            </View>
          ) : null}

          <Text variant="labelLarge" style={styles.sectionLabel}>
            Изменения по категориям и районам
          </Text>
          <View style={styles.insightList}>
            {digest.insights.map((insight, index) => (
              <View key={`${insight.category}-${insight.district}-${index}`} style={styles.insightCard}>
                <View
                  style={[
                    styles.insightIcon,
                    { backgroundColor: insight.changePercent > 0 ? "#FCE9E4" : "#E2EFEB" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={trendIcon(insight.changePercent)}
                    size={16}
                    color={trendColor(insight.changePercent)}
                  />
                </View>
                <View style={styles.insightBody}>
                  <View style={styles.insightHeadRow}>
                    <Text variant="labelLarge" style={styles.insightTitle}>
                      {insight.category} · {insight.district}
                    </Text>
                    <Text variant="labelMedium" style={[styles.insightChange, { color: trendColor(insight.changePercent) }]}>
                      {insight.changePercent > 0 ? "+" : ""}
                      {insight.changePercent}%
                    </Text>
                  </View>
                  <Text variant="bodySmall" style={styles.insightCopy}>
                    {insight.count} обращений за неделю, было {insight.previousCount}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.chartCard}>
            <Text variant="labelLarge" style={styles.chartTitle}>
              По категориям, эта неделя
            </Text>
            <View style={styles.chartRows}>
              {digest.categoryTotals.map((item) => (
                <View key={item.category} style={styles.chartRow}>
                  <Text variant="bodySmall" numberOfLines={1} style={styles.chartLabel}>
                    {item.category}
                  </Text>
                  <View style={styles.chartTrack}>
                    <View
                      style={[
                        styles.chartFill,
                        { width: `${Math.max((item.count / maxCategoryCount) * 100, 4)}%` },
                      ]}
                    />
                  </View>
                  <Text variant="labelSmall" style={styles.chartValue}>
                    {item.count}
                  </Text>
                </View>
              ))}
            </View>
          </View>
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
  period: { color: colors.inkMuted },
  headlineCard: { backgroundColor: colors.primaryDark, borderRadius: 20, padding: 20, gap: 8 },
  headlineTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  headlineLabel: { color: "#C7D6D2", fontWeight: "700" },
  headlineValueRow: { flexDirection: "row", alignItems: "baseline", gap: 10 },
  headlineValue: { color: "#FFFFFF", fontWeight: "800" },
  headlineSuffix: { color: "#F2C879", fontWeight: "700" },
  headlineCopy: { color: "#C7D6D2", lineHeight: 19 },
  sectionLabel: { color: colors.ink, fontWeight: "800" },
  insightList: { gap: 10 },
  insightCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "flex-start",
  },
  insightIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  insightBody: { flex: 1, gap: 3 },
  insightHeadRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: 8 },
  insightTitle: { color: colors.ink, fontWeight: "700", flex: 1 },
  insightChange: { fontWeight: "800" },
  insightCopy: { color: colors.inkMuted },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  chartTitle: { color: colors.inkMuted, fontWeight: "800", letterSpacing: 0.4 },
  chartRows: { gap: 9 },
  chartRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  chartLabel: { width: 108, color: colors.ink },
  chartTrack: { flex: 1, height: 9, borderRadius: 5, backgroundColor: colors.surfaceMuted, overflow: "hidden" },
  chartFill: { height: "100%", borderRadius: 5, backgroundColor: colors.secondary },
  chartValue: { width: 24, textAlign: "right", color: colors.inkMuted },
})
