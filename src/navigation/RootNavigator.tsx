import { NavigationContainer, type Theme } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { useAuth } from "../auth/AuthContext"
import { GovHomeScreen } from "../screens/GovHomeScreen"
import { LoadingScreen } from "../screens/LoadingScreen"
import { LoginScreen } from "../screens/LoginScreen"
import { RegisterScreen } from "../screens/RegisterScreen"
import { ResidentHomeScreen } from "../screens/ResidentHomeScreen"
import { colors } from "../theme"
import type { RootStackParamList } from "./types"

const Stack = createNativeStackNavigator<RootStackParamList>()

const navigationTheme: Theme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.ink,
    border: colors.border,
    notification: colors.secondary,
  },
  fonts: {
    regular: { fontFamily: "System", fontWeight: "400" },
    medium: { fontFamily: "System", fontWeight: "500" },
    bold: { fontFamily: "System", fontWeight: "700" },
    heavy: { fontFamily: "System", fontWeight: "800" },
  },
}

export function RootNavigator() {
  const { user, isRestoring } = useAuth()

  if (isRestoring) {
    return <LoadingScreen />
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
        {!user ? (
          <>
            <Stack.Screen name="SignIn" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={RegisterScreen} />
          </>
        ) : user.role === "resident" ? (
          <Stack.Screen name="ResidentHome" component={ResidentHomeScreen} />
        ) : (
          <Stack.Screen name="GovHome" component={GovHomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
