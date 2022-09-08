import type { ExtensionContext } from 'vscode'

import { StatefulState } from './stateful'
import type { StateProvider } from '../types'

type StateProviderClass = new (
  context: ExtensionContext,
  key: string,
  defaultState: any
) => StateProvider<any>

const provider: Record<string, StateProviderClass> = {
  stateful: StatefulState
}

export default provider
