import { create } from "zustand"

export interface UserIdentity {
  uid: string
  displayName: string
  color: string
  provider: "guest" | "google"
}

const COLORS = [
  "#1d6ce0", "#0891b2", "#0d9488", "#059669",
  "#d97706", "#dc2626", "#9333ea", "#c026d3",
  "#e11d48", "#4f46e5", "#2563eb", "#7c3aed",
]

function randomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10)
}

interface AuthState {
  user: UserIdentity | null
  setUser: (user: UserIdentity) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>((set) => {
  // Rehydrate from localStorage on init (client only)
  let saved: UserIdentity | null = null
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("sheet_user")
      if (raw) saved = JSON.parse(raw)
    } catch { /* ignore */ }
  }

  return {
    user: saved,

    setUser: (user) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("sheet_user", JSON.stringify(user))
      }
      set({ user })
    },

    clearUser: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("sheet_user")
      }
      set({ user: null })
    },
  }
})

export { randomColor, randomId }
