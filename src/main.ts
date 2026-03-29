import { createBoard, isTopOut } from './game/Board'
import { spawnPiece } from './game/Piece'
import { Randomizer } from './game/Randomizer'
import { tryMove, tryRotate, hardDrop, getGhostPiece, lockPiece, isOnGround, LOCK_DELAY_MS } from './game/Physics'
import { createScore, addLines, addSoftDrop, addHardDrop, getGravityMs } from './game/Scoring'
import { Renderer } from './render/Renderer'
import { createLineAnimation, tickAnimation } from './render/Animations'
import { KeyboardInput } from './input/Keyboard'
import { TouchInput } from './input/Touch'
import { showMenuScreen, showGameOverScreen, showPauseScreen, createMobileButtons } from './ui/screens'
import { getBest, saveBest } from './storage'
import type { Board } from './game/Board'
import type { PieceState } from './game/Piece'
import type { ScoreState } from './game/Scoring'
import type { LineAnimation } from './render/Animations'

// ─── Canvas setup ───────────────────────────────────────────────────────────

const app = document.getElementById('app')!
const canvas = document.createElement('canvas')
canvas.style.cssText = 'display:block;touch-action:none;'
app.appendChild(canvas)

function resizeCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}
resizeCanvas()
window.addEventListener('resize', () => { resizeCanvas(); renderer.resize() })

const renderer = new Renderer(canvas)

// ─── Game state ─────────────────────────────────────────────────────────────

type GamePhase = 'idle' | 'playing' | 'lockDelay' | 'animating' | 'gameOver' | 'paused'

interface GameState {
  board: Board
  piece: PieceState | null
  hold: PieceState | null
  holdUsed: boolean
  score: ScoreState
  randomizer: Randomizer
  milaMode: boolean
  phase: GamePhase
  lockTimer: number
  gravityTimer: number
  animation: LineAnimation | null
  nextType: ReturnType<Randomizer['next']>
}

function makeNextPiece(state: GameState): PieceState {
  const type = state.nextType
  state.nextType = state.randomizer.next()
  return spawnPiece(type)
}

function createGame(milaMode: boolean): GameState {
  const randomizer = new Randomizer(milaMode)
  const nextType = randomizer.next()
  const board = createBoard()
  const state: GameState = {
    board,
    piece: null,
    hold: null,
    holdUsed: false,
    score: createScore(),
    randomizer,
    milaMode,
    phase: 'playing',
    lockTimer: 0,
    gravityTimer: 0,
    animation: null,
    nextType,
  }
  state.piece = makeNextPiece(state)
  return state
}

// ─── Actions ────────────────────────────────────────────────────────────────

function doMove(state: GameState, dx: number): void {
  if (state.phase !== 'playing' && state.phase !== 'lockDelay') return
  if (!state.piece) return
  const next = tryMove(state.board, state.piece, dx, 0)
  if (next) {
    state.piece = next
    if (state.phase === 'lockDelay') {
      state.lockTimer = 0 // reset lock delay on move
    }
  }
}

function doRotate(state: GameState, dir: 1 | -1): void {
  if (state.phase !== 'playing' && state.phase !== 'lockDelay') return
  if (!state.piece) return
  const next = tryRotate(state.board, state.piece, dir)
  if (next) {
    state.piece = next
    if (state.phase === 'lockDelay') {
      state.lockTimer = 0
    }
  }
}

function doSoftDrop(state: GameState): void {
  if (state.phase !== 'playing' && state.phase !== 'lockDelay') return
  if (!state.piece) return
  const next = tryMove(state.board, state.piece, 0, 1)
  if (next) {
    state.piece = next
    state.score = addSoftDrop(state.score, 1)
    state.gravityTimer = 0
    state.phase = 'playing'
  }
}

function doHardDrop(state: GameState): void {
  if (state.phase !== 'playing' && state.phase !== 'lockDelay') return
  if (!state.piece) return
  const { piece: dropped, cells } = hardDrop(state.board, state.piece)
  state.piece = dropped
  state.score = addHardDrop(state.score, cells)
  lockCurrentPiece(state)
}

function doHold(state: GameState): void {
  if (state.phase !== 'playing' && state.phase !== 'lockDelay') return
  if (!state.piece || state.holdUsed) return

  const currentType = state.piece.type
  if (state.hold) {
    state.piece = spawnPiece(state.hold.type)
    state.hold = spawnPiece(currentType)
  } else {
    state.hold = spawnPiece(currentType)
    state.piece = makeNextPiece(state)
  }
  state.holdUsed = true
  state.gravityTimer = 0
  state.lockTimer = 0
  state.phase = 'playing'
}

function lockCurrentPiece(state: GameState): void {
  if (!state.piece) return
  const { board, clearedRows, linesCleared } = lockPiece(state.board, state.piece)
  state.board = board
  state.score = addLines(state.score, linesCleared)
  state.piece = null
  state.holdUsed = false
  state.phase = 'animating'
  state.gravityTimer = 0
  state.lockTimer = 0

  if (linesCleared > 0) {
    state.animation = createLineAnimation(clearedRows, performance.now())
  } else {
    state.animation = null
    spawnNext(state)
  }
}

function spawnNext(state: GameState): void {
  state.piece = makeNextPiece(state)
  if (isTopOut(state.board)) {
    state.phase = 'gameOver'
  } else {
    state.phase = 'playing'
  }
}

// ─── Game loop ───────────────────────────────────────────────────────────────

