import { distSq, easeOutBack, easeOutCubic, lerp, rgba } from './geometry'
import { computeIdleXY, type Planet } from './sceneState'
import { renderTextAsLines } from './textLines'

// hysteresis: tighter radius to START a hover, looser radius to KEEP one —
// without this a cursor sitting near a planet's edge flickers the card
// in/out every frame it crosses the single boundary
export const HOVER_ENTER_MARGIN = 10
export const HOVER_STAY_MARGIN = 26
// brief debounce before a hover-target CHANGE is actually committed, so a
// fast pass-through between two adjacent planets doesn't flash the card
// open/close/open
export const HOVER_COMMIT_DELAY = 50
export const HOVER_SMOOTH = 0.18
export const TYPEWRITER_MS_PER_CHAR = 22
export const CARD_HIDE_DELAY_MS = 220
export const CARD_HIDING_CLASS_MS = 160

export type FocusMode = 'idle' | 'zooming-in' | 'focused' | 'zooming-out'

export interface FocusState {
  mode: FocusMode
  index: number
  t0: number
  duration: number
  startX: number
  startY: number
  startR: number
  targetX: number
  targetY: number
  targetR: number
}

export interface InteractionState {
  mouseX: number
  mouseY: number
  hoveredIndex: number
  mouseCommittedIndex: number
  pendingMouseIndex: number
  pendingMouseSince: number
  keyboardFocusIndex: number
  usingKeyboard: boolean
  activeInfoIndex: number
  activeCardIndex: number
  cardVisible: boolean
  cardHovered: boolean
  hideTimer: ReturnType<typeof setTimeout> | null
  cardTypeTimer: ReturnType<typeof setInterval> | null
  focus: FocusState
  panelTimers: ReturnType<typeof setTimeout>[]
  ambientDim: number
  lastNow: number
}

export interface PlanetSceneDom {
  cardAnchor: HTMLElement
  card: HTMLElement
  cardFamily: HTMLElement
  cardTitle: HTMLElement
  cardDesc: HTMLElement
  sceneHeading: HTMLElement
  kbdRing: HTMLElement
  glCanvas: HTMLCanvasElement
  panel: HTMLElement
  closeBtn: HTMLElement
  fpTag: HTMLElement
  fpTitle: HTMLElement
  fpDesc: HTMLElement
  fpLink: HTMLElement
}

export function createInteractionState(): InteractionState {
  return {
    mouseX: -9999,
    mouseY: -9999,
    hoveredIndex: -1,
    mouseCommittedIndex: -1,
    pendingMouseIndex: -1,
    pendingMouseSince: 0,
    keyboardFocusIndex: -1,
    usingKeyboard: false,
    activeInfoIndex: -1,
    activeCardIndex: -1,
    cardVisible: false,
    cardHovered: false,
    hideTimer: null,
    cardTypeTimer: null,
    focus: {
      mode: 'idle',
      index: -1,
      t0: 0,
      duration: 650,
      startX: 0,
      startY: 0,
      startR: 0,
      targetX: 0,
      targetY: 0,
      targetR: 0,
    },
    panelTimers: [],
    ambientDim: 1,
    lastNow: performance.now(),
  }
}

export function getActiveInfoIndex(state: InteractionState): number {
  if (state.focus.mode !== 'idle') return -1
  return state.usingKeyboard ? state.keyboardFocusIndex : state.mouseCommittedIndex
}

// Card faces away from whichever screen edge the planet is nearest, using
// the planet's LIVE drawn position (drawX/drawY) — the mockup read a pair
// of fields (p.x/p.y) that were declared but never updated per-frame
// (always 0,0), which pinned every card to the same bottom-left offset
// regardless of the planet's actual screen position. Fixed here to use the
// live position so the card actually avoids screen edges as intended.
function decideDirection(p: Planet, W: number, H: number): { horiz: 'left' | 'center' | 'right'; vert: 'above' | 'below' } {
  let horiz: 'left' | 'center' | 'right' = 'center'
  let vert: 'above' | 'below' = 'above'
  if (p.drawX < 190) horiz = 'left'
  else if (p.drawX > W - 190) horiz = 'right'
  if (p.drawY < H * 0.38) vert = 'below'
  return { horiz, vert }
}

