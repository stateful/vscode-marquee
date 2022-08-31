import vscode from 'vscode'

import ExtensionManager from '@vscode-marquee/utils/extension'

import { DEFAULT_CONFIGURATION, DEFAULT_STATE } from './constants'
import type { State, Configuration } from './types'

const STATE_KEY = 'widgets.projects'

export class ProjectsExtensionManager extends ExtensionManager<State, Configuration> {
  constructor (context: vscode.ExtensionContext) {
    super(context, STATE_KEY, DEFAULT_CONFIGURATION, DEFAULT_STATE)
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
       * because we aren't able to connect to remote VS Code instances
       * through `vscode.openFolder`
       * see more: https://github.com/microsoft/vscode-remote-release/issues/6243
       */
      typeof vscode.env.remoteName === 'undefined'
    ) {
      this.updateState('workspaces', [...this._state.workspaces, aws])
    }

    /**
     * count workspace usage
     */
    if (aws) {
      const newWorkspaceVisitCount = this._state.visitCount[aws.id]
        ? this._state.visitCount[aws.id] + 1
        : 1

      const visitCount = {
        ...this._state.visitCount,
        [aws.id]: newWorkspaceVisitCount
      }

      /**
       * remove ids from `visitCount` list that aren't in workspace list (cleanup)
       */
      for (const id of Object.keys(visitCount)) {
        if (!this._state.workspaces.find((w) => w.id === id)) {
          delete visitCount[id]
        }
      }

      const lastVisited = {
        ...this._state.lastVisited,
        [aws.id]: Date.now()
      }

      /**
       * remove ids from `lastVisited` list that aren't in workspace list (cleanup)
       */
      for (const id of Object.keys(lastVisited)) {
        if (!this._state.workspaces.find((w) => w.id === id)) {
          delete lastVisited[id]
        }
      }

      this.updateState('visitCount', visitCount)
      this.updateState('lastVisited', lastVisited)
    }
  }
}

export function activate (context: vscode.ExtensionContext) {
  const stateManager = new ProjectsExtensionManager(context)

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
