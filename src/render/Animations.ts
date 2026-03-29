export interface LineAnimation {
  rows: number[] // visible row indices (0 = top of visible board)
  startTime: number
  duration: number // ms
  done: boolean
}

export function createLineAnimation(rows: number[], now: number): LineAnimation {
  return { rows, startTime: now, duration: 200, done: false }
}

export function tickAnimation(anim: LineAnimation, now: number): LineAnimation {
  return { ...anim, done: now - anim.startTime >= anim.duration }
}

export function getAnimationProgress(anim: LineAnimation, now: number): number {
  return Math.min(1, (now - anim.startTime) / anim.duration)
}
