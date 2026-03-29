import { getMilaMode, setMilaMode } from './MilaMode'
import { getBest } from '../storage'

// ─── Mila SVG avatars ────────────────────────────────────────────────────────
// Cartoon bonequinha: pele clara, cabelos enrolados castanhos

const MILA_NEUTRAL_SVG = `
<svg viewBox="0 0 100 118" xmlns="http://www.w3.org/2000/svg">
  <!-- Cabelo fundo -->
  <ellipse cx="50" cy="44" rx="35" ry="37" fill="#b8825a"/>
  <!-- Cachos do topo -->
  <circle cx="28" cy="13" r="13" fill="#c49060"/>
  <circle cx="42" cy="8"  r="14" fill="#c49060"/>
  <circle cx="58" cy="8"  r="14" fill="#c49060"/>
  <circle cx="72" cy="13" r="13" fill="#c49060"/>
  <!-- Volume lateral esquerda -->
  <circle cx="14" cy="44" r="13" fill="#b8825a"/>
  <circle cx="13" cy="57" r="11" fill="#b8825a"/>
  <!-- Volume lateral direita -->
  <circle cx="86" cy="44" r="13" fill="#b8825a"/>
  <circle cx="87" cy="57" r="11" fill="#b8825a"/>
  <!-- Reflexo cabelo -->
  <ellipse cx="44" cy="15" rx="15" ry="6" fill="#d4aa70" opacity="0.45"/>
  <!-- Rosto -->
  <ellipse cx="50" cy="63" rx="27" ry="29" fill="#f5c9a0"/>
  <!-- Orelhas -->
  <ellipse cx="23" cy="63" rx="5" ry="7" fill="#f0bfa0"/>
  <ellipse cx="77" cy="63" rx="5" ry="7" fill="#f0bfa0"/>
  <!-- Olhos brancos -->
  <ellipse cx="40" cy="58" rx="5.5" ry="5" fill="white"/>
  <ellipse cx="60" cy="58" rx="5.5" ry="5" fill="white"/>
  <!-- Íris (verde-acinzentado como nas fotos) -->
  <circle cx="40" cy="58" r="3.2" fill="#7a9e8a"/>
  <circle cx="60" cy="58" r="3.2" fill="#7a9e8a"/>
  <!-- Pupilas -->
  <circle cx="40" cy="58" r="1.6" fill="#1a0f08"/>
  <circle cx="60" cy="58" r="1.6" fill="#1a0f08"/>
  <!-- Brilho olho -->
  <circle cx="41.8" cy="56.2" r="1.1" fill="white"/>
  <circle cx="61.8" cy="56.2" r="1.1" fill="white"/>
  <!-- Sobrancelhas -->
  <path d="M34,52 Q40,49 46,52" stroke="#a07535" fill="none" stroke-width="2" stroke-linecap="round"/>
  <path d="M54,52 Q60,49 66,52" stroke="#a07535" fill="none" stroke-width="2" stroke-linecap="round"/>
  <!-- Nariz -->
  <path d="M48,68 Q50,72 52,68" stroke="#dda878" fill="none" stroke-width="1.5" stroke-linecap="round"/>
  <!-- Sorriso suave -->
  <path d="M40,77 Q50,84 60,77" stroke="#c87858" fill="#f0a085" stroke-width="1.5" stroke-linecap="round"/>
  <!-- Cachos laterais na frente -->
  <path d="M23,42 C15,54 15,67 21,76" stroke="#c49060" fill="none" stroke-width="7" stroke-linecap="round"/>
  <path d="M77,42 C85,54 85,67 79,76" stroke="#c49060" fill="none" stroke-width="7" stroke-linecap="round"/>
  <!-- Pescoço -->
  <rect x="43" y="90" width="14" height="14" rx="5" fill="#f5c9a0"/>
  <!-- Camiseta -->
  <path d="M0,118 Q22,94 50,92 Q78,94 100,118Z" fill="#9C27B0" opacity="0.75"/>
</svg>`

