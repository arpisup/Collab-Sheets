import { evaluate } from "mathjs"

interface CellMap {
  [key: string]: { value: string }
}

/** Convert column letter(s) to 0-based index */
function colToIndex(col: string): number {
  let idx = 0
  for (let i = 0; i < col.length; i++) {
    idx = idx * 26 + (col.charCodeAt(i) - 64)
  }
  return idx - 1
}

/** Expand a range like A1:A5 into individual cell references */
function expandRange(range: string): string[] {
  const upper = range.trim().toUpperCase()
  const match = upper.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/)
  if (!match) return [upper]

  const [, startCol, startRowStr, endCol, endRowStr] = match
  const startRow = parseInt(startRowStr, 10)
  const endRow = parseInt(endRowStr, 10)
  const sc = colToIndex(startCol)
  const ec = colToIndex(endCol)

  const refs: string[] = []
  for (let c = sc; c <= ec; c++) {
    const letter = String.fromCharCode(65 + c)
    for (let r = startRow; r <= endRow; r++) {
      refs.push(`${letter}${r}`)
    }
  }
  return refs
}

/** Resolve a single cell ref to its numeric value, computing nested formulas */
function resolveCell(ref: string, cells: CellMap, depth: number): number {
  if (depth > 10) return 0
  const raw = cells[ref]?.value
  if (raw == null || raw === "") return 0
  if (raw.startsWith("=")) {
    const result = computeFormula(raw, cells, depth + 1)
    const num = Number(result)
    return isNaN(num) ? 0 : num
  }
  const num = Number(raw)
  return isNaN(num) ? 0 : num
}

/** Collect numeric values from a comma-separated list of refs / ranges */
function collectValues(args: string, cells: CellMap, depth: number): number[] {
  const parts = args.split(",")
  const values: number[] = []
  for (const part of parts) {
    const refs = expandRange(part.trim())
    for (const ref of refs) {
      values.push(resolveCell(ref.toUpperCase(), cells, depth))
    }
  }
  return values
}

export function computeFormula(raw: string, cells: CellMap, depth = 0): string | number {
  if (!raw.startsWith("=")) return raw
  if (depth > 10) return "ERR"

  try {
    let expr = raw.slice(1).trim()

    // Replace spreadsheet functions (SUM, AVERAGE, MIN, MAX, COUNT) inline
    // so they can be composed in larger expressions like =SUM(A1:A5)+10
    expr = expr.replace(
      /\b(SUM|AVERAGE|AVG|MIN|MAX|COUNT)\s*\(([^)]+)\)/gi,
      (_, fn: string, args: string) => {
        const values = collectValues(args, cells, depth)
        switch (fn.toUpperCase()) {
          case "SUM":
            return String(values.reduce((a, b) => a + b, 0))
          case "AVERAGE":
          case "AVG":
            return values.length
              ? String(values.reduce((a, b) => a + b, 0) / values.length)
              : "0"
          case "MIN":
            return values.length ? String(Math.min(...values)) : "0"
          case "MAX":
            return values.length ? String(Math.max(...values)) : "0"
          case "COUNT":
            return String(values.length)
          default:
            return "0"
        }
      }
    )

    // Replace remaining cell references (case-insensitive, word-boundary-aware)
    expr = expr.replace(/\b([A-Z]{1,3})(\d{1,5})\b/gi, (_, col: string, row: string) => {
      return String(resolveCell(col.toUpperCase() + row, cells, depth))
    })

    return evaluate(expr) as number
  } catch {
    return "ERR"
  }
}
