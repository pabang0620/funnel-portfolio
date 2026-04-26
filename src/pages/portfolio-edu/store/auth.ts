import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
  is_admin: boolean
  team?: string | null
  part?: string | null
}

interface AuthStore {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  isAdmin: () => boolean
  viewAsStudent: boolean
  toggleViewAsStudent: () => void
}

// Mock: always authenticated as admin
const MOCK_USER: User = {
  id: 'user-001',
  email: 'admin@portfoliocrew.com',
  name: '한예림',
  is_admin: true,
  team: 'HR팀',
  part: 'HR',
}

const MOCK_TOKEN = 'mock-token'

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: MOCK_USER,
  token: MOCK_TOKEN,
  setAuth: (user, token) => {
    set({ user, token })
  },
  logout: () => {
    set({ user: MOCK_USER, token: MOCK_TOKEN })
  },
  isAdmin: () => get().user?.is_admin ?? false,
  viewAsStudent: false,
  toggleViewAsStudent: () => set(state => ({ viewAsStudent: !state.viewAsStudent })),
}))
