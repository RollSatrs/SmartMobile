import { useState } from "react"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { StyleSheet, View } from "react-native"
import { Button, HelperText, Text, TextInput } from "react-native-paper"

import { useAuth } from "../auth/AuthContext"
import type { UserRole } from "../auth/types"
import { AuthScreenLayout } from "../components/AuthScreenLayout"
import { RolePicker } from "../components/RolePicker"
import type { RootStackParamList } from "../navigation/types"
import { colors } from "../theme"

type Props = NativeStackScreenProps<RootStackParamList, "SignUp">

export function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("resident")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const emailIsInvalid = email.length > 0 && !/^\S+@\S+\.\S+$/.test(email)
  const passwordIsInvalid = password.length > 0 && password.length < 6
  const canSubmit =
    name.trim().length >= 2 &&
    email.trim().length > 0 &&
    !emailIsInvalid &&
    password.length >= 6

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return

    setError("")
    setIsSubmitting(true)
    try {
      await signUp({ name: name.trim(), email: email.trim(), password, role })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Не удалось зарегистрироваться")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthScreenLayout
      eyebrow="НОВЫЙ АККАУНТ"
      title="Присоединяйтесь к изменениям"
      subtitle="Один профиль — чтобы отправлять идеи, получать ответы и видеть результат."
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Уже есть аккаунт?</Text>
          <Button compact mode="text" onPress={() => navigation.goBack()}>
            Войти
          </Button>
        </View>
      }
    >
      <TextInput
        mode="outlined"
        label="Имя и фамилия"
        value={name}
        onChangeText={setName}
        autoComplete="name"
        left={<TextInput.Icon icon="account-outline" />}
      />

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
        autoComplete="new-password"
        error={passwordIsInvalid}
        left={<TextInput.Icon icon="lock-outline" />}
        right={
          <TextInput.Icon
            icon={showPassword ? "eye-off-outline" : "eye-outline"}
            onPress={() => setShowPassword((current) => !current)}
          />
        }
      />
      {passwordIsInvalid ? (
        <HelperText type="error" visible>
          Минимум 6 символов
        </HelperText>
      ) : null}

      <RolePicker value={role} onChange={setRole} />

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
        Создать аккаунт
      </Button>
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create({
  buttonContent: { minHeight: 52 },
  footerRow: { flexDirection: "row", alignItems: "center" },
  footerText: { color: colors.inkMuted },
})
