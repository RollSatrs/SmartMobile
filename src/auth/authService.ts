import AsyncStorage from "@react-native-async-storage/async-storage"

import type { AuthResponse, LoginPayload, RegisterPayload, UserRole } from "./types"

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "")
const USE_MOCK_AUTH = process.env.EXPO_PUBLIC_USE_MOCK_AUTH !== "false"
const MOCK_USERS_KEY = "smart-city-mock-users"

type MockUserRecord = { name: string; role: UserRole }

const readMockUsers = async (): Promise<Record<string, MockUserRecord>> => {
  const stored = await AsyncStorage.getItem(MOCK_USERS_KEY)
  if (!stored) return {}
  try {
    return JSON.parse(stored) as Record<string, MockUserRecord>
  } catch {
    return {}
  }
}

const saveMockUser = async (email: string, record: MockUserRecord) => {
  const users = await readMockUsers()
  users[email.toLowerCase()] = record
  await AsyncStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users))
}

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

const createMockResponse = (
  email: string,
  name: string,
  role: UserRole,
): AuthResponse => ({
  user: {
    id: `mock-${role}-${email.toLowerCase()}`,
    name,
    email: email.toLowerCase(),
    role,
  },
  accessToken: `mock-token-${role}-${Date.now()}`,
})

const readErrorMessage = async (response: Response) => {
  try {
    const payload = (await response.json()) as { message?: string | string[] }
    if (Array.isArray(payload.message)) {
      return payload.message.join(". ")
    }
    return payload.message ?? "Не удалось выполнить запрос"
  } catch {
    return "Не удалось выполнить запрос"
  }
}

const post = async <TPayload>(path: string, payload: TPayload): Promise<AuthResponse> => {
  if (!API_BASE_URL) {
    throw new Error("Не задан EXPO_PUBLIC_API_URL")
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return (await response.json()) as AuthResponse
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    if (!USE_MOCK_AUTH) {
      return post("/auth/login", payload)
    }

    await wait(650)
    const existing = (await readMockUsers())[payload.email.toLowerCase()]
    // Если такого email ещё не регистрировали — определяем роль по префиксу "gov" (быстрый вход для теста без регистрации).
    const role: UserRole =
      existing?.role ?? (payload.email.toLowerCase().startsWith("gov") ? "gov_official" : "resident")
    const name = existing?.name ?? (role === "gov_official" ? "Представитель акимата" : "Житель области Абай")

    return createMockResponse(payload.email, name, role)
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    if (!USE_MOCK_AUTH) {
      return post("/auth/register", payload)
    }

    await wait(750)
    const name = payload.name.trim()
    await saveMockUser(payload.email, { name, role: payload.role })
    return createMockResponse(payload.email, name, payload.role)
  },
}

export const isMockAuthEnabled = USE_MOCK_AUTH
