import vscode from 'vscode'

import ExtensionManager, { DEPRECATED_GLOBAL_STORE_KEY } from '@vscode-marquee/utils/extension'

import { DEFAULT_CONFIGURATION, DEFAULT_STATE } from './constants'
import type { Configuration } from './types'

const STATE_KEY = 'widgets.weather'

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
  if (oldGlobalStore.scale && oldGlobalStore.scale.name) {
    const [firstLetter, ...restLetters] = oldGlobalStore.scale.name
    stateManager.updateConfiguration('scale', firstLetter.toUpperCase() + restLetters.join(''))
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
