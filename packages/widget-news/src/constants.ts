import { State, Configuration } from './types'

export const FETCH_DATA_TIMEOUT = 10000
export const DEFAULT_STATE: State = {
  news: [],
  isFetching: true,
  channel: 'HN Newest',
  error: null
}
export const DEFAULT_CONFIGURATION: Configuration = {
  feeds: {},
  updateInterval: 1000 * 60
}