function applyDirection(cardEl: HTMLElement, dir: { horiz: 'left' | 'center' | 'right'; vert: 'above' | 'below' }) {
  const tx = dir.horiz === 'center' ? '-50%' : dir.horiz === 'left' ? '0%' : '-100%'
  const ty = dir.vert === 'above' ? '-100%' : '0%'
  const gap = dir.vert === 'above' ? '-18px' : '18px'
  cardEl.style.setProperty('--tx', tx)
  cardEl.style.setProperty('--ty', ty)
  cardEl.style.setProperty('--gap', gap)
}

function stopTypewriter(state: InteractionState, cardDescEl: HTMLElement) {
  if (state.cardTypeTimer !== null) {
    clearInterval(state.cardTypeTimer)
    state.cardTypeTimer = null
  }
  cardDescEl.classList.remove('pc-typing')
}

// Types `text` into `el` one character at a time. Any previously running
// typewriter is stopped first, so rapid hover-switching between planets
// never mixes two planets' text or leaves a stale interval ticking in the
// background. Kept running under prefers-reduced-motion (it's informational
// and one-shot, not continuous decorative motion).
function typewriterInto(state: InteractionState, cardDescEl: HTMLElement, text: string) {
  stopTypewriter(state, cardDescEl)
  cardDescEl.textContent = ''
  if (!text) return
  cardDescEl.classList.add('pc-typing')
  let i = 0
  state.cardTypeTimer = setInterval(() => {
    i++
    cardDescEl.textContent = text.slice(0, i)
    if (i >= text.length) {
      if (state.cardTypeTimer !== null) clearInterval(state.cardTypeTimer)
      state.cardTypeTimer = null
      cardDescEl.classList.remove('pc-typing')
    }
  }, TYPEWRITER_MS_PER_CHAR)
}

// Forces the pc-anim reveal keyframes (frame draw-in, corner brackets,
// title flicker-in) to restart even when the card is already visible and
// only its content is being retargeted to a new planet (rapid hover
// switching) — removing then re-adding the class with a forced reflow in
// between is what makes CSS animations replay from frame 0.
function retriggerCardReveal(cardEl: HTMLElement) {
  cardEl.classList.remove('pc-anim')
  void cardEl.offsetWidth // force reflow
  cardEl.classList.add('pc-anim')
}

function showCard(state: InteractionState, dom: PlanetSceneDom, planets: Planet[], idx: number) {
  const p = planets[idx]
  if (state.hideTimer) {
    clearTimeout(state.hideTimer)
    state.hideTimer = null
  }
  dom.cardFamily.textContent = p.family.label
  dom.cardTitle.textContent = p.name
  typewriterInto(state, dom.cardDesc, p.desc)
  dom.card.style.setProperty('--accent', rgba(p.color, 1))
  applyDirection(dom.card, decideDirection(p, window.innerWidth, window.innerHeight))
  state.activeCardIndex = idx
  retriggerCardReveal(dom.card)
  if (!state.cardVisible) {
    dom.card.classList.remove('hiding')
    dom.card.classList.add('visible')
    state.cardVisible = true
  }
}

function hideCard(state: InteractionState, dom: PlanetSceneDom) {
  dom.card.classList.add('hiding')
  dom.card.classList.remove('visible')
  dom.card.classList.remove('pc-anim')
  stopTypewriter(state, dom.cardDesc)
  state.cardVisible = false
  state.activeCardIndex = -1
  setTimeout(() => {
    dom.card.classList.remove('hiding')
  }, CARD_HIDING_CLASS_MS)
}

function scheduleHide(state: InteractionState, dom: PlanetSceneDom) {
  if (state.hideTimer) return
  state.hideTimer = setTimeout(() => {
    state.hideTimer = null
    if (!state.cardHovered && getActiveInfoIndex(state) === -1) hideCard(state, dom)
  }, CARD_HIDE_DELAY_MS)
}

function hitTestPlanet(planets: Planet[], mx: number, my: number): number {
  let nearest = -1
  let nearestDist = Infinity
  for (let i = 0; i < planets.length; i++) {
    const p = planets[i]
    const d = Math.sqrt(distSq(mx, my, p.drawX, p.drawY))
    if (d < p.drawR + HOVER_ENTER_MARGIN && d < nearestDist) {
      nearestDist = d
      nearest = i
    }
  }
  return nearest
}

