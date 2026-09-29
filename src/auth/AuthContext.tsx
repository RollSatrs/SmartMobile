import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { authService } from "./authService"
import { sessionStorage } from "./sessionStorage"
import type { AuthUser, LoginPayload, RegisterPayload } from "./types"

type AuthContextValue = {
  user: AuthUser | null
  isRestoring: boolean
  signIn: (payload: LoginPayload) => Promise<void>
  signUp: (payload: RegisterPayload) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isRestoring, setIsRestoring] = useState(true)

  useEffect(() => {
    let isMounted = true

    sessionStorage
      .read()
      .then((session) => {
        if (isMounted) setUser(session?.user ?? null)
      })
      .catch(() => {
        if (isMounted) setUser(null)
      })
      .finally(() => {
        if (isMounted) setIsRestoring(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const signIn = useCallback(async (payload: LoginPayload) => {
    const session = await authService.login(payload)
    await sessionStorage.save(session)
    setUser(session.user)
  }, [])

  const signUp = useCallback(async (payload: RegisterPayload) => {
    const session = await authService.register(payload)
    await sessionStorage.save(session)
    setUser(session.user)
  }, [])

  const signOut = useCallback(async () => {
    await sessionStorage.clear()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isRestoring, signIn, signUp, signOut }),
    [isRestoring, signIn, signOut, signUp, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }
  return context
}
