import type { Configuration, State } from './types'

export const DEFAULT_CONFIGURATION: Configuration = {
  workspaceFilter: '',
  workspaceSortOrder: 'usage',
  openProjectInNewWindow: false
}

export const DEFAULT_STATE: State = {
  workspaces: []
}
