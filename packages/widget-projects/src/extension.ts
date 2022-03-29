import vscode from 'vscode'

import ExtensionManager from '@vscode-marquee/utils/extension'

import { DEFAULT_CONFIGURATION, DEFAULT_STATE } from './constants'
import type { State, Configuration } from './types'

const STATE_KEY = 'widgets.projects'

export class ProjectsExtensionManager extends ExtensionManager<State, Configuration> {
  constructor (
    context: vscode.ExtensionContext,
    channel: vscode.OutputChannel
  ) {
    super(context, channel, STATE_KEY, DEFAULT_CONFIGURATION, DEFAULT_STATE)

    const aws = this.getActiveWorkspace()
    /**
     * add new workspace to list
     */
    if (
    /**
       * the current workspace can be detected
       */
      aws &&
      /**
       * the workspace path is not a number
       * (happens e.g. when connecting to docker container)
       */
      isNaN(Number(aws.path)) &&
      /**
       * the workspace isn't part of the existing list
       */
      !this._state.workspaces.find((ws: any) => ws.id === aws.id) &&
      /**
       * we are not running on a remote machine, this is necessary
       * because we aren't able to connect to remote VSCode instances
       * through `vscode.openFolder`
       * see more: https://github.com/microsoft/vscode-remote-release/issues/6243
       */
      typeof vscode.env.remoteName === 'undefined'
    ) {
      this.updateState('workspaces', [...this._state.workspaces, aws])
    }
  }
}

export function activate (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new ProjectsExtensionManager(context, channel)

  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    }
  }
}

export * from './types'
