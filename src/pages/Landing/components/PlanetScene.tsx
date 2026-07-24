import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { PROJECTS } from '@/data/projects'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { usePlanetScene } from '../hooks/usePlanetScene'
import PlanetCard from './PlanetCard'
import FocusPanel from './FocusPanel'
import ContactCorner from './ContactCorner'
import IntroPanel from './IntroPanel'

export default function PlanetScene() {
  const reducedMotion = usePrefersReducedMotion()

  const glCanvasRef = useRef<HTMLCanvasElement>(null)
  const planetCanvasRef = useRef<HTMLCanvasElement>(null)
  const cardAnchorRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const cardFamilyRef = useRef<HTMLDivElement>(null)
  const cardTitleRef = useRef<HTMLHeadingElement>(null)
  const cardDescRef = useRef<HTMLParagraphElement>(null)
  const sceneHeadingRef = useRef<HTMLDivElement>(null)
  const kbdRingRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const fpTagRef = useRef<HTMLDivElement>(null)
  const fpTitleRef = useRef<HTMLDivElement>(null)
  const fpDescRef = useRef<HTMLDivElement>(null)
  const fpLinkRef = useRef<HTMLAnchorElement>(null)

  const { webglSupported, getFocusedPlanet, getCardPlanet } = usePlanetScene(
    {
      glCanvasRef,
      planetCanvasRef,
      cardAnchorRef,
      cardRef,
      cardFamilyRef,
      cardTitleRef,
      cardDescRef,
      sceneHeadingRef,
      kbdRingRef,
      panelRef,
      closeBtnRef,
      fpTagRef,
      fpTitleRef,
      fpDescRef,
      fpLinkRef,
    },
    reducedMotion
  )

  return (
    <div className="planet-scene">
      <canvas id="planet-canvas" ref={planetCanvasRef} aria-hidden="true" />

      {webglSupported ? (
        <canvas
          id="gl-canvas"
          ref={glCanvasRef}
          tabIndex={0}
          aria-label="Project planet scene — use arrow keys to browse, Enter to open"
        />
      ) : (
        // Graceful fallback if WebGL is unavailable on this device/browser —
        // a plain, fully navigable project list instead of a blank scene.
        <nav className="planet-scene-fallback" aria-label="Project list">
          <ul>
            {PROJECTS.map((project) => (
              <li key={project.key}>
                <Link to={project.path}>{project.name}</Link>
                <p>{project.description}</p>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div id="kbd-focus-ring" ref={kbdRingRef} aria-hidden="true" />

      <div className="scene-heading" ref={sceneHeadingRef}>
        <div className="eyebrow">Portfolio · 2026</div>
        <p className="scene-sub">Hover a planet, or use the keyboard to navigate.</p>
      </div>

      <PlanetCard
        cardAnchorRef={cardAnchorRef}
        cardRef={cardRef}
        cardFamilyRef={cardFamilyRef}
        cardTitleRef={cardTitleRef}
        cardDescRef={cardDescRef}
        getCardPlanet={getCardPlanet}
      />

      <FocusPanel
        panelRef={panelRef}
        closeBtnRef={closeBtnRef}
        fpTagRef={fpTagRef}
        fpTitleRef={fpTitleRef}
        fpDescRef={fpDescRef}
        fpLinkRef={fpLinkRef}
        getFocusedPlanet={getFocusedPlanet}
      />

      <ContactCorner />

      <IntroPanel />

      <p className="texture-credit">Planet textures © Solar System Scope (CC BY 4.0)</p>
    </div>
  )
}