const MILA_HAPPY_SVG = `
<svg viewBox="0 0 110 118" xmlns="http://www.w3.org/2000/svg">
  <!-- Estrelinhas ao redor -->
  <text x="4"  y="28" font-size="15" fill="#FFD600" opacity="0.9">✦</text>
  <text x="88" y="22" font-size="12" fill="#FFD600" opacity="0.9">✦</text>
  <text x="96" y="60" font-size="10" fill="#9C27B0" opacity="0.8">✦</text>
  <text x="2"  y="70" font-size="9"  fill="#9C27B0" opacity="0.6">✦</text>
  <!-- Braços levantados celebrando -->
  <path d="M23,88 C10,75 6,58 12,42" stroke="#f5c9a0" fill="none" stroke-width="8" stroke-linecap="round"/>
  <path d="M87,88 C100,75 104,58 98,42" stroke="#f5c9a0" fill="none" stroke-width="8" stroke-linecap="round"/>
  <!-- Mãos -->
  <circle cx="11" cy="40" r="7" fill="#f5c9a0"/>
  <circle cx="99" cy="40" r="7" fill="#f5c9a0"/>
  <!-- Cabelo fundo -->
  <ellipse cx="55" cy="52" rx="35" ry="37" fill="#b8825a"/>
  <!-- Cachos do topo -->
  <circle cx="33" cy="21" r="13" fill="#c49060"/>
  <circle cx="47" cy="16" r="14" fill="#c49060"/>
  <circle cx="63" cy="16" r="14" fill="#c49060"/>
  <circle cx="77" cy="21" r="13" fill="#c49060"/>
  <!-- Volume lateral esquerda -->
  <circle cx="19" cy="52" r="12" fill="#b8825a"/>
  <circle cx="18" cy="64" r="10" fill="#b8825a"/>
  <!-- Volume lateral direita -->
  <circle cx="91" cy="52" r="12" fill="#b8825a"/>
  <circle cx="92" cy="64" r="10" fill="#b8825a"/>
  <!-- Reflexo cabelo -->
  <ellipse cx="49" cy="23" rx="15" ry="6" fill="#d4aa70" opacity="0.45"/>
  <!-- Rosto -->
  <ellipse cx="55" cy="71" rx="27" ry="29" fill="#f5c9a0"/>
  <!-- Bochechas coradas -->
  <ellipse cx="38" cy="79" rx="9" ry="6" fill="#f09080" opacity="0.3"/>
  <ellipse cx="72" cy="79" rx="9" ry="6" fill="#f09080" opacity="0.3"/>
  <!-- Orelhas -->
  <ellipse cx="28" cy="71" rx="5" ry="7" fill="#f0bfa0"/>
  <ellipse cx="82" cy="71" rx="5" ry="7" fill="#f0bfa0"/>
  <!-- Olhos (semicerrados de alegria) -->
  <ellipse cx="45" cy="65" rx="5.5" ry="4.5" fill="white"/>
  <ellipse cx="65" cy="65" rx="5.5" ry="4.5" fill="white"/>
  <circle cx="45" cy="65" r="3" fill="#7a9e8a"/>
  <circle cx="65" cy="65" r="3" fill="#7a9e8a"/>
  <circle cx="45" cy="65" r="1.5" fill="#1a0f08"/>
  <circle cx="65" cy="65" r="1.5" fill="#1a0f08"/>
  <circle cx="46.8" cy="63.2" r="1.1" fill="white"/>
  <circle cx="66.8" cy="63.2" r="1.1" fill="white"/>
  <!-- Sobrancelhas levantadas (surpresa feliz) -->
  <path d="M39,58 Q45,54 51,57" stroke="#a07535" fill="none" stroke-width="2" stroke-linecap="round"/>
  <path d="M59,57 Q65,54 71,58" stroke="#a07535" fill="none" stroke-width="2" stroke-linecap="round"/>
  <!-- Nariz -->
  <path d="M53,76 Q55,80 57,76" stroke="#dda878" fill="none" stroke-width="1.5" stroke-linecap="round"/>
  <!-- Sorriso largo com dentes -->
  <path d="M39,85 Q55,97 71,85" stroke="#c87858" fill="#f0a085" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M41,85 Q55,95 69,85" fill="white" stroke="none"/>
  <path d="M55,85 L55,94" stroke="#f0a085" fill="none" stroke-width="1"/>
  <!-- Cachos laterais na frente -->
  <path d="M28,50 C20,62 20,75 26,84" stroke="#c49060" fill="none" stroke-width="7" stroke-linecap="round"/>
  <path d="M82,50 C90,62 90,75 84,84" stroke="#c49060" fill="none" stroke-width="7" stroke-linecap="round"/>
  <!-- Pescoço -->
  <rect x="48" y="98" width="14" height="13" rx="5" fill="#f5c9a0"/>
  <!-- Camiseta -->
  <path d="M5,118 Q27,100 55,98 Q83,100 105,118Z" fill="#9C27B0" opacity="0.75"/>
</svg>`

