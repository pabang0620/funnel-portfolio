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
 * Static markup for the click-focus cascading panel - tag/title text and
 * the show/hide cascade classes are mutated directly via refs by the
 * interaction hook; the description container's children are rebuilt as
 * one div per actually-wrapped visual line so each line can cascade in on
 * its own (see interaction.ts's renderTextAsLines/schedulePanelReveal).
 * The close button itself is wired up by the interaction
 * hook's own addEventListener (via closeBtnRef), not a React onClick - only
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
    <div id="focus-panel" ref={panelRef} role="dialog" aria-modal="true" aria-label="Project details">
      <button id="focus-close" aria-label="Close" ref={closeBtnRef}>
        ✕
      </button>
      <div className="fp-line fp-tag" ref={fpTagRef} />
      <div className="fp-line fp-title" ref={fpTitleRef} />
      {/* Children are rebuilt imperatively (one div per actually-wrapped
          visual line) by interaction.ts's fillPanel/renderTextAsLines -
          this container itself no longer carries fp-line (it's just a
          layout wrapper now; each child line owns its own cascade reveal). */}
      <div className="fp-desc" ref={fpDescRef} />
      <a href="#" className="fp-line fp-link" ref={fpLinkRef} onClick={handleLinkClick}>
        Open project <span className="fp-arrow">→</span>
      </a>
    </div>
  )
}
