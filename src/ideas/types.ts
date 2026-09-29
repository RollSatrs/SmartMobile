export type Coordinates = {
  latitude: number
  longitude: number
}

export type IdeaStatus = "received"

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
}

export type CreateIdeaPayload = {
  title: string
  description: string
  photoUrl: string
  lat: number
  lng: number
}
