import * as SecureStore from "expo-secure-store"
import { Platform } from "react-native"

import type { AuthResponse, AuthUser } from "./types"

const TOKEN_KEY = "smart-city-access-token"
const USER_KEY = "smart-city-auth-user"

const getItem = (key: string) => {
  if (Platform.OS === "web") {
    return Promise.resolve(globalThis.localStorage?.getItem(key) ?? null)
  }
  return SecureStore.getItemAsync(key)
}

const setItem = (key: string, value: string) => {
  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(key, value)
    return Promise.resolve()
  }
  return SecureStore.setItemAsync(key, value)
}

const deleteItem = (key: string) => {
  if (Platform.OS === "web") {
    globalThis.localStorage?.removeItem(key)
    return Promise.resolve()
  }
  return SecureStore.deleteItemAsync(key)
}

export const sessionStorage = {
  async read(): Promise<AuthResponse | null> {
    const [accessToken, userJson] = await Promise.all([
      getItem(TOKEN_KEY),
      getItem(USER_KEY),
    ])

    if (!accessToken || !userJson) {
      return null
    }

    try {
      const user = JSON.parse(userJson) as AuthUser
      if (user.role !== "resident" && user.role !== "gov_official") {
        throw new Error("Unknown user role")
      }
      return { accessToken, user }
    } catch {
      await this.clear()
      return null
    }
  },

  async save(session: AuthResponse) {
    await Promise.all([
      setItem(TOKEN_KEY, session.accessToken),
      setItem(USER_KEY, JSON.stringify(session.user)),
    ])
  },

  async clear() {
    await Promise.all([
      deleteItem(TOKEN_KEY),
      deleteItem(USER_KEY),
    ])
  },
}
