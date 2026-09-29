import AsyncStorage from "@react-native-async-storage/async-storage"

import { isMockAuthEnabled } from "../auth/authService"
import type {
  Coordinates,
  CreateIdeaPayload,
  IdeaListResponse,
  IdeaRecord,
  IdeaStatus,
  IdeaStatusHistoryItem,
} from "./types"

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "")
const MOCK_IDEAS_KEY = "smart-city-mock-ideas"

type StoredMockIdea = IdeaRecord & { classificationReadyAt?: number }

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

const daysAgo = (days: number, hour = 10) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

const historyItem = (
  id: string,
  status: IdeaStatus,
  days: number,
  comment?: string,
  actorName?: string,
): IdeaStatusHistoryItem => ({
  id,
  status,
  createdAt: daysAgo(days),
  comment,
  actorName,
})

const seededIdeas: StoredMockIdea[] = [
  {
    id: "demo-road-lighting",
    title: "Освещение на улице Кабанбай батыра",
    description:
      "На участке между остановкой и жилыми домами не работают несколько фонарей. Вечером дорога плохо видна, предлагаю восстановить освещение.",
    photoUrl: "mock://lighting",
    lat: 50.4145,
    lng: 80.2334,
    addressDistrict: "Центральный район, Семей",
    status: "in_progress",
    category: "Освещение",
    classificationReason: "В обращении описана проблема с уличными фонарями.",
    createdAt: daysAgo(8),
    hasUnreadUpdate: true,
    statusHistory: [
      historyItem("light-1", "received", 8, "Обращение зарегистрировано"),
      historyItem(
        "light-2",
        "in_review",
        6,
        "Передано в отдел городской инфраструктуры",
        "Акимат города Семей",
      ),
      historyItem(
        "light-3",
        "in_progress",
        2,
        "Бригада проверит линию освещения до конца недели",
        "Отдел ЖКХ",
      ),
    ],
  },
  {
    id: "demo-playground",
    title: "Безопасная площадка во дворе",
    description:
      "Во дворе по улице Шакарима старое покрытие и повреждены качели. Просим обновить покрытие и установить безопасные элементы для детей.",
    photoUrl: "mock://playground",
    lat: 50.4052,
    lng: 80.216,
    addressDistrict: "район Жаңасемей",
    status: "needs_clarification",
    category: "Благоустройство",
    classificationReason: "Предложение касается благоустройства дворовой территории.",
    createdAt: daysAgo(4),
    hasUnreadUpdate: true,
    statusHistory: [
      historyItem("play-1", "received", 4, "Обращение зарегистрировано"),
      historyItem(
        "play-2",
        "needs_clarification",
        1,
        "Пожалуйста, уточните номер дома и приложите общий вид площадки.",
        "Отдел благоустройства",
      ),
    ],
  },
  {
    id: "demo-trees",
    title: "Высадить деревья возле школы",
    description:
      "Предлагаю добавить тенистые деревья вдоль пешеходной дорожки возле школы. Летом здесь очень жарко и почти нет тени.",
    photoUrl: "mock://trees",
    lat: 50.4248,
    lng: 80.251,
    addressDistrict: "район Алаш",
    status: "done",
    category: "Экология и озеленение",
    classificationReason: "Идея связана с озеленением городской территории.",
    createdAt: daysAgo(24),
    hasUnreadUpdate: false,
    statusHistory: [
      historyItem("tree-1", "received", 24, "Обращение зарегистрировано"),
      historyItem("tree-2", "in_review", 21, "Проверяем возможность высадки", "Отдел экологии"),
      historyItem("tree-3", "in_progress", 12, "Подготовлена схема посадки", "Отдел экологии"),
      historyItem("tree-4", "done", 3, "Высажено 12 молодых деревьев", "Отдел экологии"),
    ],
  },
]

const readMockIdeas = async (): Promise<StoredMockIdea[]> => {
  const stored = await AsyncStorage.getItem(MOCK_IDEAS_KEY)
  if (!stored) {
    await AsyncStorage.setItem(MOCK_IDEAS_KEY, JSON.stringify(seededIdeas))
    return seededIdeas
  }

  try {
    return JSON.parse(stored) as StoredMockIdea[]
  } catch {
    await AsyncStorage.setItem(MOCK_IDEAS_KEY, JSON.stringify(seededIdeas))
    return seededIdeas
  }
}

const saveMockIdeas = (ideas: StoredMockIdea[]) =>
  AsyncStorage.setItem(MOCK_IDEAS_KEY, JSON.stringify(ideas))

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

const withoutMockMetadata = ({ classificationReadyAt: _, ...idea }: StoredMockIdea): IdeaRecord =>
  idea

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
    const createdAt = new Date().toISOString()
    const idea: StoredMockIdea = {
      id,
      title: payload.title,
      description: payload.description,
      photoUrl: payload.photoUrl,
      lat: payload.lat,
      lng: payload.lng,
      addressDistrict: mockDistrict({ latitude: payload.lat, longitude: payload.lng }),
      status: "received",
      category: null,
      createdAt,
      hasUnreadUpdate: false,
      classificationReadyAt: Date.now() + 2200,
      statusHistory: [
        {
          id: `${id}-received`,
          status: "received",
          comment: "Обращение зарегистрировано",
          createdAt,
        },
      ],
    }
    const ideas = await readMockIdeas()
    await saveMockIdeas([idea, ...ideas])
    return withoutMockMetadata(idea)
  },

  async listMine(): Promise<IdeaListResponse> {
    if (!isMockAuthEnabled) {
      const response = await fetch(`${requireApiUrl()}/ideas?page=1`, {
        credentials: "include",
      })
      if (!response.ok) throw new Error(await readErrorMessage(response))
      return (await response.json()) as IdeaListResponse
    }

    await wait(450)
    const ideas = await readMockIdeas()
    return {
      items: ideas
        .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
        .map(withoutMockMetadata),
      total: ideas.length,
    }
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
    const ideas = await readMockIdeas()
    const index = ideas.findIndex((item) => item.id === id)
    if (index < 0) throw new Error("Идея не найдена")

    const idea = ideas[index]
    if (!idea.category && idea.classificationReadyAt && Date.now() >= idea.classificationReadyAt) {
      const classification = classifyIdea(idea.title, idea.description)
      idea.category = classification.category
      idea.classificationReason = classification.reason
      delete idea.classificationReadyAt
      ideas[index] = idea
      await saveMockIdeas(ideas)
    }

    return withoutMockMetadata(idea)
  },

  async markAsRead(id: string): Promise<void> {
    if (!isMockAuthEnabled) return

    const ideas = await readMockIdeas()
    const idea = ideas.find((item) => item.id === id)
    if (!idea || !idea.hasUnreadUpdate) return
    idea.hasUnreadUpdate = false
    await saveMockIdeas(ideas)
  },
}
