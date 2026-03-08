import { useState, useCallback, useEffect } from "react"
import { useSheetStore } from "../../store/spreadsheetStore"
import { computeFormula } from "../../lib/formula"
import { getSocket } from "../../lib/socket"

export default function Cell({ id, onCellFocus }: { id: string; onCellFocus?: (cellId: string) => void }) {
  const cells = useSheetStore((s) => s.cells)
  const setCell = useSheetStore((s) => s.setCell)
  const storedValue = cells[id]?.value ?? ""

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(storedValue)

  // Keep draft in sync when remote updates arrive while not editing
  useEffect(() => {
    if (!editing) {
      setDraft(storedValue)
    }
  }, [storedValue, editing])

  const save = useCallback(() => {
    setEditing(false)
    if (draft !== storedValue) {
      setCell(id, draft)
      getSocket().emit("cell_update", { cell: id, value: draft })
    }
  }, [draft, storedValue, id, setCell])

  const displayValue = editing
    ? draft
    : storedValue.startsWith("=")
      ? String(computeFormula(storedValue, cells))
      : storedValue

  return (
    <input
      className="cell"
      value={editing ? draft : displayValue}
      onFocus={() => {
        setEditing(true)
        setDraft(storedValue)
        onCellFocus?.(id)
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          ;(e.target as HTMLInputElement).blur()
        }
      }}
    />
  )
}
