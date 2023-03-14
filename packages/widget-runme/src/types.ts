import type { ContextProperties } from '@vscode-marquee/utils'

export interface State {
  isInstalled: boolean
  notebooks: null | string[]
  uriScheme: string
}
export interface Configuration {}

export interface Context extends ContextProperties<Configuration & State> {}