export function computeFocusTarget(W: number, H: number): { x: number; y: number; r: number } {
  const narrow = W < 760
  const fx = narrow ? 0.5 : 0.3
  const fy = narrow ? 0.3 : 0.52
  let r = Math.min(W, H) * (narrow ? 0.2 : 0.17)
  r = Math.max(80, Math.min(230, r))
  return { x: fx * W, y: fy * H, r }
}

function clearPanelTimers(state: InteractionState) {
  state.panelTimers.forEach((id) => clearTimeout(id))
  state.panelTimers = []
}

function hidePanelLines(dom: PlanetSceneDom) {
  dom.panel.classList.remove('show')
  ;[dom.fpTag, dom.fpTitle, dom.fpLink].forEach((el) => el.classList.remove('show'))
  // desc is rendered as N per-visual-line child divs (see fillPanel) rather
  // than a single block, so its reveal state lives on those children
  dom.fpDesc.querySelectorAll('.fp-desc-line').forEach((el) => el.classList.remove('show'))
}

function fillPanel(dom: PlanetSceneDom, p: Planet) {
  dom.fpTag.textContent = p.family.label
  dom.fpTitle.textContent = p.name
  // Rebuilds fpDesc's children as one div per ACTUALLY rendered visual line
  // (Range/getClientRects-measured against fpDesc's real width/font, not a
  // char-count guess) so each wrapped line can cascade in on its own — see
  // schedulePanelReveal. Always rebuilds from scratch, so reopening the
  // panel (same or different planet) never leaves stale line spans behind.
  renderTextAsLines(dom.fpDesc, p.desc, 'fp-line fp-desc-line')
  dom.panel.style.setProperty('--accent', rgba(p.color, 1))
}

function schedulePanelReveal(state: InteractionState, dom: PlanetSceneDom) {
  const base = Math.round(state.focus.duration * 0.55)
  const stagger = 100
  const descLines = dom.fpDesc.querySelectorAll<HTMLElement>('.fp-desc-line')

  state.panelTimers.push(setTimeout(() => dom.panel.classList.add('show'), base))
  state.panelTimers.push(setTimeout(() => dom.fpTag.classList.add('show'), base + 80))
  state.panelTimers.push(setTimeout(() => dom.fpTitle.classList.add('show'), base + 80 + stagger))

  // each wrapped description line cascades in on its own, one stagger apart,
  // starting where the old single-block desc reveal used to fire
  const descStart = base + 80 + stagger * 2
  descLines.forEach((lineEl, i) => {
    state.panelTimers.push(setTimeout(() => lineEl.classList.add('show'), descStart + i * stagger))
  })

  // CTA waits one stagger past the LAST desc line (matches the original
  // single-stagger gap between desc and link when there's only one line)
  const linkDelay = descStart + Math.max(descLines.length, 1) * stagger
  state.panelTimers.push(setTimeout(() => dom.fpLink.classList.add('show'), linkDelay))
}

export function startFocus(state: InteractionState, dom: PlanetSceneDom, planets: Planet[], idx: number) {
  if (state.focus.mode !== 'idle' && state.focus.mode !== 'zooming-out') return
  if (state.hideTimer) {
    clearTimeout(state.hideTimer)
    state.hideTimer = null
  }
  hideCard(state, dom)
  state.hoveredIndex = -1
  state.mouseCommittedIndex = -1
  state.pendingMouseIndex = -1
  const p = planets[idx]
  const tgt = computeFocusTarget(window.innerWidth, window.innerHeight)
  state.focus.mode = 'zooming-in'
  state.focus.index = idx
  state.focus.t0 = performance.now()
  state.focus.duration = 650
  state.focus.startX = p.drawX
  state.focus.startY = p.drawY
  state.focus.startR = p.drawR
  state.focus.targetX = tgt.x
  state.focus.targetY = tgt.y
  state.focus.targetR = tgt.r
  clearPanelTimers(state)
  fillPanel(dom, p)
  schedulePanelReveal(state, dom)
  dom.sceneHeading.classList.add('dim')
}

