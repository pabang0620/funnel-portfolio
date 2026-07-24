import { useHyperspaceCanvas } from '../hooks/useHyperspaceCanvas'

export default function HyperspaceBackground() {
  // NOTE: the page is now a fixed, non-scrolling single viewport (approved
  // final direction - see Landing plan), so the scroll-progress bar the
  // hook can optionally drive would just sit frozen at 0% forever. The
  // hook itself is kept fully unchanged (its scroll-velocity-based warp
  // speed boost is harmless inert logic without a scrollable document);
  // only the visible progress-bar DOM element is intentionally not
  // rendered here (its ref is simply never wired to a DOM node).
  const { canvasRef } = useHyperspaceCanvas()

  return (
    <>
      <canvas id="warp-canvas" ref={canvasRef} aria-hidden="true" />
      <div id="vignette" aria-hidden="true" />
    </>
  )
}
