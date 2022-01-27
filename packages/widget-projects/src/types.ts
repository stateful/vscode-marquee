export interface ContextValues {
  workspaceFilter: string
  workspaceSortOrder: string
  openProjectInNewWindow: boolean
}

export interface ContextMethods {
  setWorkspaceFilter: (filter: string) => void
  setWorkspaceSortOrder: (filter: string) => void
  setOpenProjectInNewWindow: (set: boolean) => void
}

export type Context = ContextValues & ContextMethods;