function milaAvatar(happy: boolean): HTMLDivElement {
  const wrapper = document.createElement('div')
  wrapper.style.cssText = `width:90px;height:${happy ? 106 : 106}px;flex-shrink:0`
  wrapper.innerHTML = happy ? MILA_HAPPY_SVG : MILA_NEUTRAL_SVG
  const svg = wrapper.querySelector('svg')
  if (svg) svg.style.cssText = 'width:100%;height:100%'
  return wrapper
}

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

  screen.append(milaAvatar(false), title, milaRow, bestEl, playBtn)
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

  const elems: HTMLElement[] = [milaAvatar(true), title, scoreEl, ptLabel]

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

// SVG icons for mobile control buttons
const BTN_LEFT = `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 6L9 12L15 18" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const BTN_RIGHT = `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6L15 12L9 18" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const BTN_DROP = `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4v12" stroke="#00BCD4" stroke-width="3.5" stroke-linecap="round"/><path d="M6 12l6 7 6-7" stroke="#00BCD4" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const BTN_ROTATE = `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12a9 9 0 1 1-2.6-6.4" stroke="#CE93D8" stroke-width="3" stroke-linecap="round"/><polyline points="21,3 21,9 15,9" stroke="#CE93D8" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`

// Bottom control bar + overlay pause button for mobile
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
      gap: 6px;
    }
    .ctrl-btn {
      flex: 1;
      height: 58px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.07);
      color: #fff;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
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
      flex: 1.3;
    }
    .ctrl-btn-rotate:active, .ctrl-btn-rotate.pressing {
      background: rgba(156,39,176,0.5);
    }
    .ctrl-btn-drop {
      background: rgba(0,188,212,0.15);
      border-color: rgba(0,188,212,0.35);
      flex: 1.3;
    }
    .ctrl-btn-drop:active, .ctrl-btn-drop.pressing {
      background: rgba(0,188,212,0.35);
    }
    .ctrl-btn-hold {
      font-size: 13px; font-weight: 700; letter-spacing: 0.5px;
      color: rgba(255,255,255,0.7);
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

  function makeRepeatBtn(html: string, onPress: () => void, extraClass = ''): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.className = `ctrl-btn ${extraClass}`
    btn.innerHTML = html

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

  function makeTapBtn(html: string, onPress: () => void, extraClass = ''): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.className = `ctrl-btn ${extraClass}`
    btn.innerHTML = html
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
    makeRepeatBtn(BTN_LEFT, onLeft),
    makeTapBtn('SEG.', onHold, 'ctrl-btn-hold'),
    makeTapBtn(BTN_ROTATE, onRotate, 'ctrl-btn-rotate'),
    makeTapBtn(BTN_DROP, onHardDrop, 'ctrl-btn-drop'),
    makeRepeatBtn(BTN_RIGHT, onRight),
  )

  const pauseBtn = document.createElement('button')
  pauseBtn.className = 'overlay-btn'
  pauseBtn.textContent = '⏸'
  pauseBtn.style.cssText = 'top: 10px; right: 10px;'
  pauseBtn.addEventListener('touchstart', (e) => { e.preventDefault(); onPause() }, { passive: false })

  document.body.append(bar, pauseBtn)

  return () => {
    bar.remove(); pauseBtn.remove(); style.remove()
  }
}
