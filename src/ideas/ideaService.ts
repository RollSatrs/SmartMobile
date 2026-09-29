import AsyncStorage from "@react-native-async-storage/async-storage"

import { isMockAuthEnabled } from "../auth/authService"
import { sessionStorage } from "../auth/sessionStorage"
import type {
  Coordinates,
  CreateIdeaPayload,
  GovIdeaFilters,
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
    authorId: "demo-author-1",
    authorName: "Алия Сарсенова",
    assigneeId: "demo-gov-1",
    assigneeName: "Отдел ЖКХ",
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
    authorId: "demo-author-2",
    authorName: "Данияр Ахметов",
    assigneeId: "demo-gov-2",
    assigneeName: "Отдел благоустройства",
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
    authorId: "demo-author-3",
    authorName: "Жанна Оспанова",
    assigneeId: "demo-gov-3",
    assigneeName: "Отдел экологии",
    statusHistory: [
      historyItem("tree-1", "received", 24, "Обращение зарегистрировано"),
      historyItem("tree-2", "in_review", 21, "Проверяем возможность высадки", "Отдел экологии"),
      historyItem("tree-3", "in_progress", 12, "Подготовлена схема посадки", "Отдел экологии"),
      historyItem("tree-4", "done", 3, "Высажено 12 молодых деревьев", "Отдел экологии"),
    ],
  },
  {
    id: "demo-crosswalk",
    title: "Нет пешеходного перехода у поликлиники №3",
    description:
      "Жители переходят проезжую часть напротив поликлиники вне разметки, машины едут быстро. Нужен наземный переход или знак с ограничением скорости.",
    photoUrl: "mock://crosswalk",
    lat: 50.3998,
    lng: 80.2412,
    addressDistrict: "район Жаяу Мусы",
    status: "received",
    category: null,
    createdAt: daysAgo(1),
    hasUnreadUpdate: false,
    authorId: "demo-author-4",
    authorName: "Бекзат Нурланов",
    assigneeId: null,
    assigneeName: null,
    statusHistory: [historyItem("crosswalk-1", "received", 1, "Обращение зарегистрировано")],
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

const matchesGovFilters = (idea: IdeaRecord, filters: GovIdeaFilters) => {
  if (filters.status && idea.status !== filters.status) return false
  if (filters.category && idea.category !== filters.category) return false
  if (
    filters.district &&
    !idea.addressDistrict.toLowerCase().includes(filters.district.toLowerCase())
  ) {
    return false
  }
  if (filters.search) {
    const query = filters.search.toLowerCase()
    const haystack = `${idea.title} ${idea.description}`.toLowerCase()
    if (!haystack.includes(query)) return false
  }
  return true
}

// Реальный контракт backend (см. RollSatrs/SmartBackend#3, #4): id — number, category — объект
// {id,name,slug} | null. Адаптеры ниже приводят его к тому же IdeaRecord (string id, category — имя),
// который уже использует остальной мобильный код в мок-режиме. create/listMine/getById пока
// кастуют ответ backend напрямую без адаптера (см. Asanali, SmartMobile#2/#3) — это разойдётся с
// реальным контрактом при первом реальном подключении (EXPO_PUBLIC_USE_MOCK_AUTH=false), но так как
// приложение сейчас всегда работает в мок-режиме, разногласие никак не проявляется. Полное включение
// реального API — отдельная задача, здесь адаптер сделан только для новых методов кабинета госоргана.
type BackendCategory = { id: number; name: string; slug: string }
type BackendStatusHistoryItem = {
  id: number
  status: IdeaStatus
  comment: string | null
  changedBy: number
  createdAt: string
}
type BackendIdea = {
  id: number
  authorId: number
  title: string
  description: string
  category: BackendCategory | null
  status: IdeaStatus
  lat: number
  lng: number
  addressDistrict: string
  photoUrl: string
  assigneeId: number | null
  createdAt: string
  updatedAt: string
  statusHistory?: BackendStatusHistoryItem[]
}
type BackendIdeasPage = { items: BackendIdea[]; total: number; page: number; limit: number }

const mapBackendIdea = (raw: BackendIdea): IdeaRecord => ({
  id: String(raw.id),
  title: raw.title,
  description: raw.description,
  photoUrl: raw.photoUrl,
  lat: raw.lat,
  lng: raw.lng,
  addressDistrict: raw.addressDistrict,
  status: raw.status,
  category: raw.category?.name ?? null,
  createdAt: raw.createdAt,
  hasUnreadUpdate: false,
  authorId: String(raw.authorId),
  assigneeId: raw.assigneeId != null ? String(raw.assigneeId) : null,
  statusHistory: (raw.statusHistory ?? []).map((item) => ({
    id: String(item.id),
    status: item.status,
    comment: item.comment ?? undefined,
    createdAt: item.createdAt,
  })),
})

const GOV_PAGE_SIZE = 20

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
    const session = await sessionStorage.read()
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
      authorId: session?.user.id,
      authorName: session?.user.name,
      assigneeId: null,
      assigneeName: null,
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

  /** Кабинет госоргана: все идеи с фильтрами и пагинацией (см. SmartBackend#3, GET /ideas). */
  async listAll(filters: GovIdeaFilters, page = 1): Promise<IdeaListResponse> {
    if (!isMockAuthEnabled) {
      const params = new URLSearchParams({ page: String(page), limit: String(GOV_PAGE_SIZE) })
      if (filters.status) params.set("status", filters.status)
      if (filters.search) params.set("search", filters.search)
      const response = await fetch(`${requireApiUrl()}/ideas?${params.toString()}`, {
        credentials: "include",
      })
      if (!response.ok) throw new Error(await readErrorMessage(response))
      const data = (await response.json()) as BackendIdeasPage
      // category/district у backend не фильтруются по имени — добираем клиентской фильтрацией.
      const items = data.items
        .map(mapBackendIdea)
        .filter((idea) => matchesGovFilters(idea, { category: filters.category, district: filters.district }))
      return { items, total: items.length === data.items.length ? data.total : items.length }
    }

    await wait(400)
    const ideas = await readMockIdeas()
    const filtered = ideas
      .map(withoutMockMetadata)
      .filter((idea) => matchesGovFilters(idea, filters))
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    const start = (page - 1) * GOV_PAGE_SIZE
    return { items: filtered.slice(start, start + GOV_PAGE_SIZE), total: filtered.length }
  },

  /** Смена статуса госорганом. Комментарий обязателен для rejected/needs_clarification (см. SmartBackend#4). */
  async updateStatus(id: string, status: IdeaStatus, comment?: string): Promise<IdeaRecord> {
    if (!isMockAuthEnabled) {
      const response = await fetch(`${requireApiUrl()}/ideas/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, comment }),
      })
      if (!response.ok) throw new Error(await readErrorMessage(response))
      return mapBackendIdea((await response.json()) as BackendIdea)
    }

    await wait(500)
    const ideas = await readMockIdeas()
    const index = ideas.findIndex((item) => item.id === id)
    if (index < 0) throw new Error("Идея не найдена")

    const idea = ideas[index]
    const session = await sessionStorage.read()
    const historyEntry: IdeaStatusHistoryItem = {
      id: `${id}-${Date.now()}`,
      status,
      comment,
      createdAt: new Date().toISOString(),
      actorName: session?.user.name ?? "Госорган",
    }
    idea.status = status
    idea.statusHistory = [...idea.statusHistory, historyEntry]
    idea.hasUnreadUpdate = true
    ideas[index] = idea
    await saveMockIdeas(ideas)
    return withoutMockMetadata(idea)
  },

  /** Назначение идеи текущему сотруднику госоргана («взять в работу», см. SmartBackend#4). */
  async assignToMe(id: string, assignee: { id: string; name: string }): Promise<IdeaRecord> {
    if (!isMockAuthEnabled) {
      const numericId = Number(assignee.id)
      const response = await fetch(`${requireApiUrl()}/ideas/${id}/assignee`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ assigneeId: numericId }),
      })
      if (!response.ok) throw new Error(await readErrorMessage(response))
      return mapBackendIdea((await response.json()) as BackendIdea)
    }

    await wait(400)
    const ideas = await readMockIdeas()
    const index = ideas.findIndex((item) => item.id === id)
    if (index < 0) throw new Error("Идея не найдена")

    const idea = ideas[index]
    idea.assigneeId = assignee.id
    idea.assigneeName = assignee.name
    ideas[index] = idea
    await saveMockIdeas(ideas)
    return withoutMockMetadata(idea)
  },
}
