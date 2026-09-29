import { useRef, useState } from "react"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native"
import {
  ActivityIndicator,
  Button,
  HelperText,
  IconButton,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

import { IdeaMap } from "../components/IdeaMap"
import { ideaService } from "../ideas/ideaService"
import type { Coordinates } from "../ideas/types"
import type { RootStackParamList } from "../navigation/types"
import { colors } from "../theme"

type Props = NativeStackScreenProps<RootStackParamList, "CreateIdea">

type PhotoSource = "camera" | "library"

export function CreateIdeaScreen({ navigation }: Props) {
  const districtRequest = useRef(0)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [district, setDistrict] = useState("")
  const [districtError, setDistrictError] = useState("")
  const [isResolvingDistrict, setIsResolvingDistrict] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [snackbar, setSnackbar] = useState("")

  const titleValid = title.trim().length >= 3
  const descriptionValid = description.trim().length >= 15
  const formValid = titleValid && descriptionValid && Boolean(photoUri && coordinates && district)

  const selectPhoto = async (source: PhotoSource) => {
    try {
      const permission =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permission.granted) {
        setSnackbar(
          source === "camera"
            ? "Разрешите доступ к камере в настройках устройства"
            : "Разрешите доступ к фотографиям в настройках устройства",
        )
        return
      }

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              quality: 0.82,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              quality: 0.82,
            })

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri)
      }
    } catch {
      setSnackbar("Не удалось открыть камеру или галерею")
    }
  }

  const handleCoordinatesChange = async (nextCoordinates: Coordinates) => {
    const requestId = districtRequest.current + 1
    districtRequest.current = requestId
    setCoordinates(nextCoordinates)
    setDistrict("")
    setDistrictError("")
    setIsResolvingDistrict(true)

    try {
      const resolvedDistrict = await ideaService.resolveDistrict(nextCoordinates)
      if (requestId === districtRequest.current) {
        setDistrict(resolvedDistrict)
      }
    } catch (error) {
      if (requestId === districtRequest.current) {
        setDistrictError(error instanceof Error ? error.message : "Не удалось определить район")
      }
    } finally {
      if (requestId === districtRequest.current) {
        setIsResolvingDistrict(false)
      }
    }
  }

  const handleSubmit = async () => {
    setShowValidation(true)
    if (!formValid || !photoUri || !coordinates || isSubmitting) return

    setIsSubmitting(true)
    try {
      const idea = await ideaService.create({
        title: title.trim(),
        description: description.trim(),
        photoUrl: photoUri,
        lat: coordinates.latitude,
        lng: coordinates.longitude,
      })
      navigation.replace("IdeaSubmitted", { ideaId: idea.id })
    } catch (error) {
      setSnackbar(error instanceof Error ? error.message : "Не удалось отправить идею")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <View style={styles.headerCopy}>
            <Text variant="titleLarge" style={styles.headerTitle}>
              Новая идея
            </Text>
            <Text variant="bodySmall" style={styles.headerSubtitle}>
              Расскажите, что можно улучшить
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introCard}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={28} color={colors.primary} />
            <View style={styles.introCopy}>
              <Text variant="titleMedium" style={styles.introTitle}>
                Идея для области Абай
              </Text>
              <Text variant="bodySmall" style={styles.introText}>
                Опишите проблему конкретно — так её быстрее направят ответственному органу.
              </Text>
            </View>
          </View>

          <Section number="1" title="Опишите идею" subtitle="Название и суть предложения">
            <TextInput
              mode="outlined"
              label="Короткое название"
              value={title}
              onChangeText={setTitle}
              maxLength={120}
              error={showValidation && !titleValid}
              right={<TextInput.Affix text={`${title.length}/120`} />}
            />
            {showValidation && !titleValid ? (
              <HelperText type="error" visible>
                Введите не менее 3 символов
              </HelperText>
            ) : null}
            <TextInput
              mode="outlined"
              label="Проблема и предлагаемое решение"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              maxLength={1500}
              error={showValidation && !descriptionValid}
              style={styles.descriptionInput}
              right={<TextInput.Affix text={`${description.length}/1500`} />}
            />
            {showValidation && !descriptionValid ? (
              <HelperText type="error" visible>
                Добавьте подробности — минимум 15 символов
              </HelperText>
            ) : null}
          </Section>

          <Section number="2" title="Добавьте фото" subtitle="Фото помогает быстрее оценить ситуацию">
            {photoUri ? (
              <View style={styles.photoPreview}>
                <Image source={{ uri: photoUri }} style={styles.photo} />
                <IconButton
                  icon="close"
                  iconColor="#FFFFFF"
                  containerColor="rgba(23,51,46,0.78)"
                  onPress={() => setPhotoUri(null)}
                  style={styles.removePhoto}
                />
              </View>
            ) : (
              <View style={styles.photoPlaceholder}>
                <MaterialCommunityIcons name="image-plus" size={36} color={colors.primary} />
                <Text variant="bodyMedium" style={styles.photoPlaceholderText}>
                  Прикрепите один понятный снимок
                </Text>
              </View>
            )}
            <View style={styles.photoActions}>
              <Button
                mode="contained-tonal"
                icon="camera-outline"
                onPress={() => selectPhoto("camera")}
                style={styles.photoAction}
              >
                Камера
              </Button>
              <Button
                mode="outlined"
                icon="image-multiple-outline"
                onPress={() => selectPhoto("library")}
                style={styles.photoAction}
              >
                Галерея
              </Button>
            </View>
            {showValidation && !photoUri ? (
              <HelperText type="error" visible>
                Добавьте фотографию
              </HelperText>
            ) : null}
          </Section>

          <Section number="3" title="Укажите место" subtitle="Нажмите на карту или перетащите метку">
            <IdeaMap
              value={coordinates}
              onChange={handleCoordinatesChange}
              onError={setSnackbar}
            />
            {coordinates ? (
              <View style={styles.coordinateRow}>
                <MaterialCommunityIcons name="crosshairs" size={18} color={colors.inkMuted} />
                <Text variant="bodySmall" style={styles.coordinateText}>
                  {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}
                </Text>
              </View>
            ) : null}
            <View style={styles.districtCard}>
              {isResolvingDistrict ? (
                <>
                  <ActivityIndicator size={20} color={colors.primary} />
                  <Text style={styles.districtText}>Определяем район…</Text>
                </>
              ) : district ? (
                <>
                  <MaterialCommunityIcons name="map-marker-check" size={22} color={colors.primary} />
                  <View style={styles.districtCopy}>
                    <Text variant="labelSmall" style={styles.districtLabel}>
                      РАЙОН ОПРЕДЕЛЁН
                    </Text>
                    <Text variant="bodyMedium" style={styles.districtValue}>
                      {district}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons
                    name={districtError ? "alert-circle-outline" : "map-marker-outline"}
                    size={22}
                    color={districtError ? colors.danger : colors.inkMuted}
                  />
                  <Text style={[styles.districtText, districtError && styles.errorText]}>
                    {districtError || "Выберите точку, чтобы определить район"}
                  </Text>
                </>
              )}
            </View>
            {showValidation && !coordinates ? (
              <HelperText type="error" visible>
                Поставьте точку на карте
              </HelperText>
            ) : null}
          </Section>

          <View style={styles.aiNote}>
            <MaterialCommunityIcons name="creation" size={24} color={colors.secondary} />
            <View style={styles.aiCopy}>
              <Text variant="titleSmall" style={styles.aiTitle}>
                Категорию определит AI
              </Text>
              <Text variant="bodySmall" style={styles.aiText}>
                Выбирать направление вручную не нужно — система проанализирует текст и фото после отправки.
              </Text>
            </View>
          </View>

          <Button
            mode="contained"
            icon="send-outline"
            loading={isSubmitting}
            disabled={isSubmitting || isResolvingDistrict}
            onPress={handleSubmit}
            contentStyle={styles.submitContent}
          >
            Отправить идею
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
      <Snackbar visible={Boolean(snackbar)} onDismiss={() => setSnackbar("")} duration={3500}>
        {snackbar}
      </Snackbar>
    </SafeAreaView>
  )
}

