import { useCallback, useState } from "react"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import * as ImagePicker from "expo-image-picker"
import { Image, ScrollView, StyleSheet, View } from "react-native"
import { ActivityIndicator, Button, HelperText, IconButton, Snackbar, Text, TextInput } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

import { RatingStars } from "../components/RatingStars"
import { ideaService } from "../ideas/ideaService"
import type { IdeaRecord } from "../ideas/types"
import type { RootStackParamList } from "../navigation/types"
import { colors } from "../theme"

type Props = NativeStackScreenProps<RootStackParamList, "ImpactFeedback">

export function ImpactFeedbackScreen({ route, navigation }: Props) {
  const [idea, setIdea] = useState<IdeaRecord | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [showValidation, setShowValidation] = useState(false)
  const [snackbar, setSnackbar] = useState("")

  const loadIdea = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await ideaService.getById(route.params.ideaId)
      setIdea(result)
      setRating(result.rating ?? 0)
      setComment(result.ratingComment ?? "")
      setAfterPhotoUrl(result.afterPhotoUrl ?? null)
      setError("")
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Не удалось загрузить идею")
    } finally {
      setIsLoading(false)
    }
  }, [route.params.ideaId])

  useFocusEffect(useCallback(() => { void loadIdea() }, [loadIdea]))

  const selectAfterPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permission.granted) {
        setSnackbar("Разрешите доступ к фотографиям в настройках устройства")
        return
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.82,
      })
      if (!result.canceled && result.assets[0]) setAfterPhotoUrl(result.assets[0].uri)
    } catch {
      setSnackbar("Не удалось открыть галерею")
    }
  }

  const handleSubmit = async () => {
    setShowValidation(true)
    if (!idea || rating < 1 || isSubmitting) return

    setIsSubmitting(true)
    try {
      await ideaService.submitFeedback(idea.id, {
        rating,
        comment: comment.trim() || undefined,
        afterPhotoUrl: afterPhotoUrl || undefined,
      })
      navigation.replace("IdeaDetail", { ideaId: idea.id })
    } catch (caughtError) {
      setSnackbar(caughtError instanceof Error ? caughtError.message : "Не удалось отправить оценку")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.muted}>Открываем форму оценки…</Text>
      </SafeAreaView>
    )
  }

  if (!idea || error || idea.status !== "done") {
    return (
      <SafeAreaView style={styles.centered}>
        <MaterialCommunityIcons name="alert-circle-outline" size={42} color={colors.danger} />
        <Text variant="titleMedium" style={styles.errorTitle}>Оценка недоступна</Text>
        <Text style={styles.error}>
          {error || "Оценить можно только свою завершённую идею"}
        </Text>
        <Button mode="outlined" onPress={() => navigation.goBack()}>Назад</Button>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text variant="titleMedium" style={styles.headerTitle}>Оценить результат</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <MaterialCommunityIcons name="check-bold" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.successCopy}>
            <Text variant="titleMedium" style={styles.successTitle}>Работа завершена</Text>
            <Text variant="bodySmall" style={styles.successText}>{idea.title}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Фото до и после</Text>
          <Text variant="bodySmall" style={styles.sectionSubtitle}>Добавьте фото результата, если оно у вас есть</Text>
          <View style={styles.photoRow}>
            <PhotoCard label="ДО" uri={idea.photoUrl} placeholderIcon="image-outline" />
            <View style={styles.arrowCircle}>
              <MaterialCommunityIcons name="arrow-right" size={20} color={colors.primary} />
            </View>
            <View style={styles.photoCard}>
              {afterPhotoUrl ? (
                <>
                  <Image source={{ uri: afterPhotoUrl }} style={styles.photo} />
                  <IconButton
                    icon="close"
                    size={17}
                    iconColor="#FFFFFF"
                    containerColor="rgba(23,51,46,0.75)"
                    onPress={() => setAfterPhotoUrl(null)}
                    style={styles.removePhoto}
                  />
                </>
              ) : (
                <Button mode="text" icon="image-plus" onPress={selectAfterPhoto} contentStyle={styles.addPhotoContent}>
                  Добавить
                </Button>
              )}
              <View style={styles.photoLabel}><Text variant="labelSmall" style={styles.photoLabelText}>ПОСЛЕ</Text></View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Насколько вы довольны?</Text>
          <Text variant="bodySmall" style={styles.sectionSubtitle}>Ваша оценка поможет улучшить работу городских служб</Text>
          <View style={styles.ratingBox}>
            <RatingStars value={rating} onChange={setRating} size={38} />
            <Text variant="labelLarge" style={styles.ratingLabel}>
              {rating ? `${rating} из 5` : "Выберите оценку"}
            </Text>
          </View>
          {showValidation && rating < 1 ? (
            <HelperText type="error" visible>Поставьте оценку от 1 до 5</HelperText>
          ) : null}

          <TextInput
            mode="outlined"
            label="Комментарий (необязательно)"
            placeholder="Что изменилось и довольны ли вы результатом?"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={5}
            maxLength={1000}
            style={styles.commentInput}
            right={<TextInput.Affix text={`${comment.length}/1000`} />}
            textContentType="none"
            autoComplete="off"
          />
        </View>

        <Button
          mode="contained"
          icon="send-check-outline"
          loading={isSubmitting}
          disabled={isSubmitting}
          onPress={handleSubmit}
          contentStyle={styles.submitContent}
        >
          {idea.rating ? "Обновить оценку" : "Отправить оценку"}
        </Button>
      </ScrollView>

      <Snackbar visible={Boolean(snackbar)} onDismiss={() => setSnackbar("")} duration={3500}>
        {snackbar}
      </Snackbar>
    </SafeAreaView>
  )
}

