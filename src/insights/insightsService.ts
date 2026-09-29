import { isMockAuthEnabled } from "../auth/authService"
import type { DigestResponse, DistrictRankingEntry } from "./types"

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "")

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
      : payload.message ?? "Не удалось выполнить запрос"
  } catch {
    return "Не удалось выполнить запрос"
  }
}

const mockDigest: DigestResponse = {
  periodLabel: "22–28 сентября",
  headline: {
    category: "Освещение",
    district: "район Жаяу Мусы",
    count: 17,
    previousCount: 12,
    changePercent: 40,
  },
  insights: [
    {
      category: "Освещение",
      district: "район Жаяу Мусы",
      count: 17,
      previousCount: 12,
      changePercent: 40,
    },
    {
      category: "Дороги и транспорт",
      district: "Центральный район, Семей",
      count: 11,
      previousCount: 13,
      changePercent: -15,
    },
    {
      category: "Благоустройство",
      district: "район Алаш",
      count: 9,
      previousCount: 4,
      changePercent: 125,
    },
  ],
  categoryTotals: [
    { category: "Освещение", count: 17 },
    { category: "Дороги и транспорт", count: 11 },
    { category: "Благоустройство", count: 9 },
    { category: "Экология и озеленение", count: 5 },
    { category: "Другое", count: 2 },
  ],
}

const mockRanking: DistrictRankingEntry[] = [
  { district: "район Жаяу Мусы", ideaCount: 24, resolvedCount: 16, resolvedPercent: 67, score: 92 },
  { district: "Центральный район, Семей", ideaCount: 20, resolvedCount: 12, resolvedPercent: 60, score: 81 },
  { district: "район Алаш", ideaCount: 15, resolvedCount: 8, resolvedPercent: 53, score: 74 },
  { district: "район Жаңасемей", ideaCount: 9, resolvedCount: 3, resolvedPercent: 33, score: 46 },
]

export const insightsService = {
  async getDigest(): Promise<DigestResponse> {
    if (!isMockAuthEnabled) {
      const response = await fetch(`${requireApiUrl()}/ideas/digest`, { credentials: "include" })
      if (!response.ok) throw new Error(await readErrorMessage(response))
      return (await response.json()) as DigestResponse
    }

    await wait(400)
    return mockDigest
  },

  async getDistrictRanking(): Promise<DistrictRankingEntry[]> {
    if (!isMockAuthEnabled) {
      const response = await fetch(`${requireApiUrl()}/districts/ranking`, { credentials: "include" })
      if (!response.ok) throw new Error(await readErrorMessage(response))
      return (await response.json()) as DistrictRankingEntry[]
    }

    await wait(400)
    return mockRanking
  },
}
