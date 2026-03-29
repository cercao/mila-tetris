export interface ScoreState {
  score: number
  level: number
  lines: number
}

export function createScore(): ScoreState {
  return { score: 0, level: 1, lines: 0 }
}

const LINE_POINTS = [0, 100, 300, 500, 800]

export function addLines(state: ScoreState, count: number): ScoreState {
  if (count === 0) return state
  const points = (LINE_POINTS[count] ?? 800) * state.level
  const lines = state.lines + count
  const level = Math.floor(lines / 10) + 1
  return { score: state.score + points, level, lines }
}

export function addSoftDrop(state: ScoreState, cells: number): ScoreState {
  return { ...state, score: state.score + cells }
}

export function addHardDrop(state: ScoreState, cells: number): ScoreState {
  return { ...state, score: state.score + cells * 2 }
}

// Gravity: milliseconds per row drop
export function getGravityMs(level: number): number {
  // Classic Tetris formula approximation
  const speeds = [800, 717, 633, 550, 467, 383, 300, 217, 133, 100, 83, 83, 83, 67, 67, 67, 50, 50, 50, 33]
  const idx = Math.min(level - 1, speeds.length - 1)
  return speeds[idx]
}
