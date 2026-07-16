import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const POINT_COUNT = 260
const FOV = 320
const MAX_Z = 1400
const BASE_SPEED = 5.2
const TRAIL_FADE_ALPHA = 0.28
const SCROLL_VELOCITY_SMOOTHING = 0.1
const SCROLL_VELOCITY_BOOST_FACTOR = 0.9
const MAX_SCROLL_BOOST = 40
const STATIC_BG_COLOR = 'rgba(5, 3, 10, 1)'

const COLOR_A: [number, number, number] = [0, 234, 255] // electric blue / cyan
const COLOR_B: [number, number, number] = [176, 38, 255] // violet / magenta

interface WarpPoint {
  x: number
  y: number
  z: number
  px: number
  py: number
  color: [number, number, number]
}

/**
 * Drives the fixed full-screen canvas warp-field background and the
 * scroll-progress bar. Updates the canvas and progress bar via direct
 * ref/DOM manipulation only (never React state) to avoid 60fps re-renders.
 */
export function useHyperspaceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const progressBarRef = useRef<HTMLDivElement | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let centerX = 0
    let centerY = 0

    const project = (p: WarpPoint): [number, number] => {
      const x = centerX + (p.x / p.z) * FOV
      const y = centerY + (p.y / p.z) * FOV
      return [x, y]
    }

    const resetPoint = (p: WarpPoint, initial: boolean) => {
      p.x = (Math.random() - 0.5) * width * 1.8
      p.y = (Math.random() - 0.5) * height * 1.8
      p.z = initial ? Math.random() * MAX_Z + 1 : MAX_Z
      p.color = Math.random() < 0.5 ? COLOR_A : COLOR_B
      const [px, py] = project(p)
      p.px = px
      p.py = py
    }

    const points: WarpPoint[] = []
    for (let i = 0; i < POINT_COUNT; i++) {
      const p: WarpPoint = { x: 0, y: 0, z: 1, px: 0, py: 0, color: COLOR_A }
      points.push(p)
    }

    const resize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      centerX = width / 2
      centerY = height / 2
    }

    resize()
    points.forEach((p) => resetPoint(p, true))
    window.addEventListener('resize', resize)

    if (prefersReducedMotion) {
      // Paint a single static frame instead of starting the animation loop.
      ctx.fillStyle = STATIC_BG_COLOR
      ctx.fillRect(0, 0, width, height)
      return () => {
        window.removeEventListener('resize', resize)
      }
    }

    let lastScrollY = window.scrollY || 0
    let scrollVelocity = 0

    const updateScrollProgress = (): number => {
      const doc = document.documentElement
      const scrollTop = window.scrollY || doc.scrollTop || 0
      const scrollable = doc.scrollHeight - window.innerHeight
      const pct = scrollable > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollable) * 100)) : 0
      const bar = progressBarRef.current
      if (bar) bar.style.width = `${pct}%`
      return scrollTop
    }

    let frameId = 0
    const loop = () => {
      const currentScrollY = updateScrollProgress()
      const delta = Math.abs(currentScrollY - lastScrollY)
      lastScrollY = currentScrollY
      // smooth the velocity so speed changes feel fluid, not jumpy
      scrollVelocity = scrollVelocity * (1 - SCROLL_VELOCITY_SMOOTHING) + delta * SCROLL_VELOCITY_SMOOTHING
      const boost = Math.min(scrollVelocity * SCROLL_VELOCITY_BOOST_FACTOR, MAX_SCROLL_BOOST)
      const speed = BASE_SPEED + boost

      // trail-fade instead of hard clear -> motion blur / glow trail
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = `rgba(5, 3, 10, ${TRAIL_FADE_ALPHA})`
      ctx.fillRect(0, 0, width, height)

      // additive blend for bright overlapping streaks
      ctx.globalCompositeOperation = 'lighter'

      for (let i = 0; i < points.length; i++) {
        const p = points[i]

        p.z -= speed
        if (p.z <= 1) {
          resetPoint(p, false)
          continue // skip drawing a streak on the reset frame
        }

        const [nx, ny] = project(p)

        // depth-based intensity: closer points are brighter & thicker
        const depthT = 1 - Math.min(p.z / MAX_Z, 1) // 0 far -> 1 near
        const alpha = 0.15 + depthT * 0.85
        const lineWidth = 0.6 + depthT * 2.6

        ctx.strokeStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${alpha.toFixed(3)})`
        ctx.lineWidth = lineWidth
        ctx.beginPath()
        ctx.moveTo(p.px, p.py)
        ctx.lineTo(nx, ny)
        ctx.stroke()

        p.px = nx
        p.py = ny
      }

      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
    }
  }, [prefersReducedMotion])

  return { canvasRef, progressBarRef }
}