type SectionProps = {
  number: string
  title: string
  subtitle: string
  children: React.ReactNode
}

function Section({ number, title, subtitle, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <View style={styles.stepBadge}>
          <Text variant="labelLarge" style={styles.stepNumber}>
            {number}
          </Text>
        </View>
        <View style={styles.sectionHeadingCopy}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {title}
          </Text>
          <Text variant="bodySmall" style={styles.sectionSubtitle}>
            {subtitle}
          </Text>
        </View>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 6,
  },
  headerCopy: { flex: 1, alignItems: "center" },
  headerSpacer: { width: 48 },
  headerTitle: { color: colors.ink, fontWeight: "800" },
  headerSubtitle: { color: colors.inkMuted },
  content: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 36,
    gap: 18,
  },
  introCard: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#DDEFE7",
  },
  introCopy: { flex: 1 },
  introTitle: { color: colors.ink, fontWeight: "800" },
  introText: { color: colors.inkMuted, lineHeight: 18, marginTop: 4 },
  section: {
    padding: 18,
    gap: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sectionHeading: { flexDirection: "row", gap: 12, alignItems: "center" },
  stepBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  stepNumber: { color: "#FFFFFF", fontWeight: "900" },
  sectionHeadingCopy: { flex: 1 },
  sectionTitle: { color: colors.ink, fontWeight: "800" },
  sectionSubtitle: { color: colors.inkMuted, marginTop: 2 },
  sectionBody: { gap: 12 },
  descriptionInput: { minHeight: 150 },
  photoPreview: { height: 220, borderRadius: 18, overflow: "hidden" },
  photo: { width: "100%", height: "100%" },
  removePhoto: { position: "absolute", top: 8, right: 8 },
  photoPlaceholder: {
    height: 154,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F8FAF8",
  },
  photoPlaceholderText: { color: colors.inkMuted },
  photoActions: { flexDirection: "row", gap: 10 },
  photoAction: { flex: 1 },
  coordinateRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  coordinateText: { color: colors.inkMuted, fontVariant: ["tabular-nums"] },
  districtCard: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 13,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
  },
  districtCopy: { flex: 1 },
  districtLabel: { color: colors.primary, fontWeight: "800", letterSpacing: 0.7 },
  districtValue: { color: colors.ink, fontWeight: "700", marginTop: 2 },
  districtText: { flex: 1, color: colors.inkMuted },
  errorText: { color: colors.danger },
  aiNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFF6E4",
  },
  aiCopy: { flex: 1 },
  aiTitle: { color: colors.ink, fontWeight: "800" },
  aiText: { color: colors.inkMuted, lineHeight: 18, marginTop: 3 },
  submitContent: { minHeight: 56 },
})
