import { isMockAuthEnabled } from "../auth/authService"
import { sessionStorage } from "../auth/sessionStorage"
import type { GovOfficial } from "./types"

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "")

const mockOfficials: GovOfficial[] = [
  { id: "demo-gov-1", name: "Айдос Нуртаев", email: "a.nurtayev@akimat.kz" },
  { id: "demo-gov-2", name: "Мадина Сарсенова", email: "m.sarsenova@akimat.kz" },
  { id: "demo-gov-3", name: "Ерлан Оспанов", email: "e.ospanov@akimat.kz" },
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
      : payload.message ?? "Не удалось загрузить сотрудников"
  } catch {
    return "Не удалось загрузить сотрудников"
  }
}

type BackendUser = { id: number; name: string; email: string }

export const userService = {
  async listGovOfficials(): Promise<GovOfficial[]> {
    if (!isMockAuthEnabled) {
      const response = await fetch(`${requireApiUrl()}/users?role=gov_official`, {
        credentials: "include",
      })
      if (!response.ok) throw new Error(await readErrorMessage(response))

      return ((await response.json()) as BackendUser[]).map((official) => ({
        ...official,
        id: String(official.id),
      }))
    }

    await wait(350)
    const session = await sessionStorage.read()
    const currentUser = session?.user.role === "gov_official"
      ? [{ id: session.user.id, name: session.user.name, email: session.user.email }]
      : []
    const officials = [...currentUser, ...mockOfficials]

    return officials.filter(
      (official, index) => officials.findIndex((item) => item.id === official.id) === index,
    )
  },
}
