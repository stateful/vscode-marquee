import { extensions } from 'vscode'
import type { Configuration, State } from './types'

export const DEFAULT_CONFIGURATION: Configuration = {}
export const DEFAULT_STATE: State = {
  isInstalled: Boolean(extensions.all.find((ext) => ext.id === 'stateful.runme')),
  notebooks: null
}
