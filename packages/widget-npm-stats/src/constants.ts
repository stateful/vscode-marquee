import type { Configuration, State } from './types'

export const DEFAULT_CONFIGURATION: Configuration = {
  packageNames: []
}
export const DEFAULT_STATE: State = {
  stats: {},
  isLoading: true
}

export const STATS_URL = 'https://npm-stat.com/api/download-counts'
