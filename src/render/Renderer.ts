import type { Board } from '../game/Board'
import { COLS, ROWS, HIDDEN_ROWS } from '../game/Board'
import type { PieceState } from '../game/Piece'
import { getCells, PIECE_COLORS } from '../game/Piece'
import type { ScoreState } from '../game/Scoring'
import type { LineAnimation } from './Animations'
import { getAnimationProgress } from './Animations'

const GRID_ALPHA = 0.08
const GHOST_ALPHA = 0.18
const CELL_RADIUS = 3

export const MOBILE_BTN_H = 92 // px reserved at bottom for control buttons

export interface Layout {
  cellSize: number
  boardX: number
  boardY: number
  boardW: number
  boardH: number
  panelX: number
  panelY: number
  panelW: number
  isMobile: boolean
}

const MOBILE_SIDE_PANEL_W = 84

function computeLayout(canvas: HTMLCanvasElement): Layout {
  const W = canvas.width
  const H = canvas.height
  const isMobile = W < 600

  const availH = isMobile ? H - MOBILE_BTN_H : H

  let cellSize: number, boardX: number, boardY: number
  let boardW: number, boardH: number
  let panelX: number, panelY: number, panelW: number

  if (isMobile) {
    // Board on the left, info panel on the right
    const boardMaxW = W - 4 - MOBILE_SIDE_PANEL_W - 4
    const cellByW = Math.floor(boardMaxW / COLS)
    const cellByH = Math.floor((availH - 10) / ROWS)
    cellSize = Math.min(cellByW, cellByH, 32)
    boardW = cellSize * COLS
    boardH = cellSize * ROWS
    boardX = 4
    boardY = Math.floor((availH - boardH) / 2)
    panelX = boardX + boardW + 4
    panelY = boardY
    panelW = W - panelX - 2
  } else {
    const maxBoardH = availH * 0.90
    cellSize = Math.floor(maxBoardH / ROWS)
    boardW = cellSize * COLS
    boardH = cellSize * ROWS
    panelW = Math.max(130, Math.min(190, W - boardW - 40))
    boardX = Math.floor((W - boardW - panelW) / 2)
    boardY = Math.floor((H - boardH) / 2)
    panelX = boardX + boardW + 16
    panelY = boardY
  }

  return { cellSize, boardX, boardY, boardW, boardH, panelX, panelY, panelW, isMobile }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawCell(
  ctx: CanvasRenderingContext2D,
  col: number, row: number,
  color: string, cellSize: number, alpha = 1,
) {
  const pad = 1
  const x = col * cellSize + pad
  const y = row * cellSize + pad
  const s = cellSize - pad * 2
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  roundRect(ctx, x, y, s, s, CELL_RADIUS)
  ctx.fill()
  // highlight
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  roundRect(ctx, x, y, s, Math.max(2, Math.floor(s * 0.35)), CELL_RADIUS)
  ctx.fill()
  ctx.restore()
}

function drawGrid(ctx: CanvasRenderingContext2D, cellSize: number, boardW: number, boardH: number) {
  ctx.save()
  ctx.strokeStyle = `rgba(255,255,255,${GRID_ALPHA})`
  ctx.lineWidth = 0.5
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath(); ctx.moveTo(c * cellSize, 0); ctx.lineTo(c * cellSize, boardH); ctx.stroke()
  }
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath(); ctx.moveTo(0, r * cellSize); ctx.lineTo(boardW, r * cellSize); ctx.stroke()
  }
  ctx.restore()
}

function drawMiniPiece(
  ctx: CanvasRenderingContext2D,
  piece: PieceState,
  cx: number, cy: number, cs: number,
) {
  const cells = getCells(piece)
  const color = PIECE_COLORS[piece.type]
  const minC = Math.min(...cells.map(([c]) => c))
  const minR = Math.min(...cells.map(([, r]) => r))
  const maxC = Math.max(...cells.map(([c]) => c))
  const maxR = Math.max(...cells.map(([, r]) => r))
  const w = (maxC - minC + 1) * cs
  const h = (maxR - minR + 1) * cs
  const offX = cx - w / 2
  const offY = cy - h / 2
  ctx.save()
  ctx.translate(offX - minC * cs, offY - minR * cs)
  for (const [c, r] of cells) {
    drawCell(ctx, c, r, color, cs)
  }
  ctx.restore()
}

