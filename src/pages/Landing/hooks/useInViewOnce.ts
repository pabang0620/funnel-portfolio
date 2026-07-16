import { useEffect, useRef, useState } from 'react'

const THRESHOLD = 0.2
const ROOT_MARGIN = '0px 0px -8% 0px'

/**
 * Fires once when the observed element first enters the viewport,
 * then stops observing (matches the mockup's "fly-in-once" behavior).
 * Falls back to `true` immediately if IntersectionObserver is unsupported.
 */
export function useInViewOnce<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  // Fall back to `true` immediately if IntersectionObserver is unsupported
  // (computed in the initializer, not via a setState call inside an effect).
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: THRESHOLD, rootMargin: ROOT_MARGIN }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, inView }
}
