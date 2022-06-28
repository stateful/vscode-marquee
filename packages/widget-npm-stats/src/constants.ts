import type { Configuration, State } from './types'

const ONE_YEAR = 1000 * 60 * 60 * 24 * 365
export const DEFAULT_CONFIGURATION: Configuration = {
  packageNames: [],
  from: Date.now() - ONE_YEAR,
  until: Date.now(),
}
export const DEFAULT_STATE: State = {
  stats: {},
  isLoading: true
}

export const STATS_URL = 'https://npm-stat.com/api/download-counts'
export const LEGEND_HEIGHT = 80
export const MIN_HEIGHT = 300
export const TEXT_COLOR = 'var(--vscode-editorWidget-foreground)'
