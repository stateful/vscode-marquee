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

export type Context = ContextProperties<Configuration & State>;
