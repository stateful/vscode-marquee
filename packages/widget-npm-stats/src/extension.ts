import vscode from 'vscode'
import { request } from 'undici'
import ExtensionManager from '@vscode-marquee/utils/extension'

import { DEFAULT_CONFIGURATION, DEFAULT_STATE, STATS_URL } from './constants'
import type { Configuration, State } from './types'

const STATE_KEY = 'widgets.npm-stats'
const ONE_YEAR = 1000 * 60 * 60 * 24 * 365
const UNTIL = (new Date()).toISOString().split('T')[0]
const FROM = (new Date(Date.now() - ONE_YEAR)).toISOString().split('T')[0]

export class NPMStatsExtensionManager extends ExtensionManager<State, Configuration> {
  constructor (context: vscode.ExtensionContext, channel: vscode.OutputChannel) {
    super(context, channel, STATE_KEY, DEFAULT_CONFIGURATION, DEFAULT_STATE)
    this._loadStatistics()
  }

  private async _loadStatistics () {
    await this.updateState('isLoading', true)

    if (this.configuration.packageNames.length === 0) {
      await this.updateState('isLoading', false)
      return
    }

    try {
      const packageParam = this.configuration.packageNames
        .map((p) => `package=${p}`)
        .join('&')
      const { body, statusCode } = await request(`${STATS_URL}?${packageParam}&from=${FROM}&until=${UNTIL}`)

      const res = await body.json()

      if (statusCode !== 200) {
        throw new Error(res.message)
      }

      await this.updateState('stats', res)
      await this.updateState('isLoading', false)
      await this.updateState('error', null)
    } catch (err: any) {
      await this.updateState('isLoading', false)
      await this.updateState('error', { message: err.message } as Error)
    }
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
