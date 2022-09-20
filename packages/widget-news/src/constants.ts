import { State, Configuration } from './types'

export const MIN_UPDATE_INTERVAL = 1000 * 60
export const FETCH_DATA_TIMEOUT = 10000
export const DEFAULT_STATE: State = {
  news: [],
  isFetching: true,
  channel: 'HN Frontpage',
  error: null
}
export const DEFAULT_CONFIGURATION: Configuration = {
  feeds: {},
  updateInterval: MIN_UPDATE_INTERVAL
}
