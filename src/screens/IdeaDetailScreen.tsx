import { useCallback, useState } from "react"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Image, ScrollView, StyleSheet, View } from "react-native"
import { ActivityIndicator, Button, IconButton, Text } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

import { ideaService } from "../ideas/ideaService"
import { ideaStatusConfig } from "../ideas/status"
import type { IdeaRecord, IdeaStatusHistoryItem } from "../ideas/types"
import type { RootStackParamList } from "../navigation/types"
import { colors } from "../theme"
import { RatingStars } from "../components/RatingStars"

type Props = NativeStackScreenProps<RootStackParamList, "IdeaDetail">

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))

export function IdeaDetailScreen({ route, navigation }: Props) {
  const [idea, setIdea] = useState<IdeaRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const loadIdea = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await ideaService.getById(route.params.ideaId)
      setIdea(result)
      setError("")
      await ideaService.markAsRead(route.params.ideaId)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Не удалось загрузить идею")
    } finally {
      setIsLoading(false)
    }
  }, [route.params.ideaId])

  useFocusEffect(
    useCallback(() => {
      void loadIdea()
    }, [loadIdea]),
  )

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.muted}>Открываем идею…</Text>
      </SafeAreaView>
    )
  }

  if (!idea || error) {
    return (
      <SafeAreaView style={styles.centered}>
        <MaterialCommunityIcons name="alert-circle-outline" size={42} color={colors.danger} />
        <Text style={styles.error}>{error || "Идея не найдена"}</Text>
        <Button mode="outlined" onPress={loadIdea}>
          Повторить
        </Button>
        <Button onPress={() => navigation.goBack()}>Назад</Button>
      </SafeAreaView>
    )
  }

  const status = ideaStatusConfig[idea.status]

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text variant="titleMedium" style={styles.headerTitle}>
          Детали идеи
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {idea.photoUrl.startsWith("mock://") ? (
          <View style={styles.heroPlaceholder}>
            <MaterialCommunityIcons name="city-variant-outline" size={54} color={colors.primary} />
          </View>
        ) : (
          <Image source={{ uri: idea.photoUrl }} style={styles.heroImage} />
        )}

        <View style={[styles.statusPill, { backgroundColor: status.background }]}>
          <MaterialCommunityIcons name={status.icon} size={18} color={status.color} />
          <Text variant="labelMedium" style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>

        <Text variant="headlineSmall" style={styles.title}>
          {idea.title}
        </Text>
        <Text variant="bodyLarge" style={styles.description}>
          {idea.description}
        </Text>

        <View style={styles.infoGrid}>
          <InfoItem icon="shape-outline" label="Категория" value={idea.category ?? "Определяется"} />
          <InfoItem icon="map-marker-outline" label="Район" value={idea.addressDistrict} />
          <InfoItem icon="calendar-outline" label="Создана" value={formatDateTime(idea.createdAt)} />
          <InfoItem
            icon="crosshairs"
            label="Координаты"
            value={`${idea.lat.toFixed(5)}, ${idea.lng.toFixed(5)}`}
          />
        </View>

        {idea.classificationReason ? (
          <View style={styles.aiCard}>
            <View style={styles.aiIcon}>
              <MaterialCommunityIcons name="creation" size={23} color={colors.secondary} />
            </View>
            <View style={styles.aiCopy}>
              <Text variant="labelLarge" style={styles.aiTitle}>
                AI-классификация
              </Text>
              <Text variant="bodySmall" style={styles.aiText}>
                {idea.classificationReason}
              </Text>
            </View>
          </View>
        ) : null}

        {idea.status === "done" ? (
          idea.rating ? (
            <View style={styles.feedbackCard}>
              <View style={styles.feedbackHeading}>
                <View>
                  <Text variant="labelLarge" style={styles.feedbackTitle}>Ваша оценка результата</Text>
                  <RatingStars value={idea.rating} size={25} />
                </View>
                <Button
                  mode="text"
                  compact
                  onPress={() => navigation.navigate("ImpactFeedback", { ideaId: idea.id })}
                >
                  Изменить
                </Button>
              </View>
              {idea.ratingComment ? (
                <Text variant="bodyMedium" style={styles.feedbackComment}>{idea.ratingComment}</Text>
              ) : null}
              {idea.afterPhotoUrl ? (
                <View style={styles.afterPhotoWrap}>
                  <Image source={{ uri: idea.afterPhotoUrl }} style={styles.afterPhoto} />
                  <View style={styles.afterPhotoLabel}>
                    <Text variant="labelSmall" style={styles.afterPhotoLabelText}>ФОТО ПОСЛЕ</Text>
                  </View>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.feedbackPrompt}>
              <MaterialCommunityIcons name="star-outline" size={27} color={colors.secondary} />
              <View style={styles.feedbackPromptCopy}>
                <Text variant="titleSmall" style={styles.feedbackTitle}>Как вам результат?</Text>
                <Text variant="bodySmall" style={styles.feedbackPromptText}>Оцените выполненную работу и оставьте комментарий.</Text>
              </View>
              <Button mode="contained-tonal" compact onPress={() => navigation.navigate("ImpactFeedback", { ideaId: idea.id })}>
                Оценить
              </Button>
            </View>
          )
        ) : null}

        <View style={styles.timelineHeading}>
          <Text variant="titleLarge" style={styles.timelineTitle}>
            История статусов
          </Text>
          <Text variant="bodySmall" style={styles.muted}>
            {idea.statusHistory.length} событий
          </Text>
        </View>

        <View style={styles.timeline}>
          {[...idea.statusHistory].reverse().map((item, index) => (
            <TimelineItem
              key={item.id}
              item={item}
              isFirst={index === 0}
              isLast={index === idea.statusHistory.length - 1}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <MaterialCommunityIcons
        name={icon as React.ComponentProps<typeof MaterialCommunityIcons>["name"]}
        size={21}
        color={colors.primary}
      />
      <View style={styles.infoCopy}>
        <Text variant="labelSmall" style={styles.infoLabel}>
          {label.toUpperCase()}
        </Text>
        <Text variant="bodyMedium" style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  )
}

function TimelineItem({
  item,
  isFirst,
  isLast,
}: {
  item: IdeaStatusHistoryItem
  isFirst: boolean
  isLast: boolean
}) {
  const status = ideaStatusConfig[item.status]
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineRail}>
        <View
          style={[
            styles.timelineDot,
            { backgroundColor: isFirst ? status.color : colors.surface, borderColor: status.color },
          ]}
        />
        {!isLast ? <View style={styles.timelineLine} /> : null}
      </View>
      <View style={styles.timelineContent}>
        <View style={styles.timelineMeta}>
          <Text variant="titleSmall" style={styles.timelineStatus}>
            {status.label}
          </Text>
          <Text variant="labelSmall" style={styles.timelineDate}>
            {formatDateTime(item.createdAt)}
          </Text>
        </View>
        {item.comment ? (
          <View style={[styles.comment, isFirst && styles.commentActive]}>
            <Text variant="bodyMedium" style={styles.commentText}>
              {item.comment}
            </Text>
            {item.actorName ? (
              <Text variant="labelSmall" style={styles.actor}>
                {item.actorName}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerTitle: { flex: 1, textAlign: "center", color: colors.ink, fontWeight: "800" },
  headerSpacer: { width: 48 },
  content: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 42,
  },
  heroImage: { width: "100%", height: 260, borderRadius: 24, backgroundColor: colors.surfaceMuted },
  heroPlaceholder: {
    width: "100%",
    height: 230,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DDEFE7",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    marginTop: 18,
  },
  statusText: { fontWeight: "900" },
  title: { color: colors.ink, fontWeight: "900", marginTop: 14 },
  description: { color: colors.inkMuted, lineHeight: 25, marginTop: 10 },
  infoGrid: { gap: 10, marginTop: 24 },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoCopy: { flex: 1 },
  infoLabel: { color: colors.inkMuted, fontWeight: "800", letterSpacing: 0.6 },
  infoValue: { color: colors.ink, fontWeight: "600", marginTop: 2 },
  aiCard: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 19,
    backgroundColor: "#FFF6E4",
    marginTop: 14,
  },
  aiIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  aiCopy: { flex: 1 },
  aiTitle: { color: colors.ink, fontWeight: "800" },
  aiText: { color: colors.inkMuted, lineHeight: 18, marginTop: 3 },
  feedbackCard: { marginTop: 14, padding: 16, borderRadius: 20, backgroundColor: "#FFF6E4", gap: 12 },
  feedbackHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  feedbackTitle: { color: colors.ink, fontWeight: "800" },
  feedbackComment: { color: colors.ink, lineHeight: 21 },
  afterPhotoWrap: { height: 190, borderRadius: 16, overflow: "hidden" },
  afterPhoto: { width: "100%", height: "100%" },
  afterPhotoLabel: { position: "absolute", left: 9, bottom: 9, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: "rgba(23,51,46,0.82)" },
  afterPhotoLabelText: { color: "#FFFFFF", fontWeight: "900" },
  feedbackPrompt: { flexDirection: "row", alignItems: "center", gap: 11, marginTop: 14, padding: 15, borderRadius: 19, backgroundColor: "#FFF6E4" },
  feedbackPromptCopy: { flex: 1 },
  feedbackPromptText: { color: colors.inkMuted, lineHeight: 18, marginTop: 2 },
  timelineHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 30,
    marginBottom: 18,
  },
  timelineTitle: { color: colors.ink, fontWeight: "900" },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: "row", minHeight: 92 },
  timelineRail: { width: 28, alignItems: "center" },
  timelineDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 3, zIndex: 1 },
  timelineLine: { position: "absolute", top: 16, bottom: -1, width: 2, backgroundColor: colors.border },
  timelineContent: { flex: 1, paddingLeft: 9, paddingBottom: 18 },
  timelineMeta: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  timelineStatus: { color: colors.ink, fontWeight: "800", flex: 1 },
  timelineDate: { color: colors.inkMuted, maxWidth: 132, textAlign: "right" },
  comment: { marginTop: 8, padding: 12, borderRadius: 14, backgroundColor: colors.surface },
  commentActive: { backgroundColor: "#DDEFE7" },
  commentText: { color: colors.ink, lineHeight: 20 },
  actor: { color: colors.primary, fontWeight: "700", marginTop: 7 },
  muted: { color: colors.inkMuted },
  error: { color: colors.danger, textAlign: "center" },
})
