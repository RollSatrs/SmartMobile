import { useState } from "react"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { StyleSheet, View } from "react-native"
import { Button, HelperText, Text, TextInput } from "react-native-paper"

import { useAuth } from "../auth/AuthContext"
import { isMockAuthEnabled } from "../auth/authService"
import { AuthScreenLayout } from "../components/AuthScreenLayout"
import type { RootStackParamList } from "../navigation/types"
import { colors } from "../theme"

type Props = NativeStackScreenProps<RootStackParamList, "SignIn">

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const emailIsInvalid = email.length > 0 && !/^\S+@\S+\.\S+$/.test(email)
  const canSubmit = !emailIsInvalid && email.trim().length > 0 && password.length >= 6

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return

    setError("")
    setIsSubmitting(true)
    try {
      await signIn({ email: email.trim(), password })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Не удалось войти")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthScreenLayout
      eyebrow="ДОБРО ПОЖАЛОВАТЬ"
      title="Город начинается с вас"
      subtitle="Войдите, чтобы предлагать изменения и видеть, как идеи становятся частью города."
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Впервые здесь?</Text>
          <Button compact mode="text" onPress={() => navigation.navigate("SignUp")}>
            Создать аккаунт
          </Button>
        </View>
      }
    >
      <TextInput
        mode="outlined"
        label="Электронная почта"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        error={emailIsInvalid}
        left={<TextInput.Icon icon="email-outline" />}
      />
      {emailIsInvalid ? (
        <HelperText type="error" visible>
          Проверьте формат электронной почты
        </HelperText>
      ) : null}

      <TextInput
        mode="outlined"
        label="Пароль"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        autoComplete="current-password"
        left={<TextInput.Icon icon="lock-outline" />}
        right={
          <TextInput.Icon
            icon={showPassword ? "eye-off-outline" : "eye-outline"}
            onPress={() => setShowPassword((current) => !current)}
          />
        }
        onSubmitEditing={handleSubmit}
      />

      {error ? (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      ) : null}

      <Button
        mode="contained"
        contentStyle={styles.buttonContent}
        disabled={!canSubmit}
        loading={isSubmitting}
        onPress={handleSubmit}
      >
        Войти
      </Button>

      {isMockAuthEnabled ? (
        <View style={styles.demoHint}>
          <Text variant="labelMedium" style={styles.demoTitle}>
            Демо-режим
          </Text>
          <Text variant="bodySmall" style={styles.demoText}>
            Почта с началом gov — кабинет госоргана, любая другая — кабинет жителя.
          </Text>
        </View>
      ) : null}
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create({
  buttonContent: { minHeight: 52 },
  footerRow: { flexDirection: "row", alignItems: "center" },
  footerText: { color: colors.inkMuted },
  demoHint: {
    padding: 13,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
  },
  demoTitle: { color: colors.primary, fontWeight: "800" },
  demoText: { color: colors.inkMuted, lineHeight: 18, marginTop: 3 },
})
