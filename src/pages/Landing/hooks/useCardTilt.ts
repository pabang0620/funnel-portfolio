import { useEffect, useRef } from 'react'

// Plain exponential smoothing (no velocity/spring term):
// current += (target - current) * SMOOTHING
const SMOOTHING = 0.15
// multiplier on normalized cursor offset -> roughly ±14deg max rotation
const MAX_ROTATE_MULTIPLIER = 28
const HOVER_TRANSLATE_Z = 20

interface TiltState {
  current: { rx: number; ry: number; tz: number }
  target: { rx: number; ry: number; tz: number }
}

/**
 * 3D tilt-on-hover effect.
 *
 * IMPORTANT: the mousemove/mouseleave listeners are bound to the OUTER
 * wrapper (`wrapperRef`) — the element that only carries the small idle
 * "drift" animation — NOT to the inner element that receives the large
 * rotation transform (`innerRef`). Binding to the rotating element itself
 * causes a dead-zone bug: as the tilt animates toward a large target angle,
 * the rotated hit-box swings out from under a stationary cursor, firing a
 * spurious mouseleave that resets the tilt with no further mousemove to
 * recover it. The wrapper's hit-box stays visually stable under the cursor
 * regardless of how hard the inner card tilts, so it is the correct event
 * target.
 */
export function useCardTilt<
  TWrapper extends HTMLElement,
  TInner extends HTMLElement,
>() {
  const wrapperRef = useRef<TWrapper | null>(null)
  const innerRef = useRef<TInner | null>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const inner = innerRef.current
    if (!wrapper || !inner) return

    const tilt: TiltState = {
      current: { rx: 0, ry: 0, tz: 0 },
      target: { rx: 0, ry: 0, tz: 0 },
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect()
      const relX = (e.clientX - rect.left) / rect.width
      const relY = (e.clientY - rect.top) / rect.height
      tilt.target.ry = (relX - 0.5) * MAX_ROTATE_MULTIPLIER
      tilt.target.rx = (0.5 - relY) * MAX_ROTATE_MULTIPLIER
      tilt.target.tz = HOVER_TRANSLATE_Z
      inner.classList.add('hovering')
    }

    const handleMouseLeave = () => {
      tilt.target.rx = 0
      tilt.target.ry = 0
      tilt.target.tz = 0
      inner.classList.remove('hovering')
    }

    wrapper.addEventListener('mousemove', handleMouseMove)
    wrapper.addEventListener('mouseleave', handleMouseLeave)

    let frameId = 0
    const tick = () => {
      tilt.current.rx += (tilt.target.rx - tilt.current.rx) * SMOOTHING
      tilt.current.ry += (tilt.target.ry - tilt.current.ry) * SMOOTHING
      tilt.current.tz += (tilt.target.tz - tilt.current.tz) * SMOOTHING

      inner.style.transform =
        `perspective(700px) rotateX(${tilt.current.rx.toFixed(2)}deg) ` +
        `rotateY(${tilt.current.ry.toFixed(2)}deg) translateZ(${tilt.current.tz.toFixed(1)}px)`

      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)

    return () => {
      wrapper.removeEventListener('mousemove', handleMouseMove)
      wrapper.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(frameId)
    }
  }, [])

  return { wrapperRef, innerRef }
}
