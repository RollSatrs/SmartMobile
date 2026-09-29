export type DigestInsight = {
  category: string
  district: string
  count: number
  previousCount: number
  changePercent: number
}

export type DigestResponse = {
  periodLabel: string
  headline: DigestInsight | null
  insights: DigestInsight[]
  categoryTotals: { category: string; count: number }[]
}

export type DistrictRankingEntry = {
  district: string
  ideaCount: number
  resolvedCount: number
  resolvedPercent: number
  score: number
}
