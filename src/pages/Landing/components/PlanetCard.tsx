import type { MouseEvent, RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Planet } from '../webgl/sceneState'

interface PlanetCardProps {
  cardAnchorRef: RefObject<HTMLDivElement | null>
  cardRef: RefObject<HTMLDivElement | null>
  cardFamilyRef: RefObject<HTMLDivElement | null>
  cardTitleRef: RefObject<HTMLHeadingElement | null>
  cardDescRef: RefObject<HTMLParagraphElement | null>
  getCardPlanet: () => Planet | null
}

/**
 * Static markup only for the hover hologram card - its text content,
 * accent color, direction offsets and visible/hiding classes are mutated
 * directly via refs by the interaction hook (usePlanetScene), never
 * through React state, so a fast-moving mouse never triggers a 60fps-class
 * re-render cascade.
 */
export default function PlanetCard({
  cardAnchorRef,
  cardRef,
  cardFamilyRef,
  cardTitleRef,
  cardDescRef,
  getCardPlanet,
}: PlanetCardProps) {
  const navigate = useNavigate()

  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const planet = getCardPlanet()
    if (planet) navigate(planet.path)
  }

  return (
    <div id="planet-card-anchor" ref={cardAnchorRef}>
      <div id="planet-card" className="planet-card" ref={cardRef}>
        <svg className="pc-frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <rect className="pc-frame-rect" x={0.5} y={0.5} width={99} height={99} pathLength={100} />
        </svg>
        <span className="pc-corner pc-tl" aria-hidden="true" />
        <span className="pc-corner pc-tr" aria-hidden="true" />
        <span className="pc-corner pc-bl" aria-hidden="true" />
        <span className="pc-corner pc-br" aria-hidden="true" />
        <div className="planet-card-body">
          <div className="planet-card-family" ref={cardFamilyRef} />
          <h3 ref={cardTitleRef} />
          <p ref={cardDescRef} />
          <a href="#" className="planet-card-link" onClick={handleLinkClick}>
            View details <span>↗</span>
          </a>
        </div>
      </div>
    </div>
  )
}
