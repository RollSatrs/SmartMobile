export type UserRole = "resident" | "gov_official"

export type AuthUser = {
  id: string
  name: string
  email: string
  role: UserRole
}

export type AuthResponse = {
  user: AuthUser
  accessToken: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = LoginPayload & {
  name: string
  role: UserRole
}
