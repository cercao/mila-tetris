// Tetromino definitions with SRS rotation system

export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

export const PIECE_COLORS: Record<PieceType, string> = {
  I: '#00BCD4',
  O: '#FFD600',
  T: '#9C27B0',
  S: '#4CAF50',
  Z: '#F44336',
  J: '#1565C0',
  L: '#FF6F00',
}

// Each piece has 4 rotations, each rotation is an array of [col, row] offsets
// Coordinates are relative to pivot point
const PIECES: Record<PieceType, number[][][]> = {
  I: [
    [[0,1],[1,1],[2,1],[3,1]],
    [[2,0],[2,1],[2,2],[2,3]],
    [[0,2],[1,2],[2,2],[3,2]],
    [[1,0],[1,1],[1,2],[1,3]],
  ],
  O: [
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]],
  ],
  T: [
    [[1,0],[0,1],[1,1],[2,1]],
    [[1,0],[1,1],[2,1],[1,2]],
    [[0,1],[1,1],[2,1],[1,2]],
    [[1,0],[0,1],[1,1],[1,2]],
  ],
  S: [
    [[1,0],[2,0],[0,1],[1,1]],
    [[1,0],[1,1],[2,1],[2,2]],
    [[1,1],[2,1],[0,2],[1,2]],
    [[0,0],[0,1],[1,1],[1,2]],
  ],
  Z: [
    [[0,0],[1,0],[1,1],[2,1]],
    [[2,0],[1,1],[2,1],[1,2]],
    [[0,1],[1,1],[1,2],[2,2]],
    [[1,0],[0,1],[1,1],[0,2]],
  ],
  J: [
    [[0,0],[0,1],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[1,2]],
    [[0,1],[1,1],[2,1],[2,2]],
    [[1,0],[1,1],[0,2],[1,2]],
  ],
  L: [
    [[2,0],[0,1],[1,1],[2,1]],
    [[1,0],[1,1],[1,2],[2,2]],
    [[0,1],[1,1],[2,1],[0,2]],
    [[0,0],[1,0],[1,1],[1,2]],
  ],
}

// SRS wall kick data for J, L, S, T, Z pieces
const WALL_KICKS_JLSTZ: Record<string, [number, number][]> = {
  '0->1': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  '1->0': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
  '1->2': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
  '2->1': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  '2->3': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
  '3->2': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  '3->0': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  '0->3': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
}

// SRS wall kick data for I piece
const WALL_KICKS_I: Record<string, [number, number][]> = {
  '0->1': [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
  '1->0': [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
  '1->2': [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
  '2->1': [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
  '2->3': [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
  '3->2': [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
  '3->0': [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
  '0->3': [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
}

export interface PieceState {
  type: PieceType
  rotation: number // 0-3
  x: number // board col of pivot
  y: number // board row of pivot
}

export function getCells(piece: PieceState): [number, number][] {
  return PIECES[piece.type][piece.rotation].map(([c, r]) => [piece.x + c, piece.y + r])
}

export function getWallKicks(type: PieceType, fromRot: number, toRot: number): [number, number][] {
  const key = `${fromRot}->${toRot}`
  if (type === 'I') return WALL_KICKS_I[key] ?? [[0, 0]]
  return WALL_KICKS_JLSTZ[key] ?? [[0, 0]]
}

export function rotatePiece(piece: PieceState, dir: 1 | -1): PieceState {
  return { ...piece, rotation: ((piece.rotation + dir + 4) % 4) }
}

export function spawnPiece(type: PieceType): PieceState {
  return { type, rotation: 0, x: 3, y: 0 }
}
