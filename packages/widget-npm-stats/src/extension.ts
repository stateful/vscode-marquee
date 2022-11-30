import vscode from 'vscode'
import { format } from 'util'
import Axios from 'axios'
import ExtensionManager, { Logger, ChildLogger } from '@vscode-marquee/utils/extension'
import type { Client } from 'tangle'

import { formatDate } from './utils'
import { DEFAULT_CONFIGURATION, DEFAULT_STATE, STATS_URL } from './constants'
import type { Configuration, State, JSONObject, StatResponse } from './types'

const STATE_KEY = 'widgets.npm-stats'
export class NPMStatsExtensionManager extends ExtensionManager<State, Configuration> {
  #logger: ChildLogger
  private _isFetching = false

  constructor (context: vscode.ExtensionContext) {
    super(context, STATE_KEY, DEFAULT_CONFIGURATION, DEFAULT_STATE)
    this.#logger = Logger.getChildLogger(STATE_KEY)
    this._checkWorkspaceForNPMPackage()
  }

  private async _checkWorkspaceForNPMPackage () {
    /**
     * don't check for NPM packages if
     */
    if (
      /**
       * no workspace was opened
       */
      !vscode.workspace.workspaceFolders ||
      /**
       * there are custom packages defined the VS Code configuration
       */
      this._configuration.packageNames.length !== 0
    ) {
      return
    }

    try {
      const workspacePath = vscode.workspace.workspaceFolders[0].uri
      const pkgJson = vscode.Uri.joinPath(workspacePath, 'package.json')
      const pkgJsonContent: JSONObject = JSON.parse((await vscode.workspace.fs.readFile(pkgJson)).toString())
      if (pkgJsonContent.name) {
        this.#logger.info(`Detected NPM workspace, adding ${pkgJsonContent.name as string} to the configuration`)
        await this.updateConfiguration(
          'packageNames',
          [pkgJsonContent.name as string],
          vscode.ConfigurationTarget.Workspace
        )
        this.broadcast({ packageNames: [pkgJsonContent.name as string] })
      }
    } catch (err: any) {
      return
    }
  }

  private async _loadStatistics () {
    if (this._isFetching) {
      return
    }

    this._isFetching = true
    await this.updateState('isLoading', this._isFetching)
    if (this.configuration.packageNames.length === 0) {
      await this.updateState('stats', {})
      await this.updateState('error', null)
      this._isFetching = false
      await this.updateState('isLoading', this._isFetching)
      this._tangle?.broadcast({
        stats: {},
        isLoading: false,
        error: null
      } as State & Configuration)
      return
    }

    try {
      /**
       * check if from is set after until and throw an error before making the request
       */
      if (
        this.configuration.from &&
        this.configuration.until &&
        (this.configuration.from > this.configuration.until)
      ) {
        throw new Error('The "from" time configuration can not be set after the date of "until"')
      }

      const packageParam = this.configuration.packageNames
        .map((p) => `package=${p}`)
        .join('&')
      const url = format(
        '%s?%s&from=%s&until=%s',
        STATS_URL,
        packageParam,
        formatDate(this.configuration.from || DEFAULT_CONFIGURATION.from),
        formatDate(this.configuration.until || DEFAULT_CONFIGURATION.until)
      )

      this.#logger.info(`Fetch NPM Stats from ${url}`)
      const result = await Axios.get(url).then(
        (res) => res.data as StatResponse,
        (err) => err as Error
      )

      if (result instanceof Error) {
        throw new Error(`Fetching NPM stats failed: ${(result as Error).message}`)
      }

      await this.updateState('stats', result)
      await this.updateState('error', null)
      this._isFetching = false
      await this.updateState('isLoading', this._isFetching)

      this._tangle?.broadcast({
        stats: result,
        isLoading: false,
        error: null
      } as State & Configuration)
    } catch (err: any) {
      this._isFetching = false
      await this.updateState('isLoading', this._isFetching)
      await this.updateState('error', { message: err.message } as Error)
      this._tangle?.broadcast({
        isLoading: false,
        error: { message: err.message } as Error
      } as State & Configuration)
      this.#logger.error(err.message)
    }
  }

  public setBroadcaster (tangle: Client<State & Configuration>) {
    super.setBroadcaster(tangle)
    this.on('configurationUpdate', () => this._loadStatistics())
    this._loadStatistics()
    return this
  }
}

export function activate (context: vscode.ExtensionContext) {
  const stateManager = new NPMStatsExtensionManager(context)
  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    },
  }
}
