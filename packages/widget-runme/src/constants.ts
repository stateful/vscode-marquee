import vscode from 'vscode'
import type { Configuration, State } from './types'

export const DEFAULT_CONFIGURATION: Configuration = {}
export const DEFAULT_STATE: State = {
  isInstalled: Boolean(vscode.extensions.all.find((ext) => ext.id === 'stateful.runme')),
  notebooks: null,
  uriScheme: vscode.env.uriScheme
}
