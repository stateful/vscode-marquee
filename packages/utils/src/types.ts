import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import type { TelemetryEventProperties } from '@vscode/extension-telemetry'
import type { Webview } from 'vscode'

export type ContextProperties<T> = {
  [t in keyof T]: T[t]
} & {
  [t in keyof T & string as `set${Capitalize<t>}`]: (val: T[t]) => void
}

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

export interface MarqueeWindow<State = any, Configuration = any> extends Window {
  vscode: VSCodeWebview
  acquireVsCodeApi: () => Webview
  activeWorkspace: Workspace | null
  marqueeUserProps: string
  marqueeExtension: MarqueeInterface
  marqueeBackendBaseUrl: string
  marqueeBackendGeoUrl: string
  marqueeBackendFwdGeoUrl: string
  marqueeStateConfiguration: Record<string, { state: State, configuration: Configuration }>
  marqueeThirdPartyWidgets: number
}

export interface MarqueeEvents {
  openSettings: never
  removeWidget: string
  updateWidgetDisplay: Record<string, boolean>
  resetMarquee?: boolean
  telemetryEvent: {
    eventName: string
    properties?: TelemetryEventProperties
  }
  openCloudSyncFeatureInterest: boolean
}

export enum WorkspaceType {
  WORKSPACE = 'workspace',
  FOLDER = 'folder',
  NONE = 'none',
}

export interface Workspace {
  id: string
  name: string
  path: string
  type: WorkspaceType
}

export type RGBA = {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface Configuration {
  background: string
  name: string
}

export interface State extends ProjectItem {
  globalScope: boolean
}

export interface GuiState {
  resetApp: boolean
}

export interface Context extends ContextProperties<State & Configuration & GuiState> {
  themeColor: RGBA
}

export interface ProjectItem {
  commit?: string
  branch?: string
  gitUri?: string
  path?: string
  body: string
  id: string
  workspaceId: string | null
}

export interface GitRemote {
  name: string;
  url: string;
}
