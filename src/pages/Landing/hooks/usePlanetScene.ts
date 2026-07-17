import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { buildPlanetSceneEntries } from '@/data/planetScene'
import {
  createPlanets,
  createDust,
  createNebulae,
  applyResize,
  type Planet,
} from '../webgl/sceneState'
import {
  createInteractionState,
  attachInteractionListeners,
  getFocusedPlanet as getFocusedPlanetFromState,
  getCardPlanet as getCardPlanetFromState,
  type InteractionState,
  type PlanetSceneDom,
} from '../webgl/interaction'
import { createTextureRegistry, disposeTextureRegistry } from '../webgl/textures'
import { createGLProgram, disposeGLProgram } from '../webgl/glProgram'
import { resizeGLCanvas, renderSceneFrame } from '../webgl/render'

export interface PlanetSceneRefs {
  glCanvasRef: RefObject<HTMLCanvasElement | null>
  planetCanvasRef: RefObject<HTMLCanvasElement | null>
  cardAnchorRef: RefObject<HTMLDivElement | null>
  cardRef: RefObject<HTMLDivElement | null>
  cardFamilyRef: RefObject<HTMLDivElement | null>
  cardTitleRef: RefObject<HTMLHeadingElement | null>
  cardDescRef: RefObject<HTMLParagraphElement | null>
  sceneHeadingRef: RefObject<HTMLDivElement | null>
  kbdRingRef: RefObject<HTMLDivElement | null>
  panelRef: RefObject<HTMLDivElement | null>
  closeBtnRef: RefObject<HTMLButtonElement | null>
  fpTagRef: RefObject<HTMLDivElement | null>
  fpTitleRef: RefObject<HTMLDivElement | null>
  fpDescRef: RefObject<HTMLDivElement | null>
  fpLinkRef: RefObject<HTMLAnchorElement | null>
}

export interface UsePlanetSceneResult {
  webglSupported: boolean
  /** Fresh-per-mount planet list, or [] before the scene has initialized. */
  getPlanets: () => Planet[]
  getFocusedPlanet: () => Planet | null
  getCardPlanet: () => Planet | null
}

interface SceneHandle {
  planets: Planet[]
  state: InteractionState
}

/**
 * React glue for the WebGL planet scene. Every piece of mutable
 * WebGL/scene state (textures, GL program/buffers, planets array,
 * dust/nebulae, interaction state) is created FRESH inside this effect's
 * closure on every mount — nothing lives as a module-level singleton, so
 * repeated navigation to/from the Landing page never leaks a WebGL context
 * or carries over stale state.
 */
export function usePlanetScene(refs: PlanetSceneRefs, reducedMotion: boolean): UsePlanetSceneResult {
  const [webglSupported, setWebglSupported] = useState(true)
  const sceneHandleRef = useRef<SceneHandle | null>(null)

  useEffect(() => {
    const glCanvas = refs.glCanvasRef.current
    const planetCanvas = refs.planetCanvasRef.current
    // Rule: null-check both canvas refs, early-return if either missing.
    if (!glCanvas || !planetCanvas) return

    const cardAnchor = refs.cardAnchorRef.current
    const card = refs.cardRef.current
    const cardFamily = refs.cardFamilyRef.current
    const cardTitle = refs.cardTitleRef.current
    const cardDesc = refs.cardDescRef.current
    const sceneHeading = refs.sceneHeadingRef.current
    const kbdRing = refs.kbdRingRef.current
    const panel = refs.panelRef.current
    const closeBtn = refs.closeBtnRef.current
    const fpTag = refs.fpTagRef.current
    const fpTitle = refs.fpTitleRef.current
    const fpDesc = refs.fpDescRef.current
    const fpLink = refs.fpLinkRef.current

    if (
      !cardAnchor ||
      !card ||
      !cardFamily ||
      !cardTitle ||
      !cardDesc ||
      !sceneHeading ||
      !kbdRing ||
      !panel ||
      !closeBtn ||
      !fpTag ||
      !fpTitle ||
      !fpDesc ||
      !fpLink
    ) {
      return
    }

    const pCtx = planetCanvas.getContext('2d')
    const gl = (glCanvas.getContext('webgl2') ||
      glCanvas.getContext('webgl') ||
      glCanvas.getContext('experimental-webgl')) as WebGLRenderingContext | null

    // Rule: get WebGL context (webgl2 then webgl fallback); if both fail,
    // early-return after signalling the graceful text-only fallback —
    // PlanetScene.tsx renders a plain project link list when !webglSupported.
    if (!pCtx || !gl) {
      setWebglSupported(false)
      return
    }

    let disposed = false
    const getDisposed = () => disposed

    const dom: PlanetSceneDom = {
      cardAnchor,
      card,
      cardFamily,
      cardTitle,
      cardDesc,
      sceneHeading,
      kbdRing,
      glCanvas,
      panel,
      closeBtn,
      fpTag,
      fpTitle,
      fpDesc,
      fpLink,
    }

    // ---- build ALL mutable scene state as LOCAL variables (factories) ----
    const entries = buildPlanetSceneEntries()
    const planets = createPlanets(entries)
    const dust = createDust()
    const nebulae = createNebulae()
    const interactionState = createInteractionState()
    const textures = createTextureRegistry(gl, getDisposed)
    const handles = createGLProgram(gl)

    if (!handles) {
      disposed = true
      disposeTextureRegistry(gl, textures)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      setWebglSupported(false)
      return
    }

    sceneHandleRef.current = { planets, state: interactionState }
    setWebglSupported(true)

    const glDPR = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0
    let H = 0

    function resize() {
      W = window.innerWidth
      H = window.innerHeight
      planetCanvas!.width = W
      planetCanvas!.height = H
      applyResize(planets, W, H)
      resizeGLCanvas(gl!, glCanvas!, glDPR, W, H)
    }

    resize()
    window.addEventListener('resize', resize)

    const detachInteraction = attachInteractionListeners(interactionState, dom, planets)

    let frameId = 0
    function loop(now: number) {
      renderSceneFrame(
        {
          gl: gl!,
          glCanvas: glCanvas!,
          glDPR,
          handles: handles!,
          textures,
          pCtx: pCtx!,
          planets,
          dust,
          nebulae,
          interactionState,
          dom,
        },
        { now, W, H, reducedMotion },
        W,
        H
      )
      frameId = requestAnimationFrame(loop)
    }
    frameId = requestAnimationFrame(loop)

    return () => {
      disposed = true
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      detachInteraction()
      disposeGLProgram(gl, handles)
      disposeTextureRegistry(gl, textures)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      sceneHandleRef.current = null
    }
    // `refs` is a stable ref-bag object (its individual fields are React
    // refs, guaranteed stable across renders) — only `reducedMotion`
    // meaningfully changes and should retrigger scene (re)initialization.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion])

  const getPlanets = useCallback((): Planet[] => sceneHandleRef.current?.planets ?? [], [])

  const getFocusedPlanet = useCallback((): Planet | null => {
    const scene = sceneHandleRef.current
    if (!scene) return null
    return getFocusedPlanetFromState(scene.state, scene.planets)
  }, [])

  const getCardPlanet = useCallback((): Planet | null => {
    const scene = sceneHandleRef.current
    if (!scene) return null
    return getCardPlanetFromState(scene.state, scene.planets)
  }, [])

  return { webglSupported, getPlanets, getFocusedPlanet, getCardPlanet }
}
