import vscode from 'vscode'

import ExtensionManager from '@vscode-marquee/utils/extension'
import { State } from './types'

const STATE_KEY = 'widgets.project-info'


export class ProjectInfoExtensionManager extends ExtensionManager<State, {}> {
  constructor (context: vscode.ExtensionContext, channel: vscode.OutputChannel) {
    super(
      context,
      channel,
      STATE_KEY,
      {},
      {}
    )
  }
}

export function activate (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new ProjectInfoExtensionManager(context, channel)

  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager),
    },
  }
}
