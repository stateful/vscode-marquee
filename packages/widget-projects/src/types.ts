import type { Workspace } from "@vscode-marquee/utils";

export type WorkspaceSortOrder = 'alphabetical' | 'usage';

export interface ContextMethods {
  setWorkspaceFilter: (filter: string) => void
  setWorkspaceSortOrder: (filter: WorkspaceSortOrder) => void
  setOpenProjectInNewWindow: (set: boolean) => void
}

export type Context = State & Configuration & ContextMethods;

export interface Configuration {
  workspaceFilter: string
  workspaceSortOrder: WorkspaceSortOrder
  openProjectInNewWindow: boolean
}

export interface State {
  workspaces: Workspace[]
}
