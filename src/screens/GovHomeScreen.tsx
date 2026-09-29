import { useCallback, useEffect, useRef, useState } from "react"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native"
import { ActivityIndicator, Button, IconButton, Text, TextInput } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

import { IdeaCard } from "../components/IdeaCard"
import { useAuth } from "../auth/AuthContext"
import { ideaService } from "../ideas/ideaService"
import { ideaStatusConfig } from "../ideas/status"
import { IDEA_CATEGORIES, type GovIdeaFilters, type IdeaRecord, type IdeaStatus } from "../ideas/types"
import type { RootStackParamList } from "../navigation/types"
import { colors } from "../theme"

type Props = NativeStackScreenProps<RootStackParamList, "GovHome">

const STATUS_FILTERS: IdeaStatus[] = [
  "received",
  "in_review",
  "in_progress",
  "done",
  "rejected",
  "needs_clarification",
]

function Chip({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text variant="labelMedium" style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  )
}

export function GovHomeScreen({ navigation }: Props) {
  const { signOut } = useAuth()

  const [items, setItems] = useState<IdeaRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<IdeaStatus | undefined>(undefined)
  const [category, setCategory] = useState<string | undefined>(undefined)
  const [district, setDistrict] = useState("")

  const requestId = useRef(0)

  const filters: GovIdeaFilters = { search: search.trim() || undefined, status, category, district: district.trim() || undefined }

  const load = useCallback(
    async (targetPage: number, mode: "replace" | "append") => {
      const currentRequest = ++requestId.current
      if (mode === "replace") setIsLoading(true)
      else setIsLoadingMore(true)

      try {
        const result = await ideaService.listAll(filters, targetPage)
        if (currentRequest !== requestId.current) return
        setItems((previous) => (mode === "replace" ? result.items : [...previous, ...result.items]))
        setTotal(result.total)
        setPage(targetPage)
        setError("")
      } catch (caughtError) {
        if (currentRequest !== requestId.current) return
        setError(caughtError instanceof Error ? caughtError.message : "Не удалось загрузить обращения")
      } finally {
        if (currentRequest === requestId.current) {
          setIsLoading(false)
          setIsLoadingMore(false)
          setIsRefreshing(false)
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search, status, category, district],
  )

  useEffect(() => {
    const timeout = setTimeout(() => void load(1, "replace"), search ? 350 : 0)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, category, district])

  useFocusEffect(
    useCallback(() => {
      void load(1, "replace")
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  )

  const onRefresh = () => {
    setIsRefreshing(true)
    void load(1, "replace")
  }

  const onLoadMore = () => {
    if (isLoadingMore || isLoading || items.length >= total) return
    void load(page + 1, "append")
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="labelLarge" style={styles.eyebrow}>
            SMART CITY · АБАЙ
          </Text>
          <Text variant="headlineSmall" style={styles.title}>
            Кабинет госоргана
          </Text>
        </View>
        <IconButton icon="logout" onPress={signOut} accessibilityLabel="Выйти" />
      </View>

      <View style={styles.filters}>
        <TextInput
          mode="outlined"
          placeholder="Поиск по названию или описанию"
          value={search}
          onChangeText={setSearch}
          left={<TextInput.Icon icon="magnify" />}
          style={styles.searchInput}
          dense
        />
        <TextInput
          mode="outlined"
          placeholder="Район"
          value={district}
          onChangeText={setDistrict}
          left={<TextInput.Icon icon="map-marker-outline" />}
          style={styles.searchInput}
          dense
        />

        <View style={styles.chipRow}>
          <Chip label="Все статусы" active={!status} onPress={() => setStatus(undefined)} />
          {STATUS_FILTERS.map((value) => (
            <Chip
              key={value}
              label={ideaStatusConfig[value].label}
              active={status === value}
              onPress={() => setStatus(status === value ? undefined : value)}
            />
          ))}
        </View>

        <View style={styles.chipRow}>
          <Chip label="Все категории" active={!category} onPress={() => setCategory(undefined)} />
          {IDEA_CATEGORIES.map((value) => (
            <Chip
              key={value}
              label={value}
              active={category === value}
              onPress={() => setCategory(category === value ? undefined : value)}
            />
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="alert-circle-outline" size={38} color={colors.danger} />
          <Text style={styles.error}>{error}</Text>
          <Button mode="outlined" onPress={() => void load(1, "replace")}>
            Повторить
          </Button>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="folder-search-outline" size={44} color={colors.inkMuted} />
          <Text style={styles.muted}>По этим фильтрам обращений не найдено</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          onEndReachedThreshold={0.4}
          onEndReached={onLoadMore}
          ListHeaderComponent={
            <Text variant="labelMedium" style={styles.resultsCount}>
              Найдено: {total}
            </Text>
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <IdeaCard idea={item} onPress={() => navigation.navigate("GovIdeaDetail", { ideaId: item.id })} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  headerText: { flex: 1 },
  eyebrow: { color: colors.primary, fontWeight: "800", letterSpacing: 1.1 },
  title: { color: colors.ink, fontWeight: "800", marginTop: 4 },
  filters: { paddingHorizontal: 20, paddingTop: 12, gap: 10 },
  searchInput: { backgroundColor: colors.surface },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.ink },
  chipTextActive: { color: "#FFFFFF", fontWeight: "700" },
  list: { padding: 20, paddingTop: 14, gap: 14, width: "100%", maxWidth: 680, alignSelf: "center" },
  separator: { height: 14 },
  resultsCount: { color: colors.inkMuted, marginBottom: 4 },
  footerLoader: { paddingVertical: 20 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 24 },
  muted: { color: colors.inkMuted, textAlign: "center" },
  error: { color: colors.danger, textAlign: "center" },
})
