export type KeyAction =
  | 'moveLeft' | 'moveRight'
  | 'softDrop' | 'hardDrop'
  | 'rotateLeft' | 'rotateRight'
  | 'hold' | 'pause'

export class KeyboardInput {
  private pressed = new Set<string>()
  private handlers: Partial<Record<KeyAction, () => void>> = {}

  // DAS (delayed auto shift) state
  private dasKey: string | null = null
  private dasTimer = 0
  private dasDelay = 167 // ms before repeat starts
  private dasInterval = 33 // ms between repeats
  private dasAccum = 0

  constructor() {
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  on(action: KeyAction, handler: () => void) {
    this.handlers[action] = handler
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return
    this.pressed.add(e.code)

    const action = this.keyToAction(e.code)
    if (!action) return
    e.preventDefault()

    this.emit(action)

    // DAS for move keys
    if (action === 'moveLeft' || action === 'moveRight') {
      this.dasKey = e.code
      this.dasTimer = 0
      this.dasAccum = 0
    }
  }

  private onKeyUp = (e: KeyboardEvent) => {
    this.pressed.delete(e.code)
    if (this.dasKey === e.code) this.dasKey = null
  }

  tick(deltaMs: number) {
    if (!this.dasKey) return
    this.dasTimer += deltaMs

    if (this.dasTimer >= this.dasDelay) {
      this.dasAccum += deltaMs
      while (this.dasAccum >= this.dasInterval) {
        this.dasAccum -= this.dasInterval
        const action = this.keyToAction(this.dasKey)
        if (action) this.emit(action)
      }
    }
  }

  private emit(action: KeyAction) {
    this.handlers[action]?.()
  }

  private keyToAction(code: string): KeyAction | null {
    switch (code) {
      case 'ArrowLeft':  return 'moveLeft'
      case 'ArrowRight': return 'moveRight'
      case 'ArrowDown':  return 'softDrop'
      case 'ArrowUp':    return 'rotateRight'
      case 'Space':      return 'hardDrop'
      case 'KeyZ':       return 'rotateLeft'
      case 'KeyX':       return 'rotateRight'
      case 'KeyC':       return 'hold'
      case 'KeyP':
      case 'Escape':     return 'pause'
      default:           return null
    }
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  }
}
