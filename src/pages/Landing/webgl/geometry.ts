/**
 * Pure geometry/math helpers for the planet sphere renderer. No GL calls,
 * no mutable module-level state — every export here is a pure function or
 * a true constant, safe to import from anywhere.
 */

export interface SphereMesh {
  positions: Float32Array
  normals: Float32Array
  uvs: Float32Array
  indices: Uint16Array
}

/**
 * Builds a unit-sphere lat/long mesh with standard equirectangular UVs
 * (u wraps longitude, v runs pole-to-pole) — matches what the Solar System
 * Scope planet-texture JPEGs (and any similar equirectangular photo) expect.
 */
export function buildSphere(latSeg: number, lonSeg: number): SphereMesh {
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let lat = 0; lat <= latSeg; lat++) {
    const theta = (lat * Math.PI) / latSeg
    const sinT = Math.sin(theta)
    const cosT = Math.cos(theta)
    const v = lat / latSeg
    for (let lon = 0; lon <= lonSeg; lon++) {
      const phi = (lon * 2 * Math.PI) / lonSeg
      const sinP = Math.sin(phi)
      const cosP = Math.cos(phi)
      const x = sinT * cosP
      const y = cosT
      const z = sinT * sinP
      positions.push(x, y, z)
      normals.push(x, y, z)
      uvs.push(lon / lonSeg, v)
    }
  }

  const rowLen = lonSeg + 1
  for (let la = 0; la < latSeg; la++) {
    for (let lo = 0; lo < lonSeg; lo++) {
      const a = la * rowLen + lo
      const b = a + rowLen
      indices.push(a, b, a + 1)
      indices.push(a + 1, b, b + 1)
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
  }
}

export function mat3RotY(a: number): Float32Array {
  const c = Math.cos(a)
  const s = Math.sin(a)
  return new Float32Array([c, 0, -s, 0, 1, 0, s, 0, c])
}

export function mat3RotX(a: number): Float32Array {
  const c = Math.cos(a)
  const s = Math.sin(a)
  return new Float32Array([1, 0, 0, 0, c, s, 0, -s, c])
}

export function mat3Mul(a: Float32Array, b: Float32Array): Float32Array {
  const r = new Float32Array(9)
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 3; row++) {
      let sum = 0
      for (let k = 0; k < 3; k++) sum += a[k * 3 + row] * b[col * 3 + k]
      r[col * 3 + row] = sum
    }
  }
  return r
}

export function isPow2(v: number): boolean {
  return (v & (v - 1)) === 0
}

export function distSq(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx
  const dy = ay - by
  return dx * dx + dy * dy
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x))
}

export function easeOutBack(x: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  const y = x - 1
  return 1 + c3 * y * y * y + c1 * y * y
}

export function easeOutCubic(x: number): number {
  const y = 1 - x
  return 1 - y * y * y
}

export function rgba(rgb: [number, number, number], a: number): string {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`
}
