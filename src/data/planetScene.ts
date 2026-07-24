import { PROJECTS } from './projects'

export type PlanetArchetype = 'gas' | 'moon' | 'mars' | 'earth' | 'ice'
export type FamilyKey = 'A' | 'B' | 'C'

export interface PlanetFamily {
  key: FamilyKey
  label: string
  rgb: [number, number, number]
}

export const PLANET_FAMILIES: Record<FamilyKey, PlanetFamily> = {
  A: { key: 'A', label: 'Marketing & Ads', rgb: [92, 224, 205] },
  B: { key: 'B', label: 'Internal Ops', rgb: [176, 122, 244] },
  C: { key: 'C', label: 'Customer & Education', rgb: [226, 178, 100] },
}

export const PLANET_ARCHETYPES: Record<
  PlanetArchetype,
  { id: number; base: [number, number, number]; base2: [number, number, number] }
> = {
  gas: { id: 0, base: [225, 205, 150], base2: [178, 132, 80] },
  moon: { id: 1, base: [150, 146, 140], base2: [92, 88, 84] },
  mars: { id: 2, base: [196, 110, 66], base2: [124, 64, 40] },
  earth: { id: 3, base: [40, 95, 165], base2: [40, 95, 165] },
  ice: { id: 4, base: [165, 205, 218], base2: [112, 162, 190] },
}

// "ice" intentionally has no entry — keeps its procedural noise shader, no real texture
export const ARCHETYPE_TEXTURE_KEY: Partial<Record<PlanetArchetype, string>> = {
  gas: 'jupiter',
  moon: 'moon',
  mars: 'mars',
  earth: 'earthDay',
}

export interface PlanetConfig {
  archetype: PlanetArchetype
  size: number
  familyKey: FamilyKey
}

export const PLANET_SCENE_CONFIG: Record<string, PlanetConfig> = {
  'utm-builder': { archetype: 'gas', size: 34, familyKey: 'A' },
  'ad-content-storage': { archetype: 'ice', size: 30, familyKey: 'A' },
  'ad-library-scraper': { archetype: 'moon', size: 25, familyKey: 'A' },
  'ad-performance': { archetype: 'gas', size: 38, familyKey: 'A' },
  'med-manager': { archetype: 'mars', size: 22, familyKey: 'A' },
  'hr-hub': { archetype: 'earth', size: 30, familyKey: 'B' },
  'meeting-room': { archetype: 'moon', size: 23, familyKey: 'B' },
  'file-hub': { archetype: 'mars', size: 34, familyKey: 'B' },
  'cs-manager': { archetype: 'ice', size: 27, familyKey: 'C' },
  'edu-platform': { archetype: 'earth', size: 37, familyKey: 'C' },
}

export interface PlanetSceneEntry {
  key: string
  name: string
  path: string
  description: string
  tag: string
  archetype: PlanetArchetype
  size: number
  familyKey: FamilyKey
}

/**
 * Runtime planet list, derived from PROJECTS (SSOT) mapped through
 * PLANET_SCENE_CONFIG, preserving PROJECTS' own array order — this order
 * drives keyboard arrow-cycle order in the scene.
 */
export function buildPlanetSceneEntries(): PlanetSceneEntry[] {
  return PROJECTS.map((project) => {
    const config = PLANET_SCENE_CONFIG[project.key]
    if (!config) {
      throw new Error(
        `planetScene: PROJECTS entry "${project.key}" has no matching PLANET_SCENE_CONFIG entry — ` +
          'add one before shipping (see src/data/planetScene.ts).'
      )
    }
    return {
      key: project.key,
      name: project.name,
      path: project.path,
      description: project.description,
      tag: project.tag,
      archetype: config.archetype,
      size: config.size,
      familyKey: config.familyKey,
    }
  })
}
