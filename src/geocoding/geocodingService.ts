import { isMockAuthEnabled } from "../auth/authService"
import type { AddressSearchResult } from "./types"

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "")

const mockAddresses: AddressSearchResult[] = [
  { displayName: "проспект Абая, Семей", lat: 50.41402, lng: 80.24418 },
  { displayName: "улица Шакарима, Семей", lat: 50.40865, lng: 80.22971 },
  { displayName: "улица Кабанбай батыра, Семей", lat: 50.41691, lng: 80.23526 },
  { displayName: "улица Жамбыла, Семей", lat: 50.41087, lng: 80.21883 },
  { displayName: "улица Ауэзова, Семей", lat: 50.40541, lng: 80.24667 },
  { displayName: "улица Найманбаева, Семей", lat: 50.41931, lng: 80.22654 },
]

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

const requireApiUrl = () => {
  if (!API_BASE_URL) throw new Error("Не задан EXPO_PUBLIC_API_URL")
  return API_BASE_URL
}

const readErrorMessage = async (response: Response) => {
  try {
    const payload = (await response.json()) as { message?: string | string[] }
    return Array.isArray(payload.message)
      ? payload.message.join(". ")
      : payload.message ?? "Не удалось выполнить поиск адреса"
  } catch {
    return "Не удалось выполнить поиск адреса"
  }
}

type BackendAddressResult = {
  displayName: string
  lat: number | string
  lng: number | string
}

export const geocodingService = {
  async search(query: string): Promise<AddressSearchResult[]> {
    const normalizedQuery = query.trim()
    if (normalizedQuery.length < 2) return []

    if (!isMockAuthEnabled) {
      const response = await fetch(
        `${requireApiUrl()}/geocoding/search?q=${encodeURIComponent(normalizedQuery)}`,
        { credentials: "include" },
      )
      if (!response.ok) throw new Error(await readErrorMessage(response))

      const results = (await response.json()) as BackendAddressResult[]
      return results
        .map((result) => ({
          displayName: result.displayName,
          lat: Number(result.lat),
          lng: Number(result.lng),
        }))
        .filter((result) => Number.isFinite(result.lat) && Number.isFinite(result.lng))
    }

    await wait(280)
    const loweredQuery = normalizedQuery.toLowerCase()
    return mockAddresses.filter((address) => address.displayName.toLowerCase().includes(loweredQuery))
  },
}
