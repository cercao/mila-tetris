export type TouchAction =
  | 'moveLeft' | 'moveRight'
  | 'softDrop' | 'hardDrop'
  | 'rotate'

const SWIPE_THRESHOLD = 20    // px to trigger horizontal swipe
const SOFT_DROP_THRESHOLD = 30 // px downward to soft drop
const FLICK_SPEED = 0.8        // px/ms for hard drop flick
const TAP_MAX_MOVE = 12        // px max movement for a tap
const TAP_MAX_TIME = 250       // ms max duration for a tap

export class TouchInput {
  private handlers: Partial<Record<TouchAction, () => void>> = {}
  private startX = 0
  private startY = 0
  private startTime = 0
  private lastX = 0
  private lastY = 0
  private moved = false
  private element: HTMLElement

  constructor(element: HTMLElement) {
    this.element = element
    element.addEventListener('pointerdown', this.onStart, { passive: false })
    element.addEventListener('pointermove', this.onMove, { passive: false })
    element.addEventListener('pointerup', this.onEnd, { passive: false })
    element.addEventListener('pointercancel', this.onEnd, { passive: false })
  }

  on(action: TouchAction, handler: () => void) {
    this.handlers[action] = handler
  }

  private onStart = (e: PointerEvent) => {
    e.preventDefault()
    this.startX = this.lastX = e.clientX
    this.startY = this.lastY = e.clientY
    this.startTime = Date.now()
    this.moved = false
  }

  private onMove = (e: PointerEvent) => {
    if (e.buttons === 0) return
    e.preventDefault()
    const dx = e.clientX - this.lastX
    const dy = e.clientY - this.lastY
    const totalDx = Math.abs(e.clientX - this.startX)
    const totalDy = Math.abs(e.clientY - this.startY)

    if (totalDx > TAP_MAX_MOVE || totalDy > TAP_MAX_MOVE) this.moved = true

    // Horizontal swipe — trigger per SWIPE_THRESHOLD px
    if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) this.emit('moveRight')
      else this.emit('moveLeft')
      this.lastX = e.clientX
      this.lastY = e.clientY
      return
    }

    // Vertical soft drop — trigger per SOFT_DROP_THRESHOLD px
    if (dy >= SOFT_DROP_THRESHOLD && totalDy > totalDx) {
      this.emit('softDrop')
      this.lastX = e.clientX
      this.lastY = e.clientY
    }
  }

  private onEnd = (e: PointerEvent) => {
    e.preventDefault()
    const dt = Date.now() - this.startTime
    const totalDy = e.clientY - this.startY

    // Flick down = hard drop
    if (totalDy > SOFT_DROP_THRESHOLD && dt > 0) {
      const speed = totalDy / dt
      if (speed >= FLICK_SPEED) {
        this.emit('hardDrop')
        return
      }
    }

    // Tap = rotate
    if (!this.moved && dt < TAP_MAX_TIME) {
      this.emit('rotate')
    }
  }

  private emit(action: TouchAction) {
    this.handlers[action]?.()
  }

  destroy() {
    this.element.removeEventListener('pointerdown', this.onStart)
    this.element.removeEventListener('pointermove', this.onMove)
    this.element.removeEventListener('pointerup', this.onEnd)
    this.element.removeEventListener('pointercancel', this.onEnd)
  }
}
