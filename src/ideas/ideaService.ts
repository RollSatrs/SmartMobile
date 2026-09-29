import { isMockAuthEnabled } from "../auth/authService"
import type { Coordinates, CreateIdeaPayload, IdeaRecord } from "./types"

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "")

type MockIdea = IdeaRecord & { classificationReadyAt: number }

const mockIdeas = new Map<string, MockIdea>()

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

const requireApiUrl = () => {
  if (!API_BASE_URL) {
    throw new Error("Не задан EXPO_PUBLIC_API_URL")
  }
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

const classifyIdea = (title: string, description: string) => {
  const text = `${title} ${description}`.toLowerCase()

  if (/дорог|ям|тротуар|автобус|останов/.test(text)) {
    return {
      category: "Дороги и транспорт",
      reason: "В тексте обнаружена тема дорожной инфраструктуры и транспорта.",
    }
  }
  if (/мусор|двор|уборк|площадк|лавоч/.test(text)) {
    return {
      category: "Благоустройство",
      reason: "Идея относится к содержанию и улучшению городской среды.",
    }
  }
  if (/свет|фонар|освещ/.test(text)) {
    return {
      category: "Освещение",
      reason: "В описании говорится об уличном освещении.",
    }
  }
  if (/дерев|парк|эколог|воздух|озелен/.test(text)) {
    return {
      category: "Экология и озеленение",
      reason: "Идея связана с экологией или зелёными зонами.",
    }
  }

  return {
    category: "Другое",
    reason: "Тема не совпала с основными демонстрационными категориями.",
  }
}

const mockDistrict = ({ latitude, longitude }: Coordinates) => {
  if (longitude >= 80.25) return "район Алаш"
  if (latitude <= 50.4) return "район Жаңасемей"
  return "Центральный район, Семей"
}

export const ideaService = {
  async resolveDistrict(coordinates: Coordinates): Promise<string> {
    if (!isMockAuthEnabled) {
      throw new Error("Эндпоинт геокодирования ещё не опубликован в Swagger")
    }

    await wait(450)
    return mockDistrict(coordinates)
  },

  async create(payload: CreateIdeaPayload): Promise<IdeaRecord> {
    if (!isMockAuthEnabled) {
      const response = await fetch(`${requireApiUrl()}/ideas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error(await readErrorMessage(response))
      return (await response.json()) as IdeaRecord
    }

    await wait(850)
    const id = `idea-${Date.now()}`
    const idea: MockIdea = {
      id,
      title: payload.title,
      description: payload.description,
      photoUrl: payload.photoUrl,
      lat: payload.lat,
      lng: payload.lng,
      addressDistrict: mockDistrict({ latitude: payload.lat, longitude: payload.lng }),
      status: "received",
      category: null,
      createdAt: new Date().toISOString(),
      classificationReadyAt: Date.now() + 2200,
    }
    mockIdeas.set(id, idea)
    return idea
  },

  async getById(id: string): Promise<IdeaRecord> {
    if (!isMockAuthEnabled) {
      const response = await fetch(`${requireApiUrl()}/ideas/${id}`, {
        credentials: "include",
      })
      if (!response.ok) throw new Error(await readErrorMessage(response))
      return (await response.json()) as IdeaRecord
    }

    await wait(300)
    const idea = mockIdeas.get(id)
    if (!idea) throw new Error("Идея не найдена")

    if (!idea.category && Date.now() >= idea.classificationReadyAt) {
      const classification = classifyIdea(idea.title, idea.description)
      idea.category = classification.category
      idea.classificationReason = classification.reason
      mockIdeas.set(id, idea)
    }

    const { classificationReadyAt: _, ...record } = idea
    return record
  },
}
