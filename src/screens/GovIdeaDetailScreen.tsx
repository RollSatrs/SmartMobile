import { useCallback, useState } from "react"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Image, ScrollView, StyleSheet, View } from "react-native"
import { ActivityIndicator, Button, IconButton, Snackbar, Text } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

import { useAuth } from "../auth/AuthContext"
import { AssigneePickerSheet } from "../components/AssigneePickerSheet"
import { IdeaLocationMap } from "../components/IdeaLocationMap"
import { StatusUpdateSheet } from "../components/StatusUpdateSheet"
import { ideaService } from "../ideas/ideaService"
import { ideaStatusConfig } from "../ideas/status"
import type { IdeaRecord, IdeaStatus, IdeaStatusHistoryItem } from "../ideas/types"
import type { RootStackParamList } from "../navigation/types"
import { colors } from "../theme"
import type { GovOfficial } from "../users/types"
import { userService } from "../users/userService"

type Props = NativeStackScreenProps<RootStackParamList, "GovIdeaDetail">

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))

export function GovIdeaDetailScreen({ route, navigation }: Props) {
  const { user } = useAuth()
  const [idea, setIdea] = useState<IdeaRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isStatusSheetVisible, setIsStatusSheetVisible] = useState(false)
  const [isAssigneeSheetVisible, setIsAssigneeSheetVisible] = useState(false)
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [assigningOfficialId, setAssigningOfficialId] = useState<string | null>(null)
  const [officials, setOfficials] = useState<GovOfficial[]>([])
  const [isLoadingOfficials, setIsLoadingOfficials] = useState(false)
  const [officialsError, setOfficialsError] = useState("")
  const [assignmentError, setAssignmentError] = useState("")
  const [snackbar, setSnackbar] = useState("")

  const loadIdea = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await ideaService.getById(route.params.ideaId)
      if (result.assigneeId && !result.assigneeName) {
        try {
          const loadedOfficials = await userService.listGovOfficials()
          const assignee = loadedOfficials.find(
            (official) => String(official.id) === String(result.assigneeId),
          )
          setOfficials(loadedOfficials)
          setIdea({ ...result, assigneeName: assignee?.name })
        } catch {
          setIdea(result)
        }
      } else {
        setIdea(result)
      }
      setError("")
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

  const handleStatusSubmit = async (status: IdeaStatus, comment?: string) => {
    if (!idea) return
    setIsSubmittingStatus(true)
    try {
      const updated = await ideaService.updateStatus(idea.id, status, comment)
      setIdea(updated)
      setIsStatusSheetVisible(false)
      setSnackbar("Статус обновлён")
    } catch (caughtError) {
      setSnackbar(caughtError instanceof Error ? caughtError.message : "Не удалось изменить статус")
    } finally {
      setIsSubmittingStatus(false)
    }
  }

  const loadOfficials = async () => {
    setIsLoadingOfficials(true)
    setOfficialsError("")
    try {
      setOfficials(await userService.listGovOfficials())
    } catch (caughtError) {
      setOfficialsError(caughtError instanceof Error ? caughtError.message : "Не удалось загрузить сотрудников")
    } finally {
      setIsLoadingOfficials(false)
    }
  }

  const handleOpenAssigneePicker = () => {
    setAssignmentError("")
    setIsAssigneeSheetVisible(true)
    void loadOfficials()
  }

  const handleAssign = async (assignee: { id: string; name: string }, fromPicker = false) => {
    if (!idea) return
    setIsAssigning(true)
    setAssigningOfficialId(assignee.id)
    setAssignmentError("")
    try {
      const updated = await ideaService.assignTo(idea.id, assignee)
      setIdea({ ...updated, assigneeName: assignee.name })
      setIsAssigneeSheetVisible(false)
      setSnackbar(user && String(assignee.id) === String(user.id)
        ? "Вы назначены ответственным"
        : `Ответственный: ${assignee.name}`)
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Не удалось назначить исполнителя"
      if (fromPicker) setAssignmentError(message)
      else setSnackbar(message)
    } finally {
      setIsAssigning(false)
      setAssigningOfficialId(null)
    }
  }

  const handleTakeInWork = () => {
    if (user) void handleAssign({ id: user.id, name: user.name })
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.muted}>Открываем обращение…</Text>
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
  const isAssignedToMe = Boolean(user) && String(idea.assigneeId ?? "") === String(user?.id ?? "")

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text variant="titleMedium" style={styles.headerTitle}>
          Обращение №{idea.id}
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
          <InfoItem icon="shape-outline" label="Категория" value={idea.category ?? "Не определена"} />
          <InfoItem icon="account-outline" label="Автор" value={idea.authorName ?? `Житель #${idea.authorId ?? "—"}`} />
          <InfoItem icon="map-marker-outline" label="Район" value={idea.addressDistrict} />
          <InfoItem icon="calendar-outline" label="Создана" value={formatDateTime(idea.createdAt)} />
        </View>

        <Text variant="labelLarge" style={styles.sectionLabel}>
          Местоположение
        </Text>
        <IdeaLocationMap latitude={idea.lat} longitude={idea.lng} />

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

        {idea.photoFlag === "inconsistent" ? (
          <View style={styles.warningCard}>
            <MaterialCommunityIcons name="alert-outline" size={22} color={colors.danger} />
            <View style={styles.warningCopy}>
              <Text variant="labelLarge" style={styles.warningTitle}>
                AI: фото может не соответствовать описанию
              </Text>
              <Text variant="bodySmall" style={styles.warningText}>
                {idea.photoFlagReason ?? "Проверьте перед выездом на место."}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.assigneeCard}>
          <View style={styles.assigneeIcon}>
            <MaterialCommunityIcons
              name={isAssignedToMe ? "account-check" : "account-question-outline"}
              size={22}
              color={colors.primary}
            />
          </View>
          <View style={styles.assigneeCopy}>
            <Text variant="labelLarge" style={styles.assigneeTitle}>
              Ответственный
            </Text>
            <Text variant="bodySmall" style={styles.assigneeValue}>
              {isAssignedToMe
                ? "Вы ведёте это обращение"
                : idea.assigneeName ?? (idea.assigneeId ? `Сотрудник #${idea.assigneeId}` : "Пока не назначен")}
            </Text>
          </View>
          <View style={styles.assigneeActions}>
            {!isAssignedToMe ? (
              <Button mode="text" onPress={handleTakeInWork} loading={isAssigning} disabled={isAssigning} compact>
                Взять в работу
              </Button>
            ) : null}
            <Button mode="text" onPress={handleOpenAssigneePicker} disabled={isAssigning} compact>
              Назначить другого
            </Button>
          </View>
        </View>

        <Button
          mode="contained"
          icon="pencil-outline"
          onPress={() => setIsStatusSheetVisible(true)}
          style={styles.statusButton}
          contentStyle={styles.statusButtonContent}
        >
          Изменить статус
        </Button>

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

      <StatusUpdateSheet
        visible={isStatusSheetVisible}
        currentStatus={idea.status}
        isSubmitting={isSubmittingStatus}
        onDismiss={() => setIsStatusSheetVisible(false)}
        onSubmit={handleStatusSubmit}
      />

      <AssigneePickerSheet
        visible={isAssigneeSheetVisible}
        officials={officials}
        currentUserId={user?.id ?? ""}
        selectedId={idea.assigneeId}
        isLoading={isLoadingOfficials}
        isSubmitting={isAssigning}
        submittingId={assigningOfficialId}
        error={officialsError}
        submitError={assignmentError}
        onDismiss={() => {
          setIsAssigneeSheetVisible(false)
          setAssignmentError("")
        }}
        onRetry={() => void loadOfficials()}
        onSelect={(official) => void handleAssign(official, true)}
      />

      <Snackbar visible={Boolean(snackbar)} onDismiss={() => setSnackbar("")} duration={2400}>
        {snackbar}
      </Snackbar>
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
  sectionLabel: { color: colors.inkMuted, fontWeight: "800", letterSpacing: 0.6, marginTop: 22, marginBottom: 10 },
  aiCard: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 19,
    backgroundColor: "#FFF6E4",
    marginTop: 18,
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
  warningCard: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 19,
    backgroundColor: "#FBE4E2",
    borderWidth: 1,
    borderColor: "#F2C4BE",
    marginTop: 14,
  },
  warningCopy: { flex: 1 },
  warningTitle: { color: colors.ink, fontWeight: "800" },
  warningText: { color: colors.inkMuted, lineHeight: 18, marginTop: 3 },
  assigneeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 14,
  },
  assigneeIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
  },
  assigneeCopy: { flex: 1 },
  assigneeActions: { alignItems: "flex-end" },
  assigneeTitle: { color: colors.ink, fontWeight: "700" },
  assigneeValue: { color: colors.inkMuted, marginTop: 2 },
  statusButton: { marginTop: 20, borderRadius: 14 },
  statusButtonContent: { minHeight: 48 },
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
