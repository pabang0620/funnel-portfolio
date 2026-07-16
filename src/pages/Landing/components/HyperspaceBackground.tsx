import { useHyperspaceCanvas } from '../hooks/useHyperspaceCanvas'

export default function HyperspaceBackground() {
  const { canvasRef, progressBarRef } = useHyperspaceCanvas()

  return (
    <>
      <canvas id="warp-canvas" ref={canvasRef} aria-hidden="true" />
      <div id="vignette" aria-hidden="true" />
      <div id="scroll-progress-track">
        <div id="scroll-progress-bar" ref={progressBarRef} />
      </div>
    </>
  )
}
