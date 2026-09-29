import { useState } from "react"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native"
import { Button, HelperText, IconButton, Snackbar, Text, TextInput } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

import { aiService } from "../ai/aiService"
import type { ParsedIdea } from "../ai/types"
import type { RootStackParamList } from "../navigation/types"
import { colors } from "../theme"

type Props = NativeStackScreenProps<RootStackParamList, "AiIdeaChat">

const categoryLabels: Record<string, string> = {
  roads: "Дороги и транспорт",
  improvement: "Благоустройство",
  lighting: "Освещение",
  ecology: "Экология и озеленение",
}

export function AiIdeaChatScreen({ navigation }: Props) {
  const [message, setMessage] = useState("")
  const [parsedIdea, setParsedIdea] = useState<ParsedIdea | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [snackbar, setSnackbar] = useState("")

  const messageValid = message.trim().length >= 10
  const parsedIdeaValid = Boolean(
    parsedIdea && parsedIdea.title.trim().length >= 3 && parsedIdea.description.trim().length >= 15,
  )

  const handleParse = async () => {
    setShowValidation(true)
    if (!messageValid || isParsing) return

    setIsParsing(true)
    try {
      setParsedIdea(await aiService.parseIdea(message.trim()))
      setShowValidation(false)
    } catch (error) {
      setSnackbar(error instanceof Error ? error.message : "AI не смог разобрать сообщение")
    } finally {
      setIsParsing(false)
    }
  }

  const handleClarify = () => {
    setParsedIdea(null)
    setShowValidation(false)
  }

  const handleContinue = () => {
    if (!parsedIdea || !parsedIdeaValid) return
    navigation.navigate("CreateIdea", {
      draft: {
        title: parsedIdea.title.trim(),
        description: parsedIdea.description.trim(),
        categorySlug: parsedIdea.categorySlug,
      },
    })
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <View style={styles.headerCopy}>
            <Text variant="titleLarge" style={styles.headerTitle}>AI-помощник</Text>
            <Text variant="bodySmall" style={styles.headerSubtitle}>Опишите проблему своими словами</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.assistantRow}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="creation" size={24} color={colors.secondary} />
            </View>
            <View style={styles.assistantBubble}>
              <Text variant="bodyMedium" style={styles.bubbleText}>
                Расскажите, что произошло, где это находится и что вы предлагаете изменить. Я подготовлю название и описание идеи.
              </Text>
            </View>
          </View>

          {message ? (
            <View style={styles.userBubble}>
              <Text variant="bodyMedium" style={styles.userBubbleText}>{message}</Text>
            </View>
          ) : null}

          {parsedIdea ? (
            <View style={styles.resultCard}>
              <View style={styles.resultHeading}>
                <MaterialCommunityIcons name="check-decagram" size={24} color={colors.primary} />
                <View style={styles.resultHeadingCopy}>
                  <Text variant="titleMedium" style={styles.resultTitle}>Проверьте, правильно ли я понял</Text>
                  <Text variant="bodySmall" style={styles.resultSubtitle}>Поля можно отредактировать перед продолжением</Text>
                </View>
              </View>

              <TextInput
                mode="outlined"
                label="Название"
                value={parsedIdea.title}
                onChangeText={(title) => setParsedIdea((current) => current ? { ...current, title } : current)}
                maxLength={120}
                textContentType="none"
                autoComplete="off"
              />
              <TextInput
                mode="outlined"
                label="Описание"
                value={parsedIdea.description}
                onChangeText={(description) => setParsedIdea((current) => current ? { ...current, description } : current)}
                multiline
                numberOfLines={5}
                maxLength={1500}
                style={styles.descriptionInput}
                textContentType="none"
                autoComplete="off"
              />

              <View style={styles.categoryRow}>
                <MaterialCommunityIcons name="shape-outline" size={19} color={colors.primary} />
                <View style={styles.categoryCopy}>
                  <Text variant="labelSmall" style={styles.categoryLabel}>ПРЕДПОЛАГАЕМАЯ КАТЕГОРИЯ</Text>
                  <Text variant="bodyMedium" style={styles.categoryValue}>
                    {parsedIdea.categorySlug
                      ? categoryLabels[parsedIdea.categorySlug] ?? parsedIdea.categorySlug
                      : "Определится после отправки"}
                  </Text>
                </View>
              </View>

              {!parsedIdeaValid ? (
                <HelperText type="error" visible>
                  Название должно содержать 3 символа, описание — 15 символов
                </HelperText>
              ) : null}

              <View style={styles.resultActions}>
                <Button mode="outlined" icon="message-text-outline" onPress={handleClarify} style={styles.actionButton}>
                  Уточнить
                </Button>
                <Button mode="contained" icon="arrow-right" onPress={handleContinue} disabled={!parsedIdeaValid} style={styles.actionButton}>
                  Продолжить
                </Button>
              </View>
            </View>
          ) : (
            <View style={styles.composerCard}>
              <TextInput
                mode="outlined"
                label="Ваше сообщение"
                placeholder="Например: возле школы появилась глубокая яма…"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                maxLength={5000}
                error={showValidation && !messageValid}
                style={styles.messageInput}
                right={<TextInput.Affix text={`${message.length}/5000`} />}
                textContentType="none"
                autoComplete="off"
              />
              {showValidation && !messageValid ? (
                <HelperText type="error" visible>Добавьте немного деталей — минимум 10 символов</HelperText>
              ) : null}
              <Button
                mode="contained"
                icon="creation"
                loading={isParsing}
                disabled={isParsing}
                onPress={handleParse}
                contentStyle={styles.parseButtonContent}
              >
                Подготовить идею
              </Button>
            </View>
          )}

          <View style={styles.privacyNote}>
            <MaterialCommunityIcons name="shield-check-outline" size={18} color={colors.inkMuted} />
            <Text variant="bodySmall" style={styles.privacyText}>
              Не указывайте ИИН, номера документов и другие персональные данные.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Snackbar visible={Boolean(snackbar)} onDismiss={() => setSnackbar("")} duration={3500}>
        {snackbar}
      </Snackbar>
    </SafeAreaView>
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
  content: { width: "100%", maxWidth: 680, alignSelf: "center", padding: 20, paddingBottom: 38, gap: 18 },
  assistantRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF6E4",
  },
  assistantBubble: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleText: { color: colors.ink, lineHeight: 22 },
  userBubble: {
    maxWidth: "86%",
    alignSelf: "flex-end",
    padding: 15,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    backgroundColor: colors.primary,
  },
  userBubbleText: { color: "#FFFFFF", lineHeight: 22 },
  composerCard: { padding: 18, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  messageInput: { minHeight: 160, backgroundColor: colors.surface },
  parseButtonContent: { minHeight: 52 },
  resultCard: { gap: 14, padding: 18, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  resultHeading: { flexDirection: "row", gap: 11, alignItems: "flex-start" },
  resultHeadingCopy: { flex: 1 },
  resultTitle: { color: colors.ink, fontWeight: "800" },
  resultSubtitle: { color: colors.inkMuted, marginTop: 2 },
  descriptionInput: { minHeight: 130 },
  categoryRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 13, borderRadius: 16, backgroundColor: colors.surfaceMuted },
  categoryCopy: { flex: 1 },
  categoryLabel: { color: colors.primary, fontWeight: "800", letterSpacing: 0.5 },
  categoryValue: { color: colors.ink, fontWeight: "700", marginTop: 2 },
  resultActions: { flexDirection: "row", gap: 10 },
  actionButton: { flex: 1 },
  privacyNote: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingHorizontal: 4 },
  privacyText: { flex: 1, color: colors.inkMuted, lineHeight: 18 },
})
