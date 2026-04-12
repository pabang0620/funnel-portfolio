export const SOURCES_OPTIONS = [
  { value: 'google', label: 'Google' },
  { value: 'meta', label: 'Meta' },
] as const

export type SourcesValue = 'google' | 'meta'
