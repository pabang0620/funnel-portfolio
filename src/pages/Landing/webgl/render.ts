import { mat3Mul, mat3RotX, mat3RotY, rgba } from './geometry'
import type { GLProgramHandles } from './glProgram'
import type { TextureKey, TextureRegistry } from './textures'
import type { DustParticle, Nebula, Planet } from './sceneState'
import { stepInteractionFrame, type FrameContext, type InteractionState, type PlanetSceneDom } from './interaction'

// NOTE: no drawGlow() here - the per-planet background color-glow-halo was
// explicitly removed per client feedback ("행성 뒤에 은은하게 있는 색상 빼줘").
// Only the WebGL sphere shader's own rim/fresnel edge-lighting remains.

export function resizeGLCanvas(gl: WebGLRenderingContext, glCanvas: HTMLCanvasElement, glDPR: number, W: number, H: number): void {
  glCanvas.width = Math.max(1, Math.round(W * glDPR))
  glCanvas.height = Math.max(1, Math.round(H * glDPR))
  gl.viewport(0, 0, glCanvas.width, glCanvas.height)
}

export function drawNebulae(pCtx: CanvasRenderingContext2D, nebulae: Nebula[], W: number, H: number, ambientDim: number): void {
  for (let i = 0; i < nebulae.length; i++) {
    const n = nebulae[i]
    const cx = n.fx * W
    const cy = n.fy * H
    const g = pCtx.createRadialGradient(cx, cy, 0, cx, cy, n.r)
    g.addColorStop(0, rgba(n.color, n.alpha * ambientDim))
    g.addColorStop(1, rgba(n.color, 0))
    pCtx.fillStyle = g
    pCtx.beginPath()
    pCtx.arc(cx, cy, n.r, 0, Math.PI * 2)
    pCtx.fill()
  }
}

/**
 * `reducedMotion` freezes the twinkle phase (no continuous time-based
 * pulsing) while still rendering each dust mote at its own static phase
 * brightness - decorative motion is removed, the dust itself is not hidden.
 */
export function drawDust(
  pCtx: CanvasRenderingContext2D,
  dust: DustParticle[],
  W: number,
  H: number,
  now: number,
  ambientDim: number,
  reducedMotion: boolean
): void {
  const t = reducedMotion ? 0 : now / 1000
  pCtx.fillStyle = '#ffffff'
  for (let i = 0; i < dust.length; i++) {
    const d = dust[i]
    const alpha = (0.12 + 0.3 * (0.5 + 0.5 * Math.sin(t * d.speed + d.phase))) * ambientDim
    pCtx.globalAlpha = alpha
    pCtx.beginPath()
    pCtx.arc(d.fx * W, d.fy * H, d.r, 0, Math.PI * 2)
    pCtx.fill()
  }
  pCtx.globalAlpha = 1
}

function bindAttribBuffer(gl: WebGLRenderingContext, buffer: WebGLBuffer, location: number, size: number) {
  if (location === -1) return
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.enableVertexAttribArray(location)
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0)
}

