import type { PropsWithChildren, ReactNode } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native"
import { Text } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

import { colors } from "../theme"

type Props = PropsWithChildren<{
  eyebrow: string
  title: string
  subtitle: string
  footer?: ReactNode
}>

export function AuthScreenLayout({ eyebrow, title, subtitle, footer, children }: Props) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandLetter}>A</Text>
            </View>
            <View>
              <Text variant="titleMedium" style={styles.brandTitle}>
                Smart City
              </Text>
              <Text variant="labelSmall" style={styles.brandCaption}>
                ОБЛАСТЬ АБАЙ
              </Text>
            </View>
          </View>

          <View style={styles.heading}>
            <Text variant="labelLarge" style={styles.eyebrow}>
              {eyebrow}
            </Text>
            <Text variant="displaySmall" style={styles.title}>
              {title}
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              {subtitle}
            </Text>
          </View>

          <View style={styles.form}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.background },
  topGlow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#D8EEE5",
    top: -100,
    right: -90,
  },
  bottomGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#F8E9C9",
    bottom: -90,
    left: -80,
  },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  brandLetter: { color: "#FFFFFF", fontWeight: "900", fontSize: 22 },
  brandTitle: { color: colors.ink, fontWeight: "800", letterSpacing: -0.3 },
  brandCaption: { color: colors.inkMuted, letterSpacing: 1.7, fontWeight: "700" },
  heading: { marginTop: 48, marginBottom: 28 },
  eyebrow: { color: colors.primary, fontWeight: "800", letterSpacing: 1.2 },
  title: {
    color: colors.ink,
    fontWeight: "800",
    letterSpacing: -1.2,
    lineHeight: 46,
    marginTop: 10,
  },
  subtitle: { color: colors.inkMuted, lineHeight: 25, marginTop: 14, maxWidth: 420 },
  form: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(215,225,221,0.85)",
    gap: 14,
    shadowColor: "#29463F",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  footer: { marginTop: 20, alignItems: "center" },
})
