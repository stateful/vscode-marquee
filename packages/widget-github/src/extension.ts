import vscode from 'vscode'

import ExtensionManager, { DEPRECATED_GLOBAL_STORE_KEY } from '@vscode-marquee/utils/extension'

import { DEFAULT_CONFIGURATION, DEFAULT_STATE } from './constants'
import type { Configuration } from './types'

const STATE_KEY = 'widgets.github'

export function activate (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new ExtensionManager<{}, Configuration>(
    context,
    channel,
    STATE_KEY,
    DEFAULT_CONFIGURATION,
    DEFAULT_STATE
  )

  /**
   * transform configurations from Marquee v2 -> v3
   */
  const oldGlobalStore = context.globalState.get<any>(DEPRECATED_GLOBAL_STORE_KEY, {})
  if (typeof oldGlobalStore.language?.name === 'string') {
    stateManager.updateConfiguration('language', oldGlobalStore.language.name)
  }
  if (typeof oldGlobalStore.since?.name === 'string') {
    stateManager.updateConfiguration('since', oldGlobalStore.since.name)
  }
  if (typeof oldGlobalStore.spoken?.name === 'string') {
    stateManager.updateConfiguration('spoken', oldGlobalStore.spoken.name)
  }

  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    }
  }
}
