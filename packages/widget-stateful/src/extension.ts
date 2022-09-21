import vscode from 'vscode'

import ExtensionManager from '@vscode-marquee/utils/extension'
import type { State, Configuration } from './types'


const STATE_KEY = 'widgets.stateful'

export class StatefulExtensionManager extends ExtensionManager<State, Configuration>{
  constructor (context: vscode.ExtensionContext) {
    super(context, STATE_KEY, {}, {})
  }
}

export function activate (
  context: vscode.ExtensionContext,
) {
  const stateManager = new StatefulExtensionManager(context)


  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    }
  }
}