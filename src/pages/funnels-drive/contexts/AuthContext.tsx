import { createContext, useContext } from 'react'
import type { User } from '../types'

const MOCK_USER: User = {
  id: 'u001',
  username: 'admin',
  name: '홍길동',
  role: 1,
  created_at: '2024-01-01T09:00:00Z',
  updated_at: '2024-01-01T09:00:00Z',
}

interface AuthContextValue {
  user: User | null
  token: string | null
  isAdmin: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({
  user: MOCK_USER,
  token: 'mock-token',
  isAdmin: true,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        user: MOCK_USER,
        token: 'mock-token',
        isAdmin: true,
        login: () => {},
        logout: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
