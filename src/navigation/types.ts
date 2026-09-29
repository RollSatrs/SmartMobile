export type RootStackParamList = {
  SignIn: undefined
  SignUp: undefined
  ResidentHome: undefined
  GovHome: undefined
  CreateIdea: {
    draft?: { title: string; description: string; categorySlug: string | null }
  } | undefined
  AiIdeaChat: undefined
  IdeaSubmitted: { ideaId: string }
  IdeaDetail: { ideaId: string }
  ImpactFeedback: { ideaId: string }
  GovIdeaDetail: { ideaId: string }
  TrendDigest: undefined
  DistrictRanking: undefined
}
