import type { PlanetArchetype, PlanetFamily, PlanetSceneEntry } from '@/data/planetScene'
import { PLANET_ARCHETYPES, PLANET_FAMILIES, ARCHETYPE_TEXTURE_KEY } from '@/data/planetScene'
import { distSq } from './geometry'

export const REF_W = 1440
export const REF_H = 900
export const MIN_SIZE = 22
export const MAX_SIZE = 38
export const DUST_COUNT = 140

export interface Planet {
  idx: number
  key: string
  name: string
  desc: string
  path: string
  tag: string
  family: PlanetFamily
  color: [number, number, number]
  archetype: PlanetArchetype
  surfaceType: number
  bodyColor: [number, number, number]
  bodyColor2: [number, number, number]
  texKey: string | null
  hasClouds: boolean
  hasSpec: boolean
  cloudSpin: number
  patternSeed: number
  tilt: number
  spinAngle: number
  spinSpeed: number
  pausedTime: number
  baseR: number
  depth: number
  homeFracX: number
  homeFracY: number
  homeX: number
  homeY: number
  amp: number
  freqX: number
  freqY: number
  phaseX: number
  phaseY: number
  drawX: number
  drawY: number
  drawR: number
  drawAlpha: number
  hoverT: number
  scaleMul: number
}

export interface DustParticle {
  fx: number
  fy: number
  r: number
  phase: number
  speed: number
}

export interface Nebula {
  fx: number
  fy: number
  r: number
  color: [number, number, number]
  alpha: number
}

interface HomeSlot {
  fx: number
  fy: number
  amp: number
}

/**
 * Rejection-samples home positions (fraction space) so planets start
 * reasonably spread apart relative to their own wander amplitude.
 */
function sampleHomes(entries: PlanetSceneEntry[]): HomeSlot[] {
  const placed: { px: number; py: number; amp: number; size: number }[] = []
  const homes: HomeSlot[] = []

  entries.forEach((entry) => {
    const depth = (entry.size - MIN_SIZE) / (MAX_SIZE - MIN_SIZE)
    const amp = 34 + depth * 58
    let best: { fx: number; fy: number; px: number; py: number } | null = null
    let bestScore = -1

    for (let attempt = 0; attempt < 260; attempt++) {
      const fx = 0.08 + Math.random() * 0.84
      const fy = 0.26 + Math.random() * 0.62
      const px = fx * REF_W
      const py = fy * REF_H
      let minDist = Infinity
      for (let i = 0; i < placed.length; i++) {
        const d = Math.sqrt(distSq(px, py, placed[i].px, placed[i].py))
        const needed = (amp + placed[i].amp) * 0.55 + entry.size + placed[i].size + 46
        const score = d - needed
        if (score < minDist) minDist = score
      }
      if (placed.length === 0) {
        best = { fx, fy, px, py }
        break
      }
      if (minDist > bestScore) {
        bestScore = minDist
        best = { fx, fy, px, py }
      }
      if (minDist > 0) break // good enough, no overlap by heuristic
    }

    const chosen = best ?? { fx: 0.5, fy: 0.5, px: 0.5 * REF_W, py: 0.5 * REF_H }
    homes.push({ fx: chosen.fx, fy: chosen.fy, amp })
    placed.push({ px: chosen.px, py: chosen.py, amp, size: entry.size })
  })

  return homes
}

/**
 * Builds the runtime planet array fresh from the scene entries. Factory
 * function — never a module-level mutable array. Call once per
 * usePlanetScene mount.
 */
export function createPlanets(entries: PlanetSceneEntry[]): Planet[] {
  const homes = sampleHomes(entries)

  return entries.map((entry, idx) => {
    const depth = (entry.size - MIN_SIZE) / (MAX_SIZE - MIN_SIZE)
    const archInfo = PLANET_ARCHETYPES[entry.archetype] ?? PLANET_ARCHETYPES.moon
    const family = PLANET_FAMILIES[entry.familyKey]
    const home = homes[idx]

    return {
      idx,
      key: entry.key,
      name: entry.name,
      desc: entry.description,
      path: entry.path,
      tag: entry.tag,
      family,
      color: family.rgb,
      archetype: entry.archetype,
      surfaceType: archInfo.id,
      bodyColor: archInfo.base,
      bodyColor2: archInfo.base2,
      texKey: ARCHETYPE_TEXTURE_KEY[entry.archetype] ?? null,
      hasClouds: entry.archetype === 'earth',
      hasSpec: entry.archetype === 'earth',
      cloudSpin: Math.random() * Math.PI * 2,
      patternSeed: idx * 1.37 + Math.random() * 10,
      tilt: Math.random() * 0.6 - 0.3,
      spinAngle: Math.random() * Math.PI * 2,
      spinSpeed: (0.16 + Math.random() * 0.22) * (Math.random() < 0.5 ? -1 : 1),
      pausedTime: 0,
      baseR: entry.size,
      depth,
      homeFracX: home.fx,
      homeFracY: home.fy,
      homeX: 0,
      homeY: 0,
      amp: home.amp,
      freqX: 0.045 + depth * 0.05,
      freqY: 0.038 + depth * 0.045,
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      drawX: 0,
      drawY: 0,
      drawR: entry.size,
      drawAlpha: 1,
      hoverT: 0,
      scaleMul: 1,
    }
  })
}

export function createDust(): DustParticle[] {
  const dust: DustParticle[] = []
  for (let i = 0; i < DUST_COUNT; i++) {
    dust.push({
      fx: Math.random(),
      fy: Math.random(),
      r: 0.6 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.8,
    })
  }
  return dust
}

export function createNebulae(): Nebula[] {
  return [
    { fx: 0.18, fy: 0.32, r: 480, color: PLANET_FAMILIES.A.rgb, alpha: 0.06 },
    { fx: 0.82, fy: 0.62, r: 520, color: PLANET_FAMILIES.B.rgb, alpha: 0.05 },
  ]
}

/**
 * Idle wander position, in screen px, for a planet at virtual time `t`
 * (already paused-time-adjusted by the caller). `slow` dampens amplitude
 * (used while another planet is zoom-focused) and is expected to be 0 when
 * prefers-reduced-motion disables decorative wander entirely.
 */
export function computeIdleXY(p: Planet, t: number, slow: number): { x: number; y: number } {
  return {
    x: p.homeX + Math.sin(t * p.freqX + p.phaseX) * p.amp * slow,
    y: p.homeY + Math.cos(t * p.freqY + p.phaseY) * p.amp * 0.7 * slow,
  }
}

/**
 * Recomputes each planet's absolute home position (px) from its stored
 * home fraction plus a size-scale factor, in response to a viewport resize.
 * Mutates the planets in place (they're already a fresh-per-mount array).
 */
export function applyResize(planets: Planet[], W: number, H: number): void {
  const scale = Math.max(0.62, Math.min(1.05, W / REF_W))
  planets.forEach((p) => {
    p.homeX = p.homeFracX * W
    p.homeY = p.homeFracY * H
    p.scaleMul = scale
  })
}
