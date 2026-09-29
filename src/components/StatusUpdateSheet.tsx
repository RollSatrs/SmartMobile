import { useEffect, useState } from "react"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native"
import { Button, HelperText, Text, TextInput } from "react-native-paper"

import { ideaStatusConfig } from "../ideas/status"
import type { IdeaStatus } from "../ideas/types"
import { colors } from "../theme"

const STATUS_ORDER: IdeaStatus[] = [
  "received",
  "in_review",
  "in_progress",
  "done",
  "rejected",
  "needs_clarification",
]

const COMMENT_REQUIRED_FOR: IdeaStatus[] = ["rejected", "needs_clarification"]

type Props = {
  visible: boolean
  currentStatus: IdeaStatus
  isSubmitting: boolean
  onDismiss: () => void
  onSubmit: (status: IdeaStatus, comment?: string) => void
}

export function StatusUpdateSheet({ visible, currentStatus, isSubmitting, onDismiss, onSubmit }: Props) {
  const [selected, setSelected] = useState<IdeaStatus>(currentStatus)
  const [comment, setComment] = useState("")

  useEffect(() => {
    if (visible) {
      setSelected(currentStatus)
      setComment("")
    }
  }, [visible, currentStatus])

  const commentRequired = COMMENT_REQUIRED_FOR.includes(selected)
  const commentValid = !commentRequired || comment.trim().length >= 5
  const canSubmit = commentValid && !isSubmitting

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text variant="titleLarge" style={styles.title}>
            Изменить статус
          </Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            Житель увидит изменение и комментарий в своём кабинете
          </Text>

          <ScrollView style={styles.options} showsVerticalScrollIndicator={false}>
            {STATUS_ORDER.map((status) => {
              const config = ideaStatusConfig[status]
              const isSelected = status === selected
              return (
                <Pressable
                  key={status}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  onPress={() => setSelected(status)}
                  style={[styles.option, isSelected && styles.optionSelected]}
                >
                  <View style={[styles.optionIcon, { backgroundColor: config.background }]}>
                    <MaterialCommunityIcons name={config.icon} size={18} color={config.color} />
                  </View>
                  <Text variant="bodyMedium" style={styles.optionLabel}>
                    {config.label}
                  </Text>
                  {isSelected ? (
                    <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />
                  ) : null}
                </Pressable>
              )
            })}
          </ScrollView>

          <TextInput
            mode="outlined"
            label={commentRequired ? "Комментарий (обязательно)" : "Комментарий (необязательно)"}
            placeholder="Например: заявка передана в отдел ЖКХ"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            style={styles.input}
          />
          {commentRequired && !commentValid ? (
            <HelperText type="error" visible>
              Для этого статуса нужен комментарий не короче 5 символов
            </HelperText>
          ) : null}

          <View style={styles.actions}>
            <Button mode="outlined" onPress={onDismiss} style={styles.actionButton} disabled={isSubmitting}>
              Отмена
            </Button>
            <Button
              mode="contained"
              onPress={() => onSubmit(selected, comment.trim() || undefined)}
              style={styles.actionButton}
              loading={isSubmitting}
              disabled={!canSubmit}
            >
              Сохранить
            </Button>
          </View>
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
    paddingBottom: 34,
    maxHeight: "86%",
    gap: 4,
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
  subtitle: { color: colors.inkMuted, marginTop: 2, marginBottom: 14 },
  options: { maxHeight: 260, marginBottom: 12 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 4,
  },
  optionSelected: { backgroundColor: colors.surfaceMuted },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: { flex: 1, color: colors.ink, fontWeight: "600" },
  input: { backgroundColor: colors.surface },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  actionButton: { flex: 1 },
})