export function closeFocus(state: InteractionState, dom: PlanetSceneDom, planets: Planet[]) {
  if (state.focus.mode !== 'focused' && state.focus.mode !== 'zooming-in') return
  const p = planets[state.focus.index]
  clearPanelTimers(state)
  hidePanelLines(dom)
  state.focus.mode = 'zooming-out'
  state.focus.t0 = performance.now()
  state.focus.duration = 550
  state.focus.startX = p.drawX
  state.focus.startY = p.drawY
  state.focus.startR = p.drawR
  dom.sceneHeading.classList.remove('dim')
}

/** Returns the planet currently backing the focus panel, or null. */
export function getFocusedPlanet(state: InteractionState, planets: Planet[]): Planet | null {
  if (state.focus.index < 0 || state.focus.index >= planets.length) return null
  return planets[state.focus.index]
}

/** Returns the planet currently backing the hover card, or null. */
export function getCardPlanet(state: InteractionState, planets: Planet[]): Planet | null {
  if (state.activeCardIndex < 0 || state.activeCardIndex >= planets.length) return null
  return planets[state.activeCardIndex]
}

export interface FrameContext {
  now: number
  W: number
  H: number
  reducedMotion: boolean
}

/**
 * Runs one frame's worth of non-drawing scene logic: per-planet position
 * update (idle wander / focus zoom), hover hit-testing with
 * hysteresis+debounce, the unified mouse-or-keyboard active-info target,
 * card show/hide, hover-glow smoothing, and the keyboard focus ring DOM
 * position. Pure orchestration over `state`/`planets`/`dom` — no drawing.
 */
