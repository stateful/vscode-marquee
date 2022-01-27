import type { ConnectableObservable } from 'rxjs';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import type { Webview } from 'vscode';

interface VSCodeWebview extends Webview {
  getState: () => any
  setState: (param: any) => void
}

export interface ThirdPartyWidgetOptions {
  name: string
  icon: IconProp
  label: string
  tags: string[]
  description: string
}

export interface MarqueeInterface {
  defineWidget: (
    widgetOptions: ThirdPartyWidgetOptions,
    constructor: CustomElementConstructor,
    options?: ElementDefinitionOptions
  ) => void
}

export interface MarqueeWindow extends Window {
  vscode: VSCodeWebview
  acquireVsCodeApi: () => Webview
  marqueeExtension: MarqueeInterface
  marqueeUserProps: string
  marqueeBackendBaseUrl: string
  marqueeBackendGeoUrl: string
  marqueeBackendFwdGeoUrl: string
  uptime?: ConnectableObservable<number>
}

export interface MarqueeEvents {
  openSettings: never
  removeWidget: string
  updateWidgetDisplay: Record<string, boolean>
  addSnippet: any
  openGitHubDialog: boolean
  openWeatherDialog: boolean
  openAddTodoDialog: boolean
  openEditTodoDialog?: string
  openAddSnippetDialog: boolean
  openEditSnippetDialog?: string
  openAddNoteDialog: boolean
  openEditNoteDialog?: string
}

export interface Workspace {
  id: string
  name: string
  path: string
  type: 'workspace' | 'folder'
}

export interface IGlobalContext {
  globalScope: boolean
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  _removeWorkspace: (id: string) => void
  _updateGlobalScope: (show: boolean) => void
}

export type RGBA = {
  r: number;
  g: number;
  b: number;
  a?: number;
};
