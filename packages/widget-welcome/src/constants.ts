import type { State, Events } from './types'

export const DEFAULT_STATE: State & Omit<Events, 'upvote'> = {
  tricks: [],
  read: [],
  liked: [],
  error: null
}
