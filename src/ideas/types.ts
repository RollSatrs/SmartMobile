export type Coordinates = {
  latitude: number
  longitude: number
}

export type IdeaStatus =
  | "received"
  | "in_review"
  | "in_progress"
  | "done"
  | "rejected"
  | "needs_clarification"

export type IdeaStatusHistoryItem = {
  id: string
  status: IdeaStatus
  comment?: string
  createdAt: string
  actorName?: string
}

export type IdeaRecord = {
  id: string
  title: string
  description: string
  photoUrl: string
  lat: number
  lng: number
  addressDistrict: string
  status: IdeaStatus
  category: string | null
  classificationReason?: string
  createdAt: string
  statusHistory: IdeaStatusHistoryItem[]
  hasUnreadUpdate: boolean
  authorId?: string
  authorName?: string
  assigneeId?: string | null
  assigneeName?: string | null
  rating?: number | null
  ratingComment?: string | null
  afterPhotoUrl?: string | null
  photoFlag?: "consistent" | "inconsistent" | "uncertain" | null
  photoFlagReason?: string | null
}

export type IdeaFeedbackPayload = {
  rating: number
  comment?: string
  afterPhotoUrl?: string
}

export type CreateIdeaPayload = {
  title: string
  description: string
  photoUrl: string
  lat: number
  lng: number
}

export type IdeaListResponse = {
  items: IdeaRecord[]
  total: number
}

export type GovIdeaFilters = {
  status?: IdeaStatus
  category?: string
  district?: string
  search?: string
}

export const IDEA_CATEGORIES = [
  "Дороги",
  "ЖКХ",
  "Транспорт",
  "Безопасность",
  "Экология",
  "Благоустройство",
  "Здравоохранение",
  "Образование",
  "Другое",
] as const
