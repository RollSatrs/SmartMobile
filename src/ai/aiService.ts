import { isMockAuthEnabled } from "../auth/authService"
import type { ParsedIdea } from "./types"

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
      : payload.message ?? "AI не смог разобрать сообщение"
  } catch {
    return "AI не смог разобрать сообщение"
  }
}

const parseMockIdea = (message: string): ParsedIdea => {
  const normalized = message.trim().replace(/\s+/g, " ")
  const lowered = normalized.toLowerCase()
  const categorySlug = /ям|дорог|асфальт|тротуар|переход/.test(lowered)
    ? "roads"
    : /мусор|двор|площадк|лавоч|уборк/.test(lowered)
      ? "improvement"
      : /свет|фонар|освещ/.test(lowered)
        ? "lighting"
        : /дерев|парк|эколог|озелен/.test(lowered)
          ? "ecology"
          : null

  const firstSentence = normalized.split(/[.!?]/)[0]?.trim() ?? normalized
  const title = firstSentence.length > 72
    ? `${firstSentence.slice(0, 69).trim()}…`
    : firstSentence

  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    description: normalized,
    categorySlug,
  }
}

export const aiService = {
  async parseIdea(message: string): Promise<ParsedIdea> {
    if (!isMockAuthEnabled) {
      const response = await fetch(`${requireApiUrl()}/ai/parse-idea`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message }),
      })
      if (!response.ok) throw new Error(await readErrorMessage(response))
      return (await response.json()) as ParsedIdea
    }

    await wait(850)
    return parseMockIdea(message)
  },
}
