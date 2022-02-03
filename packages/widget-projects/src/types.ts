import type { Workspace, ContextProperties } from "@vscode-marquee/utils";

export type WorkspaceSortOrder = 'alphabetical' | 'usage';

export interface Configuration {
  workspaceFilter: string
  workspaceSortOrder: WorkspaceSortOrder
  openProjectInNewWindow: boolean
}

export interface State {
  workspaces: Workspace[]
}

export interface Context extends ContextProperties<Configuration & State> {
  _removeWorkspace: (id: string) => void
}
