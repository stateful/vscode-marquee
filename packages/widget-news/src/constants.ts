import { WidgetState } from './types'

export const FETCH_DATA_TIMEOUT = 10000
export const HN_API = 'https://api.hackerwebapp.com/'
export const DEFAULT_STATE: WidgetState = {
  news: [],
  isFetching: false,
  channel: 'news'
}

export const HN_CHANNELS = ['news', 'newest', 'ask', 'show', 'jobs', 'best'] as const
