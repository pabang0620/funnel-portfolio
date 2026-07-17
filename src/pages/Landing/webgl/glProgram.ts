import { buildSphere } from './geometry'
import { VS_SRC, FS_SRC, FS_CLOUD_SRC } from './shaders'

export interface GLAttribs {
  aPosition: number
  aNormal: number
  aUV: number
}

export type GLUniforms = Record<string, WebGLUniformLocation | null>

export interface GLProgramHandles {
  program: WebGLProgram
  uniforms: GLUniforms
  attribs: GLAttribs
  cloudProgram: WebGLProgram | null
  cloudUniforms: GLUniforms
  cloudAttribs: GLAttribs
  posBuffer: WebGLBuffer
  normalBuffer: WebGLBuffer
  uvBuffer: WebGLBuffer
  indexBuffer: WebGLBuffer
  sphereIndexCount: number
}

const MAIN_UNIFORM_NAMES = [
  'uRotation',
  'uCenterPx',
  'uRadiusPx',
  'uResolution',
  'uCamDist',
  'uFocal',
  'uBaseColor',
  'uBaseColor2',
  'uRimColor',
  'uAlpha',
  'uSurfaceType',
  'uPatternSeed',
  'uHasPhoto',
  'uHasSpec',
  'uDayMap',
  'uSpecMap',
]

const CLOUD_UNIFORM_NAMES = [
  'uRotation',
  'uCenterPx',
  'uRadiusPx',
  'uResolution',
  'uCamDist',
  'uFocal',
  'uRimColor',
  'uAlpha',
  'uCloudMap',
]

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type)
  if (!sh) return null
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    if (import.meta.env.DEV) console.error('Shader compile error:', gl.getShaderInfoLog(sh))
    gl.deleteShader(sh)
    return null
  }
  return sh
}

function readUniforms(gl: WebGLRenderingContext, program: WebGLProgram, names: string[]): GLUniforms {
  const uniforms: GLUniforms = {}
  names.forEach((n) => {
    uniforms[n] = gl.getUniformLocation(program, n)
  })
  return uniforms
}

/**
 * Compiles/links both GL programs (main sphere + earth cloud shell), builds
 * the shared sphere mesh buffers, and returns everything as a plain handles
 * object. Called fresh inside usePlanetScene's effect on every mount —
 * never a module-level singleton.
 */
export function createGLProgram(gl: WebGLRenderingContext): GLProgramHandles | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VS_SRC)
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FS_SRC)
  if (!vs || !fs) return null

  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (import.meta.env.DEV) console.error('Program link error:', gl.getProgramInfoLog(program))
    return null
  }

  const attribs: GLAttribs = {
    aPosition: gl.getAttribLocation(program, 'aPosition'),
    aNormal: gl.getAttribLocation(program, 'aNormal'),
    aUV: gl.getAttribLocation(program, 'aUV'),
  }
  const uniforms = readUniforms(gl, program, MAIN_UNIFORM_NAMES)

  const mesh = buildSphere(16, 24)
  const sphereIndexCount = mesh.indices.length

  const posBuffer = gl.createBuffer()
  const normalBuffer = gl.createBuffer()
  const uvBuffer = gl.createBuffer()
  const indexBuffer = gl.createBuffer()
  if (!posBuffer || !normalBuffer || !uvBuffer || !indexBuffer) return null

  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW)

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, mesh.normals, gl.STATIC_DRAW)

  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, mesh.uvs, gl.STATIC_DRAW)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW)

  // ---- cloud-shell program (Earth archetype only, reuses the sphere mesh) ----
  let cloudProgram: WebGLProgram | null = null
  let cloudUniforms: GLUniforms = {}
  let cloudAttribs: GLAttribs = { aPosition: -1, aNormal: -1, aUV: -1 }

  const cloudVS = compileShader(gl, gl.VERTEX_SHADER, VS_SRC)
  const cloudFS = compileShader(gl, gl.FRAGMENT_SHADER, FS_CLOUD_SRC)
  if (cloudVS && cloudFS) {
    const prog = gl.createProgram()
    if (prog) {
      gl.attachShader(prog, cloudVS)
      gl.attachShader(prog, cloudFS)
      gl.linkProgram(prog)
      if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        cloudProgram = prog
        cloudAttribs = {
          aPosition: gl.getAttribLocation(prog, 'aPosition'),
          aNormal: gl.getAttribLocation(prog, 'aNormal'),
          aUV: gl.getAttribLocation(prog, 'aUV'),
        }
        cloudUniforms = readUniforms(gl, prog, CLOUD_UNIFORM_NAMES)
      } else if (import.meta.env.DEV) {
        console.error('Cloud program link error:', gl.getProgramInfoLog(prog))
      }
    }
  }

  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)
  // NOTE: blending is intentionally NOT left globally enabled here — see the
  // BLEND note in render.ts's drawPlanetsGL for why (translucent-looking
  // "opaque" planets bug, fixed by disabling BLEND right before every
  // opaque draw call instead of relying on it never having been re-enabled).
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  gl.disable(gl.BLEND)
  gl.clearColor(0, 0, 0, 0)

  return {
    program,
    uniforms,
    attribs,
    cloudProgram,
    cloudUniforms,
    cloudAttribs,
    posBuffer,
    normalBuffer,
    uvBuffer,
    indexBuffer,
    sphereIndexCount,
  }
}

export function disposeGLProgram(gl: WebGLRenderingContext, handles: GLProgramHandles): void {
  gl.deleteProgram(handles.program)
  if (handles.cloudProgram) gl.deleteProgram(handles.cloudProgram)
  gl.deleteBuffer(handles.posBuffer)
  gl.deleteBuffer(handles.normalBuffer)
  gl.deleteBuffer(handles.uvBuffer)
  gl.deleteBuffer(handles.indexBuffer)
}
