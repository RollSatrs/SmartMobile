import { useCallback, useMemo, useState } from "react"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native"
import { ActivityIndicator, Button, IconButton, SegmentedButtons, Text } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

import { useAuth } from "../auth/AuthContext"
import { IdeaCard } from "../components/IdeaCard"
import { ideaService } from "../ideas/ideaService"
import type { IdeaRecord } from "../ideas/types"
import type { RootStackParamList } from "../navigation/types"
import { colors } from "../theme"

type Props = NativeStackScreenProps<RootStackParamList, "ResidentHome">
type Filter = "all" | "active" | "done"

export function ResidentHomeScreen({ navigation }: Props) {
  const { user, signOut } = useAuth()
  const [ideas, setIdeas] = useState<IdeaRecord[]>([])
  const [filter, setFilter] = useState<Filter>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState("")

  const loadIdeas = useCallback(async (refresh = false) => {
    refresh ? setIsRefreshing(true) : setIsLoading(true)
    try {
      const response = await ideaService.listMine()
      setIdeas(response.items)
      setError("")
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Не удалось загрузить идеи")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void loadIdeas()
    }, [loadIdeas]),
  )

  const filteredIdeas = useMemo(() => {
    if (filter === "done") return ideas.filter((idea) => idea.status === "done")
    if (filter === "active") {
      return ideas.filter((idea) => !["done", "rejected"].includes(idea.status))
    }
    return ideas
  }, [filter, ideas])

  const stats = useMemo(
    () => ({
      total: ideas.length,
      active: ideas.filter((idea) => !["done", "rejected"].includes(idea.status)).length,
      done: ideas.filter((idea) => idea.status === "done").length,
      unread: ideas.filter((idea) => idea.hasUnreadUpdate).length,
    }),
    [ideas],
  )

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadIdeas(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text variant="labelLarge" style={styles.eyebrow}>
              SMART CITY · АБАЙ
            </Text>
            <Text variant="headlineMedium" style={styles.greeting}>
              Здравствуйте, {user?.name?.split(" ")[0]}
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Следите за идеями и ответами города
            </Text>
          </View>
          <View style={styles.headerActions}>
            <View>
              <IconButton icon="bell-outline" containerColor={colors.surface} />
              {stats.unread ? (
                <View style={styles.badge}>
                  <Text variant="labelSmall" style={styles.badgeText}>
                    {stats.unread}
                  </Text>
                </View>
              ) : null}
            </View>
            <IconButton
              icon="trophy-outline"
              onPress={() => navigation.navigate("DistrictRanking")}
              containerColor={colors.surface}
              accessibilityLabel="Рейтинг районов"
            />
            <IconButton icon="logout" onPress={signOut} containerColor={colors.surface} />
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={28} color={colors.primary} />
            </View>
            <Text variant="labelLarge" style={styles.heroLabel}>
              ЕСТЬ ПРЕДЛОЖЕНИЕ?
            </Text>
          </View>
          <Text variant="headlineSmall" style={styles.heroTitle}>
            Сделаем область лучше вместе
          </Text>
          <Text variant="bodyMedium" style={styles.heroText}>
            Опишите идею, добавьте фото и отметьте место — это займёт несколько минут.
          </Text>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => navigation.navigate("CreateIdea")}
            style={styles.createButton}
            contentStyle={styles.createButtonContent}
          >
            Подать новую идею
          </Button>
          <Button
            mode="outlined"
            icon="creation"
            onPress={() => navigation.navigate("AiIdeaChat")}
            style={styles.aiCreateButton}
            contentStyle={styles.createButtonContent}
          >
            Описать идею с AI
          </Button>
        </View>

        <View style={styles.statsRow}>
          <StatCard value={stats.total} label="Всего" icon="file-document-outline" />
          <StatCard value={stats.active} label="Активные" icon="progress-clock" />
          <StatCard value={stats.done} label="Готово" icon="check-circle-outline" />
        </View>

        <View style={styles.listHeading}>
          <View>
            <Text variant="titleLarge" style={styles.listTitle}>
              Мои идеи
            </Text>
            <Text variant="bodySmall" style={styles.listSubtitle}>
              Актуальные статусы обращений
            </Text>
          </View>
          <Text variant="labelLarge" style={styles.count}>
            {filteredIdeas.length}
          </Text>
        </View>

        <SegmentedButtons
          value={filter}
          onValueChange={(value) => setFilter(value as Filter)}
          buttons={[
            { value: "all", label: "Все" },
            { value: "active", label: "Активные" },
            { value: "done", label: "Готово" },
          ]}
          style={styles.filters}
        />

        {isLoading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.stateText}>Загружаем ваши идеи…</Text>
          </View>
        ) : error ? (
          <View style={styles.stateBox}>
            <MaterialCommunityIcons name="cloud-alert-outline" size={38} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <Button mode="outlined" onPress={() => loadIdeas()}>
              Повторить
            </Button>
          </View>
        ) : filteredIdeas.length ? (
          <View style={styles.list}>
            {filteredIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onPress={() => navigation.navigate("IdeaDetail", { ideaId: idea.id })}
              />
            ))}
          </View>
        ) : (
          <View style={styles.stateBox}>
            <MaterialCommunityIcons name="inbox-outline" size={42} color={colors.inkMuted} />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              В этом разделе пока пусто
            </Text>
            <Text variant="bodySmall" style={styles.stateText}>
              Измените фильтр или отправьте новую идею.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function StatCard({ value, label, icon }: { value: number; label: string; icon: string }) {
  return (
    <View style={styles.statCard}>
      <MaterialCommunityIcons
        name={icon as React.ComponentProps<typeof MaterialCommunityIcons>["name"]}
        size={22}
        color={colors.primary}
      />
      <Text variant="headlineSmall" style={styles.statValue}>
        {value}
      </Text>
      <Text variant="labelSmall" style={styles.statLabel}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 42,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerCopy: { flex: 1 },
  headerActions: { flexDirection: "row" },
  eyebrow: { color: colors.primary, fontWeight: "800", letterSpacing: 1 },
  greeting: { color: colors.ink, fontWeight: "800", marginTop: 6 },
  headerSubtitle: { color: colors.inkMuted, marginTop: 3 },
  badge: {
    position: "absolute",
    top: 3,
    right: 3,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary,
  },
  badgeText: { color: "#FFFFFF", fontWeight: "900" },
  hero: {
    marginTop: 24,
    padding: 22,
    borderRadius: 26,
    backgroundColor: "#DDEFE7",
    overflow: "hidden",
  },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  heroLabel: { color: colors.primary, fontWeight: "900", letterSpacing: 0.8 },
  heroTitle: { color: colors.ink, fontWeight: "900", marginTop: 16 },
  heroText: { color: colors.inkMuted, lineHeight: 22, marginTop: 7, maxWidth: 520 },
  createButton: { alignSelf: "flex-start", marginTop: 18 },
  aiCreateButton: { alignSelf: "flex-start", marginTop: 10 },
  createButtonContent: { minHeight: 50 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  statCard: {
    flex: 1,
    minHeight: 112,
    padding: 13,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { color: colors.ink, fontWeight: "900", marginTop: 5 },
  statLabel: { color: colors.inkMuted, marginTop: 2 },
  listHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 30,
  },
  listTitle: { color: colors.ink, fontWeight: "900" },
  listSubtitle: { color: colors.inkMuted, marginTop: 2 },
  count: {
    minWidth: 34,
    textAlign: "center",
    color: colors.primary,
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 12,
  },
  filters: { marginTop: 16 },
  list: { gap: 13, marginTop: 16 },
  stateBox: {
    minHeight: 190,
    marginTop: 16,
    padding: 24,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stateText: { color: colors.inkMuted, textAlign: "center" },
  errorText: { color: colors.danger, textAlign: "center" },
  emptyTitle: { color: colors.ink, fontWeight: "800" },
})
