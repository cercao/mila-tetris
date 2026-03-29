import type { PieceType } from './Piece'

const ALL_PIECES: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
const MILA_PIECES: PieceType[] = ['I', 'O', 'T', 'J', 'L']

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export class Randomizer {
  private bag: PieceType[] = []
  private milaMode: boolean

  constructor(milaMode: boolean) {
    this.milaMode = milaMode
  }

  private refill() {
    const pool = this.milaMode ? MILA_PIECES : ALL_PIECES
    this.bag = shuffle([...pool])
  }

  next(): PieceType {
    if (this.bag.length === 0) this.refill()
    return this.bag.pop()!
  }

  peek(): PieceType {
    if (this.bag.length === 0) this.refill()
    return this.bag[this.bag.length - 1]
  }
}
