import { useEffect, useRef, useState } from "react"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { Pressable, StyleSheet, View } from "react-native"
import { ActivityIndicator, HelperText, Text, TextInput } from "react-native-paper"

import { geocodingService } from "../geocoding/geocodingService"
import type { AddressSearchResult } from "../geocoding/types"
import { colors } from "../theme"

type Props = {
  onSelect: (result: AddressSearchResult) => void
}

export function AddressSearch({ onSelect }: Props) {
  const requestId = useRef(0)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<AddressSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSelectionLocked, setIsSelectionLocked] = useState(false)
  const normalizedQuery = query.trim()

  useEffect(() => {
    if (isSelectionLocked || normalizedQuery.length < 2) {
      setResults([])
      setIsLoading(false)
      setError("")
      return
    }

    const currentRequest = requestId.current + 1
    requestId.current = currentRequest
    setIsLoading(true)
    setError("")

    const timer = setTimeout(() => {
      geocodingService
        .search(normalizedQuery)
        .then((nextResults) => {
          if (requestId.current === currentRequest) setResults(nextResults)
        })
        .catch((caughtError) => {
          if (requestId.current === currentRequest) {
            setResults([])
            setError(caughtError instanceof Error ? caughtError.message : "Не удалось выполнить поиск")
          }
        })
        .finally(() => {
          if (requestId.current === currentRequest) setIsLoading(false)
        })
    }, 400)

    return () => clearTimeout(timer)
  }, [isSelectionLocked, normalizedQuery])

  const handleQueryChange = (value: string) => {
    setIsSelectionLocked(false)
    setQuery(value)
  }

  const handleSelect = (result: AddressSearchResult) => {
    requestId.current += 1
    setQuery(result.displayName)
    setResults([])
    setError("")
    setIsLoading(false)
    setIsSelectionLocked(true)
    onSelect(result)
  }

  const clear = () => {
    requestId.current += 1
    setQuery("")
    setResults([])
    setError("")
    setIsLoading(false)
    setIsSelectionLocked(false)
  }

  const showEmpty = normalizedQuery.length >= 2 && !isLoading && !error && !results.length && !isSelectionLocked

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        label="Найти улицу или адрес"
        placeholder="Например: улица Абая"
        value={query}
        onChangeText={handleQueryChange}
        autoCorrect={false}
        textContentType="none"
        autoComplete="off"
        left={<TextInput.Icon icon="magnify" />}
        right={
          isLoading
            ? <TextInput.Icon icon={() => <ActivityIndicator size={20} color={colors.primary} />} />
            : query
              ? <TextInput.Icon icon="close" onPress={clear} />
              : undefined
        }
        style={styles.input}
      />

      {results.length ? (
        <View style={styles.results}>
          {results.slice(0, 5).map((result, index) => (
            <Pressable
              key={`${result.lat}-${result.lng}-${index}`}
              accessibilityRole="button"
              accessibilityLabel={`Выбрать адрес ${result.displayName}`}
              onPress={() => handleSelect(result)}
              style={({ pressed }) => [styles.result, pressed && styles.resultPressed]}
            >
              <View style={styles.resultIcon}>
                <MaterialCommunityIcons name="map-marker-outline" size={21} color={colors.primary} />
              </View>
              <Text variant="bodyMedium" style={styles.resultText} numberOfLines={2}>
                {result.displayName}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={21} color={colors.inkMuted} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {showEmpty ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="map-search-outline" size={20} color={colors.inkMuted} />
          <Text variant="bodySmall" style={styles.emptyText}>Адреса не найдены. Уточните запрос или выберите точку на карте.</Text>
        </View>
      ) : null}

      {error ? <HelperText type="error" visible>{error}</HelperText> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 7 },
  input: { backgroundColor: colors.surface },
  results: {
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  result: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 58, paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  resultPressed: { backgroundColor: colors.surfaceMuted },
  resultIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceMuted },
  resultText: { flex: 1, color: colors.ink, lineHeight: 19 },
  emptyState: { flexDirection: "row", alignItems: "center", gap: 8, padding: 11, borderRadius: 14, backgroundColor: colors.surfaceMuted },
  emptyText: { flex: 1, color: colors.inkMuted, lineHeight: 18 },
})
