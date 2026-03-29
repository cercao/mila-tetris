import { getMilaMode, setMilaMode } from './MilaMode'
import { getBest } from '../storage'

function el<T extends HTMLElement>(tag: string, attrs: Record<string, string> = {}, text = ''): T {
  const e = document.createElement(tag) as T
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v
    else e.setAttribute(k, v)
  }
  if (text) e.textContent = text
  return e
}

function css(styles: string) {
  const s = document.createElement('style')
  s.textContent = styles
  document.head.appendChild(s)
}

css(`
  .screen {
    position: fixed; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: rgba(10,10,15,0.97);
    z-index: 100;
    font-family: system-ui, -apple-system, sans-serif;
    color: #fff;
    gap: 16px;
    padding: 24px;
    box-sizing: border-box;
  }
  .screen h1 {
    font-size: clamp(48px, 10vw, 80px);
    font-weight: 900;
    letter-spacing: -2px;
    margin: 0;
    background: linear-gradient(135deg, #00BCD4, #9C27B0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .screen h2 {
    font-size: 22px; font-weight: 700; margin: 0;
  }
  .screen p {
    font-size: 14px; color: rgba(255,255,255,0.5); margin: 0; text-align: center;
  }
  .btn {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 12px 32px;
    border-radius: 8px;
    border: none; cursor: pointer;
    font-size: 16px; font-weight: 700; font-family: inherit;
    transition: opacity 0.15s, transform 0.1s;
    min-width: 160px;
  }
  .btn:active { transform: scale(0.97); }
  .btn-primary { background: #9C27B0; color: #fff; }
  .btn-secondary { background: rgba(255,255,255,0.1); color: #fff; }
  .btn-small { padding: 8px 20px; font-size: 14px; min-width: 120px; }
  .toggle-row {
    display: flex; align-items: center; gap: 12px;
    background: rgba(255,255,255,0.06);
    padding: 12px 20px; border-radius: 12px;
    cursor: pointer; user-select: none;
  }
  .toggle-row label { cursor: pointer; font-size: 14px; line-height: 1.4; }
  .toggle {
    position: relative; width: 44px; height: 24px; flex-shrink: 0;
  }
  .toggle input { opacity: 0; width: 0; height: 0; }
  .toggle-slider {
    position: absolute; inset: 0;
    background: rgba(255,255,255,0.15); border-radius: 24px;
    transition: background 0.2s;
  }
  .toggle-slider::before {
    content: ''; position: absolute;
    width: 18px; height: 18px; border-radius: 50%;
    background: #fff; left: 3px; top: 3px;
    transition: transform 0.2s;
  }
  .toggle input:checked + .toggle-slider { background: #9C27B0; }
  .toggle input:checked + .toggle-slider::before { transform: translateX(20px); }
  .best-score { font-size: 13px; color: rgba(255,255,255,0.35); }
  .score-highlight {
    font-size: clamp(32px, 8vw, 56px); font-weight: 900;
    background: linear-gradient(135deg, #FFD600, #FF6F00);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .new-record {
    font-size: 14px; color: #FFD600; font-weight: 700;
    animation: pulse 1s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; } 50% { opacity: 0.5; }
  }
  .btn-row { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
`)

export function showMenuScreen(onStart: (mila: boolean) => void): () => void {
  const screen = el('div', { class: 'screen' })

  const title = el('h1', {}, 'TETRIS')

  const milaRow = el('div', { class: 'toggle-row' })
  const toggle = el('label', { class: 'toggle', for: 'mila-checkbox' })
  const checkbox = el<HTMLInputElement>('input', { type: 'checkbox', id: 'mila-checkbox' })
  checkbox.checked = getMilaMode()
  const slider = el('span', { class: 'toggle-slider' })
  toggle.appendChild(checkbox)
  toggle.appendChild(slider)
  const labelText = el('label', { for: 'mila-checkbox' })
  labelText.innerHTML = '<strong>Mila Mode</strong><br><span style="color:rgba(255,255,255,0.5);font-size:12px">sem o bloco chato</span>'
  milaRow.appendChild(toggle)
  milaRow.appendChild(labelText)

  const best = getBest(checkbox.checked)
  const bestEl = el('p', { class: 'best-score' }, best > 0 ? `Recorde: ${best.toLocaleString('pt-BR')}` : '')

  checkbox.addEventListener('change', () => {
    setMilaMode(checkbox.checked)
    const b = getBest(checkbox.checked)
    bestEl.textContent = b > 0 ? `Recorde: ${b.toLocaleString('pt-BR')}` : ''
  })

  const playBtn = el<HTMLButtonElement>('button', { class: 'btn btn-primary' }, 'Jogar')
  playBtn.addEventListener('click', () => {
    screen.remove()
    onStart(checkbox.checked)
  })

  screen.append(title, milaRow, bestEl, playBtn)
  document.body.appendChild(screen)

  return () => screen.remove()
}

