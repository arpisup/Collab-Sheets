import Cell from "./Cell"
import ColumnHeader from "./ColumnHeader"
import RowHeader from "./RowHeader"

const ROWS = 50
const COLS = 26
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

interface GridProps {
  onCellFocus?: (cellId: string) => void
}

export default function Grid({ onCellFocus }: GridProps) {
  return (
    <div className="grid-container">
      {/* Header row */}
      <div className="row">
        <div className="corner" />
        {LETTERS.slice(0, COLS).map((l) => (
          <ColumnHeader key={l} letter={l} />
        ))}
      </div>

      {/* Data rows */}
      {Array.from({ length: ROWS }, (_, i) => i + 1).map((r) => (
        <div key={r} className="row">
          <RowHeader number={r} />
          {LETTERS.slice(0, COLS).map((letter) => {
            const id = `${letter}${r}`
            return <Cell key={id} id={id} onCellFocus={onCellFocus} />
          })}
        </div>
      ))}
    </div>
  )
}
