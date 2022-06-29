import vscode from 'vscode'
import { format } from 'util'
import { request } from 'undici'
import ExtensionManager from '@vscode-marquee/utils/extension'
import type { Client } from 'tangle'

import { formatDate } from './utils'
import { DEFAULT_CONFIGURATION, DEFAULT_STATE, STATS_URL } from './constants'
import type { Configuration, State } from './types'

const STATE_KEY = 'widgets.npm-stats'
export class NPMStatsExtensionManager extends ExtensionManager<State, Configuration> {
  constructor (context: vscode.ExtensionContext, channel: vscode.OutputChannel) {
    super(context, channel, STATE_KEY, DEFAULT_CONFIGURATION, DEFAULT_STATE)
  }

  private async _loadStatistics () {
    await this.updateState('isLoading', true)
    if (this.configuration.packageNames.length === 0) {
      await this.updateState('stats', {})
      await this.updateState('error', null)
      await this.updateState('isLoading', false)
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
        formatDate(this.configuration.from!),
        formatDate(this.configuration.until!)
      )

      this._channel.appendLine(`Fetch NPM Stats from ${url}`)
      const { body, statusCode } = await request(url)
      const res = await body.json()

      if (statusCode !== 200) {
        throw new Error(res.message)
      }

      await this.updateState('stats', res)
      await this.updateState('isLoading', false)
      await this.updateState('error', null)

      this._tangle?.broadcast({
        stats: res,
        isLoading: false,
        error: null
      } as State & Configuration)
    } catch (err: any) {
      await this.updateState('isLoading', false)
      await this.updateState('error', { message: err.message } as Error)
      this._tangle?.broadcast({
        isLoading: false,
        error: { message: err.message } as Error
      } as State & Configuration)
    }
  }

  public setBroadcaster (tangle: Client<State & Configuration>) {
    super.setBroadcaster(tangle)
    this.on('configurationUpdate', () => this._loadStatistics())

    /**
     * load stats once webview is ready
     */
    tangle.whenReady().then(() => this._loadStatistics())
    return this
  }
}

export function activate (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new NPMStatsExtensionManager(context, channel)
  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    },
  }
}
