import { useCallback, useEffect, useState } from "react"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { StyleSheet, View } from "react-native"
import { ActivityIndicator, Button, Card, Chip, Text } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

import { ideaService } from "../ideas/ideaService"
import type { IdeaRecord } from "../ideas/types"
import type { RootStackParamList } from "../navigation/types"
import { colors } from "../theme"

type Props = NativeStackScreenProps<RootStackParamList, "IdeaSubmitted">

export function IdeaSubmittedScreen({ route, navigation }: Props) {
  const [idea, setIdea] = useState<IdeaRecord | null>(null)
  const [error, setError] = useState("")

  const loadIdea = useCallback(async () => {
    try {
      const nextIdea = await ideaService.getById(route.params.ideaId)
      setIdea(nextIdea)
      setError("")
      return Boolean(nextIdea.category)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Не удалось обновить идею")
      return false
    }
  }, [route.params.ideaId])

  useEffect(() => {
    let active = true
    let attempts = 0
    let timeout: ReturnType<typeof setTimeout> | undefined

    const poll = async () => {
      attempts += 1
      const completed = await loadIdea()
      if (active && !completed && attempts < 20) {
        timeout = setTimeout(poll, 900)
      }
    }

    void poll()
    return () => {
      active = false
      if (timeout) clearTimeout(timeout)
    }
  }, [loadIdea])

  const returnHome = () => {
    navigation.reset({ index: 0, routes: [{ name: "ResidentHome" }] })
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <View style={styles.successMark}>
          <MaterialCommunityIcons name="check" size={44} color="#FFFFFF" />
        </View>
        <Text variant="headlineMedium" style={styles.title}>
          Идея отправлена
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Мы зарегистрировали предложение и начали автоматическую классификацию.
        </Text>

        <Card mode="contained" style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.statusRow}>
              <Text variant="labelMedium" style={styles.label}>
                СТАТУС
              </Text>
              <Chip icon="inbox-arrow-down-outline" compact style={styles.statusChip}>
                Получена
              </Chip>
            </View>

            <View style={styles.divider} />

            <Text variant="labelMedium" style={styles.label}>
              КАТЕГОРИЯ
            </Text>
            {!idea?.category ? (
              <View style={styles.classifyingRow}>
                <ActivityIndicator size={22} color={colors.secondary} />
                <View style={styles.classifyingCopy}>
                  <Text variant="titleMedium" style={styles.classifyingTitle}>
                    Категория определяется…
                  </Text>
                  <Text variant="bodySmall" style={styles.classifyingText}>
                    AI анализирует описание и фотографию
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.categoryResult}>
                <View style={styles.aiIcon}>
                  <MaterialCommunityIcons name="creation" size={24} color={colors.secondary} />
                </View>
                <View style={styles.classifyingCopy}>
                  <Text variant="titleMedium" style={styles.categoryTitle}>
                    {idea.category}
                  </Text>
                  <Text variant="bodySmall" style={styles.classifyingText}>
                    {idea.classificationReason}
                  </Text>
                </View>
              </View>
            )}

            {idea?.addressDistrict ? (
              <View style={styles.districtRow}>
                <MaterialCommunityIcons name="map-marker-outline" size={19} color={colors.inkMuted} />
                <Text variant="bodySmall" style={styles.districtText}>
                  {idea.addressDistrict}
                </Text>
              </View>
            ) : null}
          </Card.Content>
        </Card>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Button compact onPress={loadIdea}>
              Повторить
            </Button>
          </View>
        ) : null}

        <Button mode="contained" onPress={returnHome} contentStyle={styles.buttonContent}>
          Вернуться в кабинет
        </Button>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  successMark: {
    width: 82,
    height: 82,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 6,
  },
  title: { color: colors.ink, fontWeight: "900", marginTop: 24, textAlign: "center" },
  subtitle: {
    color: colors.inkMuted,
    lineHeight: 24,
    marginTop: 10,
    textAlign: "center",
    maxWidth: 420,
  },
  card: { width: "100%", marginTop: 28, borderRadius: 24, backgroundColor: colors.surface },
  cardContent: { gap: 15 },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { color: colors.inkMuted, fontWeight: "800", letterSpacing: 0.8 },
  statusChip: { backgroundColor: "#DDEFE7" },
  divider: { height: 1, backgroundColor: colors.border },
  classifyingRow: { flexDirection: "row", alignItems: "center", gap: 13 },
  classifyingCopy: { flex: 1 },
  classifyingTitle: { color: colors.ink, fontWeight: "700" },
  classifyingText: { color: colors.inkMuted, lineHeight: 18, marginTop: 3 },
  categoryResult: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
    padding: 13,
    borderRadius: 16,
    backgroundColor: "#FFF6E4",
  },
  aiIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  categoryTitle: { color: colors.ink, fontWeight: "800" },
  districtRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  districtText: { color: colors.inkMuted },
  errorCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FCE8E6",
  },
  errorText: { color: colors.danger, flex: 1 },
  buttonContent: { minHeight: 54 },
})
