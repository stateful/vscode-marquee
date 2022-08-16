import type { State, Configuration } from './types'

export const DEFAULT_STATE: State = {
  todos: []
}

export const DEFAULT_CONFIGURATION: Configuration = {
  todoFilter: '',
  hide: false,
  showArchived: false,
  showBranched: false,
  autoDetect: true
}