export function stepInteractionFrame(
  state: InteractionState,
  dom: PlanetSceneDom,
  planets: Planet[],
  ctx: FrameContext
): void {
  const { now, W, H, reducedMotion } = ctx
  const t = now / 1000
  const rawDtSec = Math.max(0, (now - state.lastNow) / 1000)
  const dtSec = Math.min(0.05, rawDtSec)
  state.lastNow = now

  const globalFocusActive = state.focus.mode !== 'idle'
  const ambientTarget = globalFocusActive ? 0.32 : 1
  state.ambientDim += (ambientTarget - state.ambientDim) * 0.1

  // ---- update positions / focus transition / spin ----
  for (let i = 0; i < planets.length; i++) {
    const p = planets[i]
    const isFocusPlanet = state.focus.index === i && globalFocusActive
    const isFrozenForInfo = i === state.activeInfoIndex && !globalFocusActive

    // Uses the already-smoothed `ambientDim` (eased toward the same 0.32/1
    // targets, see above) rather than a raw discrete 1-vs-0.32 step keyed
    // off `globalFocusActive`. The discrete version caused a real bug: the
    // frame `focus.mode` flips zooming-out -> idle, `globalFocusActive`
    // (recomputed once at the top of this function from the START-of-frame
    // mode) snaps from true to false, so `slow` jumped 0.32 -> 1 in a single
    // frame — every OTHER planet's wander position (homeX + sin(...)*amp*slow)
    // instantly snapped by up to ~0.68*amp px, which read as the whole scene
    // "re-rendering"/resetting on close (background click, Escape, and the
    // panel close button all hit this, since they all funnel through the
    // same closeFocus() state transition). Reusing ambientDim (already eased
    // 0.1/frame for the background nebula/dust alpha in render.ts) keeps the
    // amplitude continuous through that transition with zero perceptible snap.
    const slow = reducedMotion ? 0 : state.ambientDim

    let extraSpin = 0
    if (isFocusPlanet && !reducedMotion) {
      extraSpin = state.focus.mode === 'focused' ? 0.55 : 1.9
    }
    const spinIncrement = reducedMotion ? 0 : (p.spinSpeed + (p.spinSpeed >= 0 ? extraSpin : -extraSpin)) * dtSec
    p.spinAngle += spinIncrement
    if (p.hasClouds && !reducedMotion) {
      p.cloudSpin += (p.spinSpeed * 1.35 + (p.spinSpeed >= 0 ? extraSpin : -extraSpin)) * dtSec
    }

    if (!isFocusPlanet) {
      // fully freeze wander motion the instant a planet is confirmed
      // hovered/focused: hold "virtual time" constant by accumulating a
      // pause offset, so the position is exactly continuous going into AND
      // coming out of the freeze (no snap either direction).
      if (isFrozenForInfo) p.pausedTime += rawDtSec
      const idle = computeIdleXY(p, t - p.pausedTime, slow)
      p.drawX = idle.x
      p.drawY = idle.y
      p.drawR = p.baseR * p.scaleMul * (1 + p.hoverT * 0.18)
      const targetAlpha = globalFocusActive ? 0.14 : 1.0
      p.drawAlpha += (targetAlpha - p.drawAlpha) * 0.12
    } else {
      const elapsed = now - state.focus.t0
      const prog = Math.min(1, elapsed / state.focus.duration)
      if (state.focus.mode === 'zooming-in') {
        const eased = easeOutBack(prog)
        p.drawX = lerp(state.focus.startX, state.focus.targetX, eased)
        p.drawY = lerp(state.focus.startY, state.focus.targetY, eased)
        p.drawR = lerp(state.focus.startR, state.focus.targetR, eased)
        p.drawAlpha += (1 - p.drawAlpha) * 0.2
        if (prog >= 1) state.focus.mode = 'focused'
      } else if (state.focus.mode === 'focused') {
        const tgt2 = computeFocusTarget(W, H)
        state.focus.targetX = tgt2.x
        state.focus.targetY = tgt2.y
        state.focus.targetR = tgt2.r
        p.drawX = tgt2.x
        p.drawY = tgt2.y
        p.drawR = tgt2.r
        p.drawAlpha = 1
      } else if (state.focus.mode === 'zooming-out') {
        const eased2 = easeOutCubic(prog)
        // Reuses the SAME smoothed `slow` (= state.ambientDim, computed once
        // above for this planet) that the plain-idle branch below will use
        // on the very next frame once `mode` flips to 'idle'. This used to
        // hardcode `slow=1` (full amplitude) here, while globalFocusActive
        // stays true for the entire zooming-out animation, so ambientDim sits
        // near its dimmed 0.32 floor the whole time — meaning the very NEXT
        // frame after the mode flip (now idle, using ambientDim directly)
        // read a much smaller amplitude than this frame's liveIdle target
        // did, snapping the just-closed planet's wander offset by up to
        // ~0.6*amp px (~20px+ observed) exactly at the moment focus closes —
        // the same class of bug as the wander-amplitude fix below, but on
        // this planet's own zoom-out-to-idle handoff rather than the OTHER
        // planets' idle branch. Matching the value here keeps it continuous
        // across that handoff frame with zero perceptible snap.
        const liveIdle = computeIdleXY(p, t - p.pausedTime, slow)
        const liveR = p.baseR * p.scaleMul
        p.drawX = lerp(state.focus.startX, liveIdle.x, eased2)
        p.drawY = lerp(state.focus.startY, liveIdle.y, eased2)
        p.drawR = lerp(state.focus.startR, liveR, eased2)
        p.drawAlpha = 1
        if (prog >= 1) {
          state.focus.mode = 'idle'
          state.focus.index = -1
        }
      }
    }
  }

  // ---- hover detection (idle scene only) ----
  if (state.focus.mode === 'idle') {
    let nearest = -1
    let nearestDist = Infinity
    for (let h = 0; h < planets.length; h++) {
      const ph = planets[h]
      // hysteresis dead zone: the planet already committed as hovered gets
      // the larger "stay" radius, everything else uses the tighter "enter"
      // radius — prevents flicker right at the boundary
      const margin = h === state.mouseCommittedIndex ? HOVER_STAY_MARGIN : HOVER_ENTER_MARGIN
      const d2 = Math.sqrt(distSq(state.mouseX, state.mouseY, ph.drawX, ph.drawY))
      if (d2 < ph.drawR + margin && d2 < nearestDist) {
        nearestDist = d2
        nearest = h
      }
    }
    state.hoveredIndex = nearest

    // debounce: only commit a hover-target CHANGE after it holds stable for
    // HOVER_COMMIT_DELAY ms, so a brief pass-through near/between planets
    // doesn't flash the card open/close/open
    if (nearest !== state.pendingMouseIndex) {
      state.pendingMouseIndex = nearest
      state.pendingMouseSince = now
    }
    if (state.pendingMouseIndex !== state.mouseCommittedIndex && now - state.pendingMouseSince >= HOVER_COMMIT_DELAY) {
      state.mouseCommittedIndex = state.pendingMouseIndex
    }

    dom.glCanvas.style.cursor = state.hoveredIndex !== -1 ? 'pointer' : 'default'
  } else {
    state.hoveredIndex = -1
    state.mouseCommittedIndex = -1
    state.pendingMouseIndex = -1
    if (state.cardVisible) hideCard(state, dom)
    const fp2 = planets[state.focus.index]
    let overOther = false
    if (fp2) {
      const dcur = Math.sqrt(distSq(state.mouseX, state.mouseY, fp2.drawX, fp2.drawY))
      overOther = dcur > fp2.drawR
    }
    dom.glCanvas.style.cursor = overOther ? 'pointer' : 'default'
  }

  // unified mouse-or-keyboard info target — drives the card, the planet's
  // own hover reaction (glow/scale), and the wander freeze above, all off
  // the same committed signal so they stay in sync
  state.activeInfoIndex = getActiveInfoIndex(state)

  if (state.focus.mode === 'idle') {
    if (state.activeInfoIndex !== -1) {
      if (state.hideTimer) {
        clearTimeout(state.hideTimer)
        state.hideTimer = null
      }
      if (state.activeCardIndex !== state.activeInfoIndex) showCard(state, dom, planets, state.activeInfoIndex)
    } else if (state.activeCardIndex !== -1 && !state.cardHovered) {
      scheduleHide(state, dom)
    }
  }

  for (let g = 0; g < planets.length; g++) {
    const pg = planets[g]
    pg.hoverT += ((pg.idx === state.activeInfoIndex ? 1 : 0) - pg.hoverT) * HOVER_SMOOTH
  }

  // keyboard focus ring — DOM overlay tracking the focused planet's screen
  // position every frame (same anchor technique as the card)
  if (state.usingKeyboard && state.keyboardFocusIndex !== -1 && state.focus.mode === 'idle') {
    const kp = planets[state.keyboardFocusIndex]
    const ringSize = (kp.drawR + 14) * 2
    dom.kbdRing.style.width = `${ringSize.toFixed(1)}px`
    dom.kbdRing.style.height = `${ringSize.toFixed(1)}px`
    dom.kbdRing.style.marginLeft = `${(-ringSize / 2).toFixed(1)}px`
    dom.kbdRing.style.marginTop = `${(-ringSize / 2).toFixed(1)}px`
    dom.kbdRing.style.borderColor = rgba(kp.color, 0.95)
    dom.kbdRing.style.transform = `translate(${kp.drawX.toFixed(1)}px,${kp.drawY.toFixed(1)}px)`
    dom.kbdRing.classList.add('visible')
  } else {
    dom.kbdRing.classList.remove('visible')
  }

  // follow the active hover card's planet every frame (idle only) — the
  // planet is fully frozen once hover/focus commits, so this is now
  // tracking a static point, not a moving one
  if (state.activeCardIndex !== -1) {
    const ap = planets[state.activeCardIndex]
    dom.cardAnchor.style.transform = `translate(${ap.drawX.toFixed(1)}px,${ap.drawY.toFixed(1)}px)`
  }
}

