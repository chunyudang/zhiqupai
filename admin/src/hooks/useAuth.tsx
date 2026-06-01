import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { login as loginApi, getProfile } from '@/api/auth'
import type { Admin } from '@/types'

interface AuthContextType {
  token: string | null
  admin: Admin | null
  isAuthenticated: boolean
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  admin: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  // 初始化：从 localStorage 恢复 token
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token')
    if (savedToken) {
      setToken(savedToken)
      getProfile()
        .then((profile) => {
          setAdmin(profile)
        })
        .catch(() => {
          localStorage.removeItem('admin_token')
          setToken(null)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const loginHandler = useCallback(async (username: string, password: string) => {
    const result = await loginApi(username, password)
    localStorage.setItem('admin_token', result.token)
    setToken(result.token)
    setAdmin(result.admin)
  }, [])

  const logoutHandler = useCallback(() => {
    localStorage.removeItem('admin_token')
    setToken(null)
    setAdmin(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        token,
        admin,
        isAuthenticated: !!token,
        loading,
        login: loginHandler,
        logout: logoutHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