function drawMiniBox(
  ctx: CanvasRenderingContext2D,
  piece: PieceState | null,
  label: string,
  bx: number, by: number, boxSize: number, cs: number,
) {
  ctx.save()
  ctx.font = `10px system-ui`
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.textAlign = 'left'
  ctx.fillText(label, bx, by - 5)
  ctx.restore()

  ctx.save()
  ctx.fillStyle = '#0d0d14'
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1
  ctx.fillRect(bx, by, boxSize, boxSize)
  ctx.strokeRect(bx, by, boxSize, boxSize)
  ctx.restore()

  if (piece) {
    drawMiniPiece(ctx, piece, bx + boxSize / 2, by + boxSize / 2, cs)
  }
}

export class Renderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private layout: Layout

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.layout = computeLayout(canvas)
  }

  resize() {
    this.layout = computeLayout(this.canvas)
  }

  get boardLayout(): Layout {
    return this.layout
  }

  drawFrame(
    board: Board,
    piece: PieceState | null,
    ghost: PieceState | null,
    nextPiece: PieceState | null,
    holdPiece: PieceState | null,
    score: ScoreState,
    milaMode: boolean,
    animation: LineAnimation | null,
    now: number,
  ) {
    const { ctx, layout } = this
    const { cellSize, boardX, boardY, boardW, boardH, panelX, panelY, panelW, isMobile } = layout

    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    ctx.fillStyle = '#111118'
    ctx.fillRect(boardX, boardY, boardW, boardH)

    // Board contents (clip to board area)
    ctx.save()
    ctx.translate(boardX, boardY)
    ctx.beginPath(); ctx.rect(0, 0, boardW, boardH); ctx.clip()

    for (let r = HIDDEN_ROWS; r < ROWS + HIDDEN_ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = board[r][c]
        if (!cell) continue
        const visRow = r - HIDDEN_ROWS
        let alpha = 1

        if (animation && !animation.done && animation.rows.includes(visRow)) {
          const p = getAnimationProgress(animation, now)
          if (p < 0.4) {
            ctx.save()
            ctx.globalAlpha = 1 - p / 0.4
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, visRow * cellSize, boardW, cellSize)
            ctx.restore()
            alpha = 0
          } else {
            alpha = 1 - (p - 0.4) / 0.6
          }
        }

        if (alpha > 0) drawCell(ctx, c, visRow, cell, cellSize, alpha)
      }
    }

    // Ghost
    if (ghost && piece) {
      const color = PIECE_COLORS[ghost.type]
      for (const [c, r] of getCells(ghost)) {
        const visRow = r - HIDDEN_ROWS
        if (visRow >= 0 && visRow < ROWS) drawCell(ctx, c, visRow, color, cellSize, GHOST_ALPHA)
      }
    }

    // Active piece
    if (piece) {
      const color = PIECE_COLORS[piece.type]
      for (const [c, r] of getCells(piece)) {
        const visRow = r - HIDDEN_ROWS
        if (visRow >= 0 && visRow < ROWS) drawCell(ctx, c, visRow, color, cellSize, 1)
      }
    }

    drawGrid(ctx, cellSize, boardW, boardH)
    ctx.restore()

    if (isMobile) {
      this.drawMobilePanel(score, nextPiece, holdPiece, milaMode)
    } else {
      this.drawDesktopPanel(score, nextPiece, holdPiece, milaMode, panelX, panelY, panelW)
    }
  }

  private drawDesktopPanel(
    score: ScoreState,
    nextPiece: PieceState | null,
    holdPiece: PieceState | null,
    milaMode: boolean,
    px: number, py: number, pw: number,
  ) {
    const { ctx } = this
    const cs = Math.floor(this.layout.cellSize * 0.7)
    const boxSize = cs * 4
    let y = py + 8

    drawMiniBox(ctx, nextPiece, 'PRÓXIMA', px, y, boxSize, cs)
    y += boxSize + 24

    drawMiniBox(ctx, holdPiece, 'SEGURAR  [C]', px, y, boxSize, cs)
    y += boxSize + 28

    const items = [
      { label: 'PONTOS', value: score.score.toLocaleString('pt-BR') },
      { label: 'NÍVEL', value: String(score.level) },
      { label: 'LINHAS', value: String(score.lines) },
    ]

    for (const item of items) {
      ctx.save()
      ctx.font = `10px system-ui`; ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.textAlign = 'left'
      ctx.fillText(item.label, px, y); y += 16
      ctx.font = `bold 22px system-ui`; ctx.fillStyle = '#fff'
      ctx.fillText(item.value, px, y); y += 30
      ctx.restore()
    }

    if (milaMode) {
      ctx.save()
      ctx.font = `11px system-ui`; ctx.fillStyle = '#CE93D8'; ctx.textAlign = 'left'
      ctx.fillText('✦ Mila Mode', px, y + 8)
      y += 24
      ctx.restore()
    } else {
      y += 16
    }

    // Controls hint
    const hints = ['↑ / X  girar', '↓  cair devagar', '␣  cair direto', 'C  segurar']
    ctx.save()
    ctx.font = `10px system-ui`; ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.textAlign = 'left'
    for (const hint of hints) {
      ctx.fillText(hint, px, y); y += 15
    }
    ctx.restore()
  }

  private drawMobilePanel(
    score: ScoreState,
    nextPiece: PieceState | null,
    holdPiece: PieceState | null,
    milaMode: boolean,
  ) {
    const { ctx, layout } = this
    const { panelX, panelY, panelW, boardH } = layout

    const cs = Math.min(18, Math.floor((panelW - 6) / 4))
    const boxSize = cs * 4
    const cx = panelX + panelW / 2

    let y = panelY + 4

    // Helper: centered label
    const label = (text: string, yy: number, alpha = 0.4) => {
      ctx.save()
      ctx.font = `9px system-ui`
      ctx.fillStyle = `rgba(255,255,255,${alpha})`
      ctx.textAlign = 'center'
      ctx.fillText(text, cx, yy)
      ctx.restore()
    }

    const bx = panelX + (panelW - boxSize) / 2

    // Next piece
    label('PRÓX.', y + 10)
    y += 14
    ctx.save()
    ctx.fillStyle = '#0d0d14'; ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1
    ctx.fillRect(bx, y, boxSize, boxSize); ctx.strokeRect(bx, y, boxSize, boxSize)
    ctx.restore()
    if (nextPiece) drawMiniPiece(ctx, nextPiece, bx + boxSize / 2, y + boxSize / 2, cs)
    y += boxSize + 10

    // Hold piece
    label('SEG.', y + 10)
    y += 14
    ctx.save()
    ctx.fillStyle = '#0d0d14'; ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1
    ctx.fillRect(bx, y, boxSize, boxSize); ctx.strokeRect(bx, y, boxSize, boxSize)
    ctx.restore()
    if (holdPiece) drawMiniPiece(ctx, holdPiece, bx + boxSize / 2, y + boxSize / 2, cs)
    y += boxSize + 16

    // Divider
    ctx.save()
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(panelX + 4, y); ctx.lineTo(panelX + panelW - 4, y); ctx.stroke()
    ctx.restore()
    y += 10

    // Stats
    const stats = [
      { label: 'PTS', value: score.score.toLocaleString('pt-BR') },
      { label: 'NÍV', value: String(score.level) },
      { label: 'LIN', value: String(score.lines) },
    ]
    for (const s of stats) {
      label(s.label, y)
      y += 15
      ctx.save()
      ctx.font = `bold 17px system-ui`; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'
      ctx.fillText(s.value, cx, y)
      ctx.restore()
      y += 26
    }

    // Mila Mode indicator
    if (milaMode) {
      y += 4
      ctx.save()
      ctx.font = `bold 10px system-ui`; ctx.fillStyle = '#CE93D8'; ctx.textAlign = 'center'
      ctx.fillText('✦ Mila', cx, y)
      ctx.restore()
    }

    // Remaining space — subtle lines label at bottom of panel
    const bottomY = panelY + boardH - 4
    if (bottomY - y > 20) {
      ctx.save()
      ctx.font = `8px system-ui`; ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.textAlign = 'center'
      ctx.fillText('tap = girar', cx, bottomY - 12)
      ctx.fillText('swipe ↓ = cair', cx, bottomY)
      ctx.restore()
    }
  }

  drawOverlay(text: string, subtext: string) {
    const { ctx, canvas } = this
    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,0.75)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.font = `bold 32px system-ui`; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 16)
    ctx.font = `16px system-ui`; ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fillText(subtext, canvas.width / 2, canvas.height / 2 + 16)
    ctx.restore()
  }
}