/**
 * Registers every interaction event listener as a NAMED function reference
 * (required for removeEventListener to actually work in cleanup) and
 * returns a single cleanup function that removes all of them and clears
 * any pending timers.
 */
export function attachInteractionListeners(state: InteractionState, dom: PlanetSceneDom, planets: Planet[]): () => void {
  function handleMouseMove(e: MouseEvent) {
    state.mouseX = e.clientX
    state.mouseY = e.clientY
    // real mouse movement hands control back to the mouse and hides the
    // keyboard focus ring, so the two input modes do not fight visually
    if (state.usingKeyboard) {
      state.usingKeyboard = false
      state.keyboardFocusIndex = -1
    }
  }

  function handleMouseLeave() {
    state.mouseX = -9999
    state.mouseY = -9999
  }

  function handleTouchStart(e: TouchEvent) {
    const touch = e.touches && e.touches[0]
    if (touch) {
      state.mouseX = touch.clientX
      state.mouseY = touch.clientY
      if (state.usingKeyboard) {
        state.usingKeyboard = false
        state.keyboardFocusIndex = -1
      }
    }
  }

  // canvas needs to actually be focusable to receive key events; landing
  // focus on it (Tab, or a click) defaults keyboard nav to the first planet
  function handleCanvasFocus() {
    state.usingKeyboard = true
    if (state.keyboardFocusIndex === -1) state.keyboardFocusIndex = 0
  }

  function handleCardMouseEnter() {
    state.cardHovered = true
    if (state.hideTimer) {
      clearTimeout(state.hideTimer)
      state.hideTimer = null
    }
  }

  function handleCardMouseLeave() {
    state.cardHovered = false
    scheduleHide(state, dom)
  }

  function handleCanvasClick(e: MouseEvent) {
    const mx = e.clientX
    const my = e.clientY
    if (state.focus.mode === 'idle') {
      const idx = hitTestPlanet(planets, mx, my)
      if (idx !== -1) startFocus(state, dom, planets, idx)
    } else if (state.focus.mode === 'focused' || state.focus.mode === 'zooming-in') {
      const fp = planets[state.focus.index]
      const d = Math.sqrt(distSq(mx, my, fp.drawX, fp.drawY))
      if (d > fp.drawR) closeFocus(state, dom, planets)
    }
  }

  function handleCloseClick(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    closeFocus(state, dom, planets)
  }

  function handleKeyDown(e: KeyboardEvent) {
    const activeEl = document.activeElement
    const inPanelControl = activeEl === dom.closeBtn || activeEl === dom.fpLink

    if (e.key === 'Escape') {
      if (state.focus.mode === 'focused' || state.focus.mode === 'zooming-in') {
        const wasIdx = state.focus.index
        closeFocus(state, dom, planets)
        state.keyboardFocusIndex = wasIdx
        state.usingKeyboard = true
        dom.glCanvas.focus()
      }
      return
    }

    if (inPanelControl) return // let Tab/Enter/Space reach the panel's own controls natively
    if (state.focus.mode !== 'idle') return // no planet-cycling while a panel is open

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      state.usingKeyboard = true
      state.keyboardFocusIndex = state.keyboardFocusIndex === -1 ? 0 : (state.keyboardFocusIndex + 1) % planets.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      state.usingKeyboard = true
      state.keyboardFocusIndex =
        state.keyboardFocusIndex === -1 ? planets.length - 1 : (state.keyboardFocusIndex - 1 + planets.length) % planets.length
    } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      if (state.usingKeyboard && state.keyboardFocusIndex !== -1) {
        e.preventDefault()
        startFocus(state, dom, planets, state.keyboardFocusIndex)
      }
    }
  }

  dom.glCanvas.addEventListener('mousemove', handleMouseMove)
  dom.glCanvas.addEventListener('mouseleave', handleMouseLeave)
  dom.glCanvas.addEventListener('touchstart', handleTouchStart, { passive: true })
  dom.glCanvas.addEventListener('focus', handleCanvasFocus)
  dom.glCanvas.addEventListener('click', handleCanvasClick)
  dom.card.addEventListener('mouseenter', handleCardMouseEnter)
  dom.card.addEventListener('mouseleave', handleCardMouseLeave)
  dom.closeBtn.addEventListener('click', handleCloseClick)
  document.addEventListener('keydown', handleKeyDown)

  return function cleanupInteractionListeners() {
    dom.glCanvas.removeEventListener('mousemove', handleMouseMove)
    dom.glCanvas.removeEventListener('mouseleave', handleMouseLeave)
    dom.glCanvas.removeEventListener('touchstart', handleTouchStart)
    dom.glCanvas.removeEventListener('focus', handleCanvasFocus)
    dom.glCanvas.removeEventListener('click', handleCanvasClick)
    dom.card.removeEventListener('mouseenter', handleCardMouseEnter)
    dom.card.removeEventListener('mouseleave', handleCardMouseLeave)
    dom.closeBtn.removeEventListener('click', handleCloseClick)
    document.removeEventListener('keydown', handleKeyDown)

    if (state.hideTimer) clearTimeout(state.hideTimer)
    if (state.cardTypeTimer) clearInterval(state.cardTypeTimer)
    clearPanelTimers(state)
  }
}
