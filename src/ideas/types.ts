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
