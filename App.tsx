import { StatusBar } from "expo-status-bar"
import { PaperProvider } from "react-native-paper"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { AuthProvider } from "./src/auth/AuthContext"
import { RootNavigator } from "./src/navigation/RootNavigator"
import { appTheme } from "./src/theme"

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={appTheme}>
        <AuthProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  )
}
