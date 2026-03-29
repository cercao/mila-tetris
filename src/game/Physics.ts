import type { Board } from './Board'
import { isValidPosition, placePiece, clearLines, HIDDEN_ROWS } from './Board'
import type { PieceState } from './Piece'
import { getCells, getWallKicks, rotatePiece, PIECE_COLORS } from './Piece'

export const LOCK_DELAY_MS = 500

export interface PhysicsResult {
  piece: PieceState
  moved: boolean
  locked: boolean
  clearedRows: number[]
  linesCleared: number
  board: Board
  hardDropCells: number
  softDropCells: number
}

export function tryMove(board: Board, piece: PieceState, dx: number, dy: number): PieceState | null {
  const next = { ...piece, x: piece.x + dx, y: piece.y + dy }
  const cells = getCells(next)
  if (isValidPosition(board, cells)) return next
  return null
}

export function tryRotate(board: Board, piece: PieceState, dir: 1 | -1): PieceState | null {
  const rotated = rotatePiece(piece, dir)
  const kicks = getWallKicks(piece.type, piece.rotation, rotated.rotation)

  for (const [kx, ky] of kicks) {
    const candidate = { ...rotated, x: rotated.x + kx, y: rotated.y - ky }
    if (isValidPosition(board, getCells(candidate))) {
      return candidate
    }
  }
  return null
}

export function hardDrop(board: Board, piece: PieceState): { piece: PieceState; cells: number } {
  let current = piece
  let cells = 0
  while (true) {
    const next = tryMove(board, current, 0, 1)
    if (!next) break
    current = next
    cells++
  }
  return { piece: current, cells }
}

export function getGhostPiece(board: Board, piece: PieceState): PieceState {
  return hardDrop(board, piece).piece
}

export function lockPiece(board: Board, piece: PieceState): { board: Board; clearedRows: number[]; linesCleared: number } {
  const cells = getCells(piece)
  const color = PIECE_COLORS[piece.type]
  const next = placePiece(board, cells, color)
  const { board: cleared, clearedRows, count } = clearLines(next)
  return { board: cleared, clearedRows, linesCleared: count }
}

export function isOnGround(board: Board, piece: PieceState): boolean {
  return tryMove(board, piece, 0, 1) === null
}

export function getVisibleY(r: number): number {
  return r - HIDDEN_ROWS
}
