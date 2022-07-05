import vscode from 'vscode'
import { read } from 'feed-reader'
import ExtensionManager from '@vscode-marquee/utils/extension'

import { DEFAULT_CONFIGURATION, DEFAULT_STATE } from './constants'
import type { Configuration, State } from './types'

const STATE_KEY = 'widgets.news'
export class NewsExtensionManager extends ExtensionManager<State, Configuration> {
  constructor (context: vscode.ExtensionContext, channel: vscode.OutputChannel) {
    super(context, channel, STATE_KEY, DEFAULT_CONFIGURATION, DEFAULT_STATE)
    this.fetchFeeds()
  }

  async fetchFeeds () {
    console.log('GO IN HERE')

    await this.updateState('isFetching', true)

    try {
      const url = this._configuration.feeds[this._state.channel]
      if (!url) {
        throw new Error(
          `Channel "${this._state.channel}" to found, ` +
          `available channels are ${Object.keys(this._configuration.feeds).join(', ')}`
        )
      }

      this._channel.appendLine(`Fetch News ("${this._state.channel}") from ${url}`)
      const feed = await read(url)

      console.log('SEND IT')

      await this.updateState('news', feed.entries)
      await this.updateState('isFetching', false)
      await this.updateState('error', undefined)
      console.log('SOO', this._state)

    } catch (err: any) {
      console.log('UPS')
      await this.updateState('isFetching', false)
      await this.updateState('error', { message: err.message } as Error)
    }
  }
}

export function activate (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new NewsExtensionManager(context, channel)
  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    },
  }
}
