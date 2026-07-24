import earthDayUrl from '../assets/planets/earth-day.jpg'
import earthCloudsUrl from '../assets/planets/earth-clouds.jpg'
import earthSpecularUrl from '../assets/planets/earth-specular.jpg'
import marsUrl from '../assets/planets/mars-surface.jpg'
import jupiterUrl from '../assets/planets/jupiter-surface.jpg'
import moonUrl from '../assets/planets/moon-surface.jpg'
import { isPow2 } from './geometry'

export type TextureKey = 'earthDay' | 'earthClouds' | 'earthSpecular' | 'mars' | 'jupiter' | 'moon'

const TEXTURE_SOURCES: Record<TextureKey, { url: string; placeholder: [number, number, number] }> = {
  earthDay: { url: earthDayUrl, placeholder: [40, 95, 165] },
  earthClouds: { url: earthCloudsUrl, placeholder: [0, 0, 0] },
  earthSpecular: { url: earthSpecularUrl, placeholder: [0, 0, 0] },
  mars: { url: marsUrl, placeholder: [196, 110, 66] },
  jupiter: { url: jupiterUrl, placeholder: [225, 205, 150] },
  moon: { url: moonUrl, placeholder: [150, 146, 140] },
}

export type TextureRegistry = Record<TextureKey, WebGLTexture>

function createPlaceholderTexture(gl: WebGLRenderingContext, rgb: [number, number, number]): WebGLTexture {
  const tex = gl.createTexture()
  if (!tex) throw new Error('Failed to create placeholder WebGL texture')
  gl.bindTexture(gl.TEXTURE_2D, tex)
  const px = new Uint8Array([rgb[0], rgb[1], rgb[2], 255])
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, px)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  return tex
}

/**
 * Loads an image asynchronously and uploads it into an already-created
 * placeholder texture once decoded; never throws even if decoding fails
 * (texture simply stays the placeholder color). `getDisposed` is polled
 * before every GL call so a decode that completes after unmount never
 * touches a (possibly already-deleted) GL context.
 */
function upgradeTextureAsync(
  gl: WebGLRenderingContext,
  tex: WebGLTexture,
  url: string,
  wrapRepeat: boolean,
  getDisposed: () => boolean
): void {
  const img = new Image()
  img.onload = () => {
    if (getDisposed()) return
    try {
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
      const pot = isPow2(img.width) && isPow2(img.height)
      if (wrapRepeat && pot) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.generateMipmap(gl.TEXTURE_2D)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('Texture upload failed:', err)
    }
  }
  img.onerror = () => {
    if (getDisposed()) return
    if (import.meta.env.DEV) console.error('Texture decode failed for', url)
  }
  img.src = url
}

/**
 * Factory - builds a FRESH texture registry (6 real-photo textures) every
 * time it's called. Never a module-level singleton: this must be invoked
 * once per usePlanetScene mount so repeated Landing mount/unmount doesn't
 * share GL textures across (possibly different) WebGL contexts.
 */
export function createTextureRegistry(gl: WebGLRenderingContext, getDisposed: () => boolean): TextureRegistry {
  const registry = {} as TextureRegistry
  ;(Object.keys(TEXTURE_SOURCES) as TextureKey[]).forEach((key) => {
    const { url, placeholder } = TEXTURE_SOURCES[key]
    const tex = createPlaceholderTexture(gl, placeholder)
    registry[key] = tex
    upgradeTextureAsync(gl, tex, url, true, getDisposed)
  })
  return registry
}

export function disposeTextureRegistry(gl: WebGLRenderingContext, registry: TextureRegistry): void {
  ;(Object.keys(registry) as TextureKey[]).forEach((key) => {
    gl.deleteTexture(registry[key])
  })
}
