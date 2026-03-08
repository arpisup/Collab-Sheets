import { create } from "zustand"

export interface Cell {
  value: string
}

export interface PresenceUser {
  id: string
  name: string
  color: string
  activeCell?: string
}

interface SheetState {
  cells: Record<string, Cell>
  users: PresenceUser[]
  setCell: (id: string, value: string) => void
  setBulkCells: (cells: Record<string, Cell>) => void
  setUsers: (users: PresenceUser[]) => void
}

export const useSheetStore = create<SheetState>((set) => ({
  cells: {},
  users: [],

  setCell: (id, value) =>
    set((state) => ({
      cells: {
        ...state.cells,
        [id]: { value },
      },
    })),

  setBulkCells: (cells) => set({ cells }),

  setUsers: (users) => set({ users }),
}))
