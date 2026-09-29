import { MaterialCommunityIcons } from "@expo/vector-icons"
import { ScrollView, StyleSheet, View } from "react-native"
import { Button, Card, Chip, Text } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

import { useAuth } from "../auth/AuthContext"
import { colors } from "../theme"

type Props = {
  kind: "resident" | "gov_official"
}

export function RoleHome({ kind }: Props) {
  const { user, signOut } = useAuth()
  const isResident = kind === "resident"

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text variant="labelLarge" style={styles.eyebrow}>
              SMART CITY · АБАЙ
            </Text>
            <Text variant="headlineMedium" style={styles.greeting}>
              Здравствуйте,
            </Text>
            <Text variant="headlineMedium" style={styles.name}>
              {user?.name}
            </Text>
          </View>
          <View style={styles.avatar}>
            <MaterialCommunityIcons
              name={isResident ? "account" : "office-building"}
              size={30}
              color="#FFFFFF"
            />
          </View>
        </View>

        <Chip icon={isResident ? "account-heart-outline" : "shield-account-outline"}>
          {isResident ? "Кабинет жителя" : "Кабинет государственного органа"}
        </Chip>

        <Card mode="contained" style={styles.heroCard}>
          <Card.Content style={styles.heroContent}>
            <View style={styles.heroIcon}>
              <MaterialCommunityIcons
                name={isResident ? "lightbulb-on-outline" : "clipboard-check-outline"}
                size={30}
                color={colors.primary}
              />
            </View>
            <Text variant="titleLarge" style={styles.cardTitle}>
              {isResident ? "Ваши идеи меняют регион" : "Обращения жителей в одном месте"}
            </Text>
            <Text variant="bodyMedium" style={styles.cardCopy}>
              {isResident
                ? "Форма подачи идеи и история обращений появятся в следующих задачах."
                : "Рабочая очередь госоргана будет подключена отдельным модулем команды."}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.sessionCard}>
          <Text variant="labelLarge" style={styles.sessionTitle}>
            Активная сессия
          </Text>
          <Text variant="bodyMedium" style={styles.sessionText}>
            {user?.email}
          </Text>
          <Text variant="bodySmall" style={styles.sessionHint}>
            Токен сохранён в защищённом хранилище устройства.
          </Text>
        </View>

        <Button mode="outlined" icon="logout" onPress={signOut} style={styles.logoutButton}>
          Выйти из аккаунта
        </Button>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, gap: 22, width: "100%", maxWidth: 620, alignSelf: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eyebrow: { color: colors.primary, fontWeight: "800", letterSpacing: 1.1 },
  greeting: { color: colors.ink, marginTop: 10 },
  name: { color: colors.ink, fontWeight: "800" },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  heroCard: { backgroundColor: "#DDEFE7", borderRadius: 24 },
  heroContent: { gap: 13, paddingVertical: 8 },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  cardTitle: { color: colors.ink, fontWeight: "800" },
  cardCopy: { color: colors.inkMuted, lineHeight: 22 },
  sessionCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sessionTitle: { color: colors.ink, fontWeight: "700" },
  sessionText: { color: colors.ink, marginTop: 8 },
  sessionHint: { color: colors.inkMuted, marginTop: 4 },
  logoutButton: { borderColor: colors.border },
})
