import type { MouseEvent, RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Planet } from '../webgl/sceneState'

interface FocusPanelProps {
  panelRef: RefObject<HTMLDivElement | null>
  closeBtnRef: RefObject<HTMLButtonElement | null>
  fpTagRef: RefObject<HTMLDivElement | null>
  fpTitleRef: RefObject<HTMLDivElement | null>
  fpDescRef: RefObject<HTMLDivElement | null>
  fpLinkRef: RefObject<HTMLAnchorElement | null>
  getFocusedPlanet: () => Planet | null
}

/**
 * Static markup for the click-focus cascading panel — tag/title/desc text
 * and the show/hide cascade classes are mutated directly via refs by the
 * interaction hook. The close button itself is wired up by the interaction
 * hook's own addEventListener (via closeBtnRef), not a React onClick — only
 * the CTA link's real-route navigation lives here, since that's the one
 * piece of genuine app behavior (routing) that belongs in React, not the
 * imperative DOM layer.
 */
export default function FocusPanel({
  panelRef,
  closeBtnRef,
  fpTagRef,
  fpTitleRef,
  fpDescRef,
  fpLinkRef,
  getFocusedPlanet,
}: FocusPanelProps) {
  const navigate = useNavigate()

  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const planet = getFocusedPlanet()
    if (planet) navigate(planet.path)
  }

  return (
    <div id="focus-panel" ref={panelRef} role="dialog" aria-modal="true" aria-label="프로젝트 상세">
      <button id="focus-close" aria-label="닫기" ref={closeBtnRef}>
        ✕
      </button>
      <div className="fp-line fp-tag" ref={fpTagRef} />
      <div className="fp-line fp-title" ref={fpTitleRef} />
      <div className="fp-line fp-desc" ref={fpDescRef} />
      <a href="#" className="fp-line fp-link" ref={fpLinkRef} onClick={handleLinkClick}>
        프로젝트 보기 <span className="fp-arrow">→</span>
      </a>
    </div>
  )
}
