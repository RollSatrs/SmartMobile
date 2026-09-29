import type { ComponentProps } from "react"
import type { MaterialCommunityIcons } from "@expo/vector-icons"

import type { IdeaStatus } from "./types"

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"]

export const ideaStatusConfig: Record<
  IdeaStatus,
  { label: string; color: string; background: string; icon: IconName }
> = {
  received: {
    label: "Получена",
    color: "#35615A",
    background: "#E2EFEB",
    icon: "inbox-arrow-down-outline",
  },
  in_review: {
    label: "На рассмотрении",
    color: "#705518",
    background: "#FFF0C7",
    icon: "file-search-outline",
  },
  in_progress: {
    label: "В работе",
    color: "#225C8A",
    background: "#E0EFFA",
    icon: "progress-wrench",
  },
  done: {
    label: "Завершена",
    color: "#2E6C45",
    background: "#DDF2E4",
    icon: "check-circle-outline",
  },
  rejected: {
    label: "Отклонена",
    color: "#8D3430",
    background: "#FBE4E2",
    icon: "close-circle-outline",
  },
  needs_clarification: {
    label: "Нужны уточнения",
    color: "#874F19",
    background: "#FCE8D5",
    icon: "message-question-outline",
  },
}
