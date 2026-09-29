import { MD3LightTheme } from "react-native-paper"

export const colors = {
  primary: "#176B5B",
  primaryDark: "#0F4D43",
  secondary: "#D89B32",
  background: "#F4F7F3",
  surface: "#FFFFFF",
  surfaceMuted: "#E8F0EC",
  ink: "#17332E",
  inkMuted: "#60736E",
  border: "#D7E1DD",
  danger: "#B3261E",
} as const

export const appTheme = {
  ...MD3LightTheme,
  roundness: 16,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: "#FFFFFF",
    primaryContainer: "#C8EBDD",
    onPrimaryContainer: colors.primaryDark,
    secondary: colors.secondary,
    onSecondary: "#FFFFFF",
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceMuted,
    outline: colors.border,
    error: colors.danger,
  },
}
