const KEY_NORMAL = 'tetris_best_normal'
const KEY_MILA = 'tetris_best_mila'

export function getBest(milaMode: boolean): number {
  const key = milaMode ? KEY_MILA : KEY_NORMAL
  return parseInt(localStorage.getItem(key) ?? '0', 10)
}

export function saveBest(score: number, milaMode: boolean): boolean {
  const key = milaMode ? KEY_MILA : KEY_NORMAL
  const prev = getBest(milaMode)
  if (score > prev) {
    localStorage.setItem(key, String(score))
    return true
  }
  return false
}