let gameState: GameState | null = null
let keyboard: KeyboardInput | null = null
let touch: TouchInput | null = null
let removeMobileButtons: (() => void) | null = null
let lastTime = 0
let rafId = 0
let removeScreen: (() => void) | null = null

function isMobileViewport() {
  return window.innerWidth < 600
}

function tick(now: number) {
  rafId = requestAnimationFrame(tick)
  const delta = Math.min(now - lastTime, 100) // cap to 100ms to avoid spiral
  lastTime = now

  const state = gameState
  if (!state) return

  keyboard?.tick(delta)

  // Gravity
  if (state.phase === 'playing' && state.piece) {
    state.gravityTimer += delta
    const grav = getGravityMs(state.score.level)
    while (state.gravityTimer >= grav) {
      state.gravityTimer -= grav
      const moved = tryMove(state.board, state.piece, 0, 1)
      if (moved) {
        state.piece = moved
      } else {
        state.phase = 'lockDelay'
        state.lockTimer = 0
      }
    }
  }

  // Lock delay
  if (state.phase === 'lockDelay' && state.piece) {
    state.lockTimer += delta
    // Re-check if piece is still on ground
    if (!isOnGround(state.board, state.piece)) {
      state.phase = 'playing'
    } else if (state.lockTimer >= LOCK_DELAY_MS) {
      lockCurrentPiece(state)
    }
  }

  // Line clear animation
  if (state.phase === 'animating' && state.animation) {
    state.animation = tickAnimation(state.animation, now)
    if (state.animation.done) {
      state.animation = null
      spawnNext(state)
    }
  }

  // Game over
  if (state.phase === 'gameOver') {
    endGame(state)
    return
  }

  // Render
  const ghost = state.piece ? getGhostPiece(state.board, state.piece) : null
  const nextPieceState = spawnPiece(state.nextType)

  renderer.drawFrame(
    state.board,
    state.piece,
    ghost,
    nextPieceState,
    state.hold,
    state.score,
    state.milaMode,
    state.animation,
    now,
  )
}

// ─── Session lifecycle ───────────────────────────────────────────────────────

function startGame(milaMode: boolean) {
  gameState = createGame(milaMode)
  lastTime = performance.now()

  // Keyboard
  if (keyboard) keyboard.destroy()
  keyboard = new KeyboardInput()
  keyboard.on('moveLeft',    () => doMove(gameState!, -1))
  keyboard.on('moveRight',   () => doMove(gameState!, 1))
  keyboard.on('softDrop',    () => doSoftDrop(gameState!))
  keyboard.on('hardDrop',    () => doHardDrop(gameState!))
  keyboard.on('rotateRight', () => doRotate(gameState!, 1))
  keyboard.on('rotateLeft',  () => doRotate(gameState!, -1))
  keyboard.on('hold',        () => doHold(gameState!))
  keyboard.on('pause',       () => pauseGame())

  // Touch
  if (touch) touch.destroy()
  touch = new TouchInput(canvas)
  touch.on('moveLeft',  () => doMove(gameState!, -1))
  touch.on('moveRight', () => doMove(gameState!, 1))
  touch.on('softDrop',  () => doSoftDrop(gameState!))
  touch.on('hardDrop',  () => doHardDrop(gameState!))
  touch.on('rotate',    () => doRotate(gameState!, 1))

  // Mobile buttons
  if (removeMobileButtons) removeMobileButtons()
  if (isMobileViewport()) {
    removeMobileButtons = createMobileButtons(
      () => doMove(gameState!, -1),
      () => doMove(gameState!, 1),
      () => doRotate(gameState!, 1),
      () => doHardDrop(gameState!),
      () => doHold(gameState!),
      () => pauseGame(),
    )
  }

  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(tick)
}

function pauseGame() {
  if (!gameState || gameState.phase === 'gameOver') return
  if (gameState.phase === 'paused') {
    gameState.phase = 'playing'
    lastTime = performance.now()
    return
  }

  const prevPhase = gameState.phase
  gameState.phase = 'paused'

  removeScreen?.()
  removeScreen = showPauseScreen({
    onResume: () => {
      removeScreen = null
      gameState!.phase = prevPhase === 'idle' ? 'playing' : prevPhase
      lastTime = performance.now()
    },
    onRestart: () => {
      removeScreen = null
      startGame(gameState!.milaMode)
    },
    onMenu: () => {
      removeScreen = null
      showMenu()
    },
  })
}

function endGame(state: GameState) {
  cancelAnimationFrame(rafId)

  const isNewRecord = saveBest(state.score.score, state.milaMode)

  removeScreen?.()
  removeScreen = showGameOverScreen({
    score: state.score.score,
    milaMode: state.milaMode,
    isNewRecord,
    onRestart: () => {
      removeScreen = null
      startGame(state.milaMode)
    },
    onMenu: () => {
      removeScreen = null
      showMenu()
    },
  })
}

function showMenu() {
  cancelAnimationFrame(rafId)
  keyboard?.destroy(); keyboard = null
  touch?.destroy(); touch = null
  removeMobileButtons?.(); removeMobileButtons = null
  gameState = null

  // Draw blank frame
  renderer.drawOverlay('', '')

  removeScreen?.()
  removeScreen = showMenuScreen((milaMode) => {
    removeScreen = null
    startGame(milaMode)
  })
}

// ─── Boot ────────────────────────────────────────────────────────────────────

showMenu()
