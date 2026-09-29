import { useEffect, useMemo, useState } from "react"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native"
import { ActivityIndicator, Button, HelperText, Text, TextInput } from "react-native-paper"

import { colors } from "../theme"
import type { GovOfficial } from "../users/types"

type Props = {
  visible: boolean
  officials: GovOfficial[]
  currentUserId: string
  selectedId?: string | null
  isLoading: boolean
  isSubmitting: boolean
  submittingId?: string | null
  error: string
  submitError: string
  onDismiss: () => void
  onRetry: () => void
  onSelect: (official: GovOfficial) => void
}

export function AssigneePickerSheet({
  visible,
  officials,
  currentUserId,
  selectedId,
  isLoading,
  isSubmitting,
  submittingId,
  error,
  submitError,
  onDismiss,
  onRetry,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (visible) setQuery("")
  }, [visible])

  const filteredOfficials = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return officials.filter((official) => {
      if (String(official.id) === String(currentUserId)) return false
      if (!normalizedQuery) return true
      return `${official.name} ${official.email}`.toLowerCase().includes(normalizedQuery)
    })
  }, [currentUserId, officials, query])

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text variant="titleLarge" style={styles.title}>
            Назначить исполнителя
          </Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            Выберите сотрудника, который будет вести обращение
          </Text>

          <TextInput
            mode="outlined"
            placeholder="Поиск по имени или email"
            value={query}
            onChangeText={setQuery}
            left={<TextInput.Icon icon="magnify" />}
            right={query ? <TextInput.Icon icon="close" onPress={() => setQuery("")} /> : undefined}
            style={styles.search}
            disabled={isLoading || isSubmitting}
          />

          <View style={styles.listContainer}>
            {isLoading ? (
              <View style={styles.state}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.stateText}>Загружаем сотрудников…</Text>
              </View>
            ) : error ? (
              <View style={styles.state}>
                <MaterialCommunityIcons name="alert-circle-outline" size={34} color={colors.danger} />
                <Text style={styles.stateText}>{error}</Text>
                <Button mode="outlined" onPress={onRetry}>Повторить</Button>
              </View>
            ) : filteredOfficials.length === 0 ? (
              <View style={styles.state}>
                <MaterialCommunityIcons name="account-search-outline" size={38} color={colors.inkMuted} />
                <Text variant="titleSmall" style={styles.emptyTitle}>
                  {query ? "Никого не нашли" : "Других сотрудников пока нет"}
                </Text>
                <Text style={styles.stateText}>
                  {query ? "Попробуйте изменить запрос" : "Вы можете назначить обращение себе быстрым действием"}
                </Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {filteredOfficials.map((official) => {
                  const isSelected = String(official.id) === String(selectedId ?? "")
                  return (
                    <Pressable
                      key={official.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Назначить сотрудника ${official.name}`}
                      disabled={isSubmitting}
                      onPress={() => onSelect(official)}
                      style={({ pressed }) => [
                        styles.official,
                        isSelected && styles.officialSelected,
                        pressed && styles.officialPressed,
                      ]}
                    >
                      <View style={styles.avatar}>
                        <Text variant="titleMedium" style={styles.avatarText}>
                          {official.name.trim().charAt(0).toUpperCase() || "С"}
                        </Text>
                      </View>
                      <View style={styles.officialCopy}>
                        <Text variant="bodyLarge" style={styles.officialName}>{official.name}</Text>
                        <Text variant="bodySmall" style={styles.officialEmail}>{official.email}</Text>
                      </View>
                      {isSubmitting && String(submittingId ?? "") === String(official.id) ? (
                        <ActivityIndicator size={22} color={colors.primary} />
                      ) : isSelected ? (
                        <MaterialCommunityIcons name="check-circle" size={22} color={colors.primary} />
                      ) : (
                        <MaterialCommunityIcons name="chevron-right" size={22} color={colors.inkMuted} />
                      )}
                    </Pressable>
                  )
                })}
              </ScrollView>
            )}
          </View>

          {submitError ? (
            <HelperText type="error" visible style={styles.submitError}>
              {submitError}
            </HelperText>
          ) : null}

          <Button mode="text" onPress={onDismiss} disabled={isSubmitting}>
            Закрыть
          </Button>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(23,51,46,0.45)" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingBottom: 28,
    maxHeight: "86%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: 14,
  },
  title: { color: colors.ink, fontWeight: "800" },
  subtitle: { color: colors.inkMuted, marginTop: 2 },
  search: { backgroundColor: colors.surface, marginTop: 16 },
  listContainer: { minHeight: 210, maxHeight: 380, marginTop: 12 },
  state: { flex: 1, minHeight: 210, alignItems: "center", justifyContent: "center", gap: 10, padding: 20 },
  stateText: { color: colors.inkMuted, textAlign: "center" },
  emptyTitle: { color: colors.ink, fontWeight: "800", textAlign: "center" },
  official: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: 16,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  officialSelected: { backgroundColor: colors.surfaceMuted, borderColor: colors.primary },
  officialPressed: { opacity: 0.72 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
  },
  avatarText: { color: colors.primary, fontWeight: "900" },
  officialCopy: { flex: 1 },
  officialName: { color: colors.ink, fontWeight: "700" },
  officialEmail: { color: colors.inkMuted, marginTop: 2 },
  submitError: { textAlign: "center" },
})