export function drawPlanetsGL(
  gl: WebGLRenderingContext,
  glCanvas: HTMLCanvasElement,
  glDPR: number,
  handles: GLProgramHandles,
  textures: TextureRegistry,
  planets: Planet[],
  focusIndex: number = -1
): void {
  gl.viewport(0, 0, glCanvas.width, glCanvas.height)
  gl.clear(gl.COLOR_BUFFER_BIT)

  // Draw order determines who paints over whom: each planet clears its OWN
  // depth buffer just below (see gl.clear(gl.DEPTH_BUFFER_BIT) inside the
  // loop), so the depth test never persists across different planets - it
  // only resolves self-occlusion within a single planet's own sphere+cloud
  // geometry. Cross-planet "occlusion" is therefore purely whichever planet
  // is painted LAST into the color buffer for a given pixel, since the
  // opaque sphere pass draws with blending disabled (a later draw fully
  // overwrites an earlier one wherever they overlap on screen).
  //
  // During focus, the enlarged focused planet must always appear in front
  // of the other 9 dimmed/defocused planets, even if one of them is
  // mid-drift through the same screen region. Fixed array-index draw order
  // cannot guarantee that (a higher-index background planet drawn after the
  // focused one would paint over it), so when a planet is focused it's
  // moved to the end of the draw order for this frame.
  const order: number[] = []
  for (let i = 0; i < planets.length; i++) {
    if (i !== focusIndex) order.push(i)
  }
  if (focusIndex >= 0 && focusIndex < planets.length) order.push(focusIndex)

  for (let oi = 0; oi < order.length; oi++) {
    const p = planets[order[oi]]
    if (p.drawAlpha <= 0.004) continue
    const rot = mat3Mul(mat3RotX(p.tilt), mat3RotY(p.spinAngle))

    // shared depth pass per-planet: sphere + cloud shell occlude each other
    // correctly, but planets never depth-test against one another (they're
    // independently placed in 2D screen space)
    gl.clear(gl.DEPTH_BUFFER_BIT)

    // ---- sphere body ----
    // defensively force the correct opaque blend state immediately before
    // every opaque draw call, rather than relying on "nothing re-enabled it
    // since it was left off earlier" (see the BLEND note in glProgram.ts).
    gl.disable(gl.BLEND)
    gl.useProgram(handles.program)
    bindAttribBuffer(gl, handles.posBuffer, handles.attribs.aPosition, 3)
    bindAttribBuffer(gl, handles.normalBuffer, handles.attribs.aNormal, 3)
    bindAttribBuffer(gl, handles.uvBuffer, handles.attribs.aUV, 2)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, handles.indexBuffer)

    const u = handles.uniforms
    gl.uniform2f(u.uResolution, glCanvas.width, glCanvas.height)
    gl.uniform1f(u.uCamDist, 3.0)
    gl.uniform1f(u.uFocal, 3.0)
    gl.uniformMatrix3fv(u.uRotation, false, rot)
    gl.uniform2f(u.uCenterPx, p.drawX * glDPR, p.drawY * glDPR)
    gl.uniform1f(u.uRadiusPx, p.drawR * glDPR)
    gl.uniform3f(u.uBaseColor, p.bodyColor[0] / 255, p.bodyColor[1] / 255, p.bodyColor[2] / 255)
    gl.uniform3f(u.uBaseColor2, p.bodyColor2[0] / 255, p.bodyColor2[1] / 255, p.bodyColor2[2] / 255)
    gl.uniform3f(u.uRimColor, p.color[0] / 255, p.color[1] / 255, p.color[2] / 255)
    gl.uniform1f(u.uAlpha, p.drawAlpha)
    gl.uniform1f(u.uSurfaceType, p.surfaceType)
    gl.uniform1f(u.uPatternSeed, p.patternSeed)

    const dayTex = p.texKey ? textures[p.texKey as TextureKey] : null
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, dayTex || textures.earthDay)
    gl.uniform1i(u.uDayMap, 0)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, textures.earthSpecular)
    gl.uniform1i(u.uSpecMap, 1)
    gl.uniform1f(u.uHasPhoto, dayTex ? 1.0 : 0.0)
    gl.uniform1f(u.uHasSpec, p.hasSpec ? 1.0 : 0.0)

    gl.drawElements(gl.TRIANGLES, handles.sphereIndexCount, gl.UNSIGNED_SHORT, 0)

    // ---- cloud shell (Earth archetype only) ----
    if (p.hasClouds && handles.cloudProgram) {
      const cloudRot = mat3Mul(mat3RotX(p.tilt), mat3RotY(p.cloudSpin))
      gl.useProgram(handles.cloudProgram)
      bindAttribBuffer(gl, handles.posBuffer, handles.cloudAttribs.aPosition, 3)
      bindAttribBuffer(gl, handles.normalBuffer, handles.cloudAttribs.aNormal, 3)
      bindAttribBuffer(gl, handles.uvBuffer, handles.cloudAttribs.aUV, 2)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, handles.indexBuffer)

      const cu = handles.cloudUniforms
      gl.uniform2f(cu.uResolution, glCanvas.width, glCanvas.height)
      gl.uniform1f(cu.uCamDist, 3.0)
      gl.uniform1f(cu.uFocal, 3.0)
      gl.uniformMatrix3fv(cu.uRotation, false, cloudRot)
      gl.uniform2f(cu.uCenterPx, p.drawX * glDPR, p.drawY * glDPR)
      gl.uniform1f(cu.uRadiusPx, p.drawR * glDPR * 1.015)
      gl.uniform3f(cu.uRimColor, p.color[0] / 255, p.color[1] / 255, p.color[2] / 255)
      gl.uniform1f(cu.uAlpha, p.drawAlpha)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, textures.earthClouds)
      gl.uniform1i(cu.uCloudMap, 0)

      // clouds drift at their own rate, so their depth no longer lines up
      // with the base sphere's depth values at the same screen pixel -
      // depth-testing here would reject clouds in a moire-like striped
      // pattern. Nothing else is drawn between the sphere and its own
      // cloud shell within this planet's depth-cleared pass, so it's safe
      // to always draw the clouds as an unconditional overlay. Blending IS
      // genuinely needed here, so it's enabled only for this pass.
      gl.disable(gl.DEPTH_TEST)
      gl.depthMask(false)
      gl.enable(gl.BLEND)
      gl.drawElements(gl.TRIANGLES, handles.sphereIndexCount, gl.UNSIGNED_SHORT, 0)
      gl.disable(gl.BLEND)
      gl.depthMask(true)
      gl.enable(gl.DEPTH_TEST)
    }
  }
}

export interface SceneFrameDeps {
  gl: WebGLRenderingContext
  glCanvas: HTMLCanvasElement
  glDPR: number
  handles: GLProgramHandles
  textures: TextureRegistry
  pCtx: CanvasRenderingContext2D
  planets: Planet[]
  dust: DustParticle[]
  nebulae: Nebula[]
  interactionState: InteractionState
  dom: PlanetSceneDom
}

/**
 * Runs one full frame: interaction/position step, then the 2D ambient
 * layer (nebulae + dust), then the WebGL sphere pass. The caller
 * (usePlanetScene) owns the requestAnimationFrame loop itself and just
 * calls this once per frame.
 */
export function renderSceneFrame(deps: SceneFrameDeps, ctx: FrameContext, W: number, H: number): void {
  const { gl, glCanvas, glDPR, handles, textures, pCtx, planets, dust, nebulae, interactionState, dom } = deps

  pCtx.clearRect(0, 0, W, H)

  stepInteractionFrame(interactionState, dom, planets, ctx)

  drawNebulae(pCtx, nebulae, W, H, interactionState.ambientDim)
  drawDust(pCtx, dust, W, H, ctx.now, interactionState.ambientDim, ctx.reducedMotion)
  const focusIndex = interactionState.focus.mode !== 'idle' ? interactionState.focus.index : -1
  drawPlanetsGL(gl, glCanvas, glDPR, handles, textures, planets, focusIndex)
}
