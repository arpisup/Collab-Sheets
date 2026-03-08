import Grid from "./Grid"

interface Props {
  onCellFocus?: (cellId: string) => void
}

export default function Spreadsheet({ onCellFocus }: Props) {
  return (
    <div className="sheet">
      <Grid onCellFocus={onCellFocus} />
    </div>
  )
}