function PhotoCard({ label, uri, placeholderIcon }: { label: string; uri: string; placeholderIcon: string }) {
  return (
    <View style={styles.photoCard}>
      {uri.startsWith("mock://") ? (
        <View style={styles.photoPlaceholder}>
          <MaterialCommunityIcons
            name={placeholderIcon as React.ComponentProps<typeof MaterialCommunityIcons>["name"]}
            size={34}
            color={colors.primary}
          />
        </View>
      ) : (
        <Image source={{ uri }} style={styles.photo} />
      )}
      <View style={styles.photoLabel}><Text variant="labelSmall" style={styles.photoLabelText}>{label}</Text></View>
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  headerTitle: { flex: 1, textAlign: "center", color: colors.ink, fontWeight: "800" },
  headerSpacer: { width: 48 },
  content: { width: "100%", maxWidth: 680, alignSelf: "center", padding: 20, paddingBottom: 42, gap: 18 },
  successCard: { flexDirection: "row", alignItems: "center", gap: 13, padding: 17, borderRadius: 22, backgroundColor: "#DDEFE7" },
  successIcon: { width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary },
  successCopy: { flex: 1 },
  successTitle: { color: colors.ink, fontWeight: "800" },
  successText: { color: colors.inkMuted, marginTop: 2 },
  section: { gap: 12, padding: 18, borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  sectionTitle: { color: colors.ink, fontWeight: "800" },
  sectionSubtitle: { color: colors.inkMuted, marginTop: -7 },
  photoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  photoCard: { flex: 1, height: 150, borderRadius: 18, overflow: "hidden", backgroundColor: colors.surfaceMuted, alignItems: "center", justifyContent: "center" },
  photo: { width: "100%", height: "100%" },
  photoPlaceholder: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DDEFE7",
  },
  photoLabel: { position: "absolute", left: 8, bottom: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: "rgba(23,51,46,0.82)" },
  photoLabelText: { color: "#FFFFFF", fontWeight: "900", letterSpacing: 0.6 },
  removePhoto: { position: "absolute", top: 4, right: 4 },
  addPhotoContent: { minHeight: 96, flexDirection: "column" },
  arrowCircle: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceMuted },
  ratingBox: { alignItems: "center", gap: 6, paddingVertical: 8 },
  ratingLabel: { color: colors.inkMuted },
  commentInput: { minHeight: 130, backgroundColor: colors.surface },
  submitContent: { minHeight: 56 },
  muted: { color: colors.inkMuted },
  errorTitle: { color: colors.ink, fontWeight: "800" },
  error: { color: colors.inkMuted, textAlign: "center" },
})
