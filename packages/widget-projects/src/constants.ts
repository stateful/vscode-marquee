import type { Configuration, State } from './types';

export const DEFAULTS: Configuration = {
  workspaceFilter: "",
  workspaceSortOrder: "usage",
  openProjectInNewWindow: false
};

export const DEFAULT_STATE: State = { workspaces: [] };