export interface GameOverOptions {
  score: number
  milaMode: boolean
  isNewRecord: boolean
  onRestart: () => void
  onMenu: () => void
}

export function showGameOverScreen(opts: GameOverOptions): () => void {
  const { score, milaMode, isNewRecord, onRestart, onMenu } = opts
  const screen = el('div', { class: 'screen' })

  const title = el('h2', {}, 'Fim de jogo')
  const scoreEl = el('div', { class: 'score-highlight' }, score.toLocaleString('pt-BR'))
  const ptLabel = el('p', {}, 'pontos')

  const elems: HTMLElement[] = [title, scoreEl, ptLabel]

  if (isNewRecord) {
    elems.push(el('div', { class: 'new-record' }, '✦ Novo recorde!'))
  }

  const btnRow = el('div', { class: 'btn-row' })
  const restartBtn = el<HTMLButtonElement>('button', { class: 'btn btn-primary btn-small' }, 'Nova partida')
  const menuBtn = el<HTMLButtonElement>('button', { class: 'btn btn-secondary btn-small' }, 'Menu')
  restartBtn.addEventListener('click', () => { screen.remove(); onRestart() })
  menuBtn.addEventListener('click', () => { screen.remove(); onMenu() })
  btnRow.append(restartBtn, menuBtn)

  screen.append(...elems, btnRow)

  // Subtle fade-in
  screen.style.opacity = '0'
  screen.style.transition = 'opacity 0.4s'
  document.body.appendChild(screen)
  requestAnimationFrame(() => { screen.style.opacity = '1' })

  return () => screen.remove()
}

export interface PauseOptions {
  onResume: () => void
  onRestart: () => void
  onMenu: () => void
}

export function showPauseScreen(opts: PauseOptions): () => void {
  const { onResume, onRestart, onMenu } = opts
  const screen = el('div', { class: 'screen' })

  const title = el('h2', {}, 'Pausado')

  const btnRow = el('div', { class: 'btn-row' })
  const resumeBtn = el<HTMLButtonElement>('button', { class: 'btn btn-primary btn-small' }, 'Continuar')
  const restartBtn = el<HTMLButtonElement>('button', { class: 'btn btn-secondary btn-small' }, 'Reiniciar')
  const menuBtn = el<HTMLButtonElement>('button', { class: 'btn btn-secondary btn-small' }, 'Menu')

  resumeBtn.addEventListener('click', () => { screen.remove(); onResume() })
  restartBtn.addEventListener('click', () => { screen.remove(); onRestart() })
  menuBtn.addEventListener('click', () => { screen.remove(); onMenu() })

  btnRow.append(resumeBtn, restartBtn, menuBtn)
  screen.append(title, btnRow)
  document.body.appendChild(screen)

  return () => screen.remove()
}

