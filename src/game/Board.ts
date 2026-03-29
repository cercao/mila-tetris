export const COLS = 10
export const ROWS = 20
export const HIDDEN_ROWS = 2 // rows above visible board for spawning

export type Cell = string | null // color string or null

export type Board = Cell[][]

export function createBoard(): Board {
  return Array.from({ length: ROWS + HIDDEN_ROWS }, () => Array(COLS).fill(null))
}

export function isValidPosition(board: Board, cells: [number, number][]): boolean {
  for (const [c, r] of cells) {
    if (c < 0 || c >= COLS) return false
    if (r >= ROWS + HIDDEN_ROWS) return false
    if (r >= 0 && board[r][c] !== null) return false
  }
  return true
}

export function placePiece(board: Board, cells: [number, number][], color: string): Board {
  const next = board.map(row => [...row])
  for (const [c, r] of cells) {
    if (r >= 0) next[r][c] = color
  }
  return next
}

// Returns new board and cleared row indices (relative to visible area, 0=top)
export function clearLines(board: Board): { board: Board; clearedRows: number[]; count: number } {
  const clearedRows: number[] = []
  const kept: Cell[][] = []

  for (let r = 0; r < board.length; r++) {
    if (board[r].every(cell => cell !== null)) {
      clearedRows.push(r - HIDDEN_ROWS)
    } else {
      kept.push(board[r])
    }
  }

  const count = clearedRows.length
  const empty = Array.from({ length: count }, () => Array(COLS).fill(null))
  const next = [...empty, ...kept]

  return { board: next, clearedRows, count }
}

export function isTopOut(board: Board): boolean {
  // Check if any cell in the hidden rows is occupied
  for (let r = 0; r < HIDDEN_ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== null) return true
    }
  }
  return false
}
