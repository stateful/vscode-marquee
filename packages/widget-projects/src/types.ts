import type { Workspace, ContextProperties } from '@vscode-marquee/utils'

export type WorkspaceSortOrder = 'alphabetical' | 'usage' | 'visits'

export interface Configuration {
  workspaceFilter?: string
  workspaceSortOrder: WorkspaceSortOrder
  openProjectInNewWindow: boolean
}

export interface State {
  workspaces: Workspace[]
  lastVisited: string | null
  visitCount: Record<string, number>
}

export interface Context extends ContextProperties<Configuration & State> {
  notes: WidgetItem[],
  todos: WidgetItem[],
  snippets: WidgetItem[],

  _removeWorkspace: (id: string) => void
}

export interface WidgetItem {
  workspaceId: string
}