// Bottom control bar + overlay buttons for mobile
export function createMobileButtons(
  onLeft: () => void,
  onRight: () => void,
  onRotate: () => void,
  onHardDrop: () => void,
  onHold: () => void,
  onPause: () => void,
): () => void {
  const style = document.createElement('style')
  style.textContent = `
    .ctrl-bar {
      position: fixed; bottom: 0; left: 0; right: 0;
      height: 92px;
      display: flex; align-items: center; justify-content: space-between;
      background: #0d0d14;
      border-top: 1px solid rgba(255,255,255,0.07);
      padding: 8px 10px;
      padding-bottom: max(8px, env(safe-area-inset-bottom));
      z-index: 50; box-sizing: border-box;
      gap: 8px;
    }
    .ctrl-btn {
      flex: 1;
      height: 58px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.07);
      color: #fff;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 22px;
      cursor: pointer;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      display: flex; align-items: center; justify-content: center;
      user-select: none;
      transition: background 0.08s;
    }
    .ctrl-btn:active, .ctrl-btn.pressing {
      background: rgba(255,255,255,0.18);
    }
    .ctrl-btn-rotate {
      background: rgba(156,39,176,0.25);
      border-color: rgba(156,39,176,0.5);
      flex: 1.4;
    }
    .ctrl-btn-rotate:active, .ctrl-btn-rotate.pressing {
      background: rgba(156,39,176,0.5);
    }
    .ctrl-btn-drop {
      background: rgba(0,188,212,0.15);
      border-color: rgba(0,188,212,0.35);
    }
    .ctrl-btn-drop:active, .ctrl-btn-drop.pressing {
      background: rgba(0,188,212,0.35);
    }
    .overlay-btn {
      position: fixed;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.7);
      font-family: system-ui;
      font-size: 12px; font-weight: 600;
      border-radius: 8px;
      padding: 7px 13px;
      cursor: pointer; z-index: 51;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
  `
  document.head.appendChild(style)

  function makeRepeatBtn(text: string, onPress: () => void, extraClass = ''): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.className = `ctrl-btn ${extraClass}`
    btn.textContent = text

    let dasTimer: ReturnType<typeof setTimeout> | null = null
    let interval: ReturnType<typeof setInterval> | null = null

    const stop = () => {
      if (dasTimer) { clearTimeout(dasTimer); dasTimer = null }
      if (interval) { clearInterval(interval); interval = null }
      btn.classList.remove('pressing')
    }

    btn.addEventListener('touchstart', (e) => {
      e.preventDefault()
      onPress()
      btn.classList.add('pressing')
      dasTimer = setTimeout(() => {
        interval = setInterval(onPress, 50)
      }, 150)
    }, { passive: false })

    btn.addEventListener('touchend', (e) => { e.preventDefault(); stop() }, { passive: false })
    btn.addEventListener('touchcancel', (e) => { e.preventDefault(); stop() }, { passive: false })

    return btn
  }

  function makeTapBtn(text: string, onPress: () => void, extraClass = ''): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.className = `ctrl-btn ${extraClass}`
    btn.textContent = text
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault(); onPress(); btn.classList.add('pressing')
    }, { passive: false })
    btn.addEventListener('touchend', (e) => {
      e.preventDefault(); btn.classList.remove('pressing')
    }, { passive: false })
    btn.addEventListener('touchcancel', (e) => {
      e.preventDefault(); btn.classList.remove('pressing')
    }, { passive: false })
    return btn
  }

  const bar = document.createElement('div')
  bar.className = 'ctrl-bar'
  bar.append(
    makeRepeatBtn('←', onLeft),
    makeTapBtn('↻', onRotate, 'ctrl-btn-rotate'),
    makeTapBtn('⬇', onHardDrop, 'ctrl-btn-drop'),
    makeRepeatBtn('→', onRight),
  )

  const holdBtn = document.createElement('button')
  holdBtn.className = 'overlay-btn'
  holdBtn.textContent = 'SEG.'
  holdBtn.style.cssText = 'top: 10px; left: 10px;'
  holdBtn.addEventListener('touchstart', (e) => { e.preventDefault(); onHold() }, { passive: false })

  const pauseBtn = document.createElement('button')
  pauseBtn.className = 'overlay-btn'
  pauseBtn.textContent = '⏸'
  pauseBtn.style.cssText = 'top: 10px; right: 10px;'
  pauseBtn.addEventListener('touchstart', (e) => { e.preventDefault(); onPause() }, { passive: false })

  document.body.append(bar, holdBtn, pauseBtn)

  return () => {
    bar.remove(); holdBtn.remove(); pauseBtn.remove(); style.remove()
  }
}
