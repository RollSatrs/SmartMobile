import type { Coordinates } from "../ideas/types"

export type IdeaMapProps = {
  value: Coordinates | null
  onChange: (coordinates: Coordinates) => void
  onError: (message: string) => void
}
