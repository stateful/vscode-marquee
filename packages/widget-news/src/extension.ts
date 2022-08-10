import vscode from 'vscode'
import Parser from 'rss-parser'
import ExtensionManager from '@vscode-marquee/utils/extension'

import { DEFAULT_CONFIGURATION, DEFAULT_STATE } from './constants'
import type { Configuration, FeedItem, State } from './types'

const STATE_KEY = 'widgets.news'
export class NewsExtensionManager extends ExtensionManager<State, Configuration> {
  private _parser = new Parser()
  private _isFetching = false

  constructor (context: vscode.ExtensionContext, channel: vscode.OutputChannel) {
    super(context, channel, STATE_KEY, DEFAULT_CONFIGURATION, DEFAULT_STATE)
    this.fetchFeeds()
    this.on('stateUpdate', () => this.fetchFeeds())
    setInterval(() => this.fetchFeeds(), this.configuration.updateInterval)
  }

  async fetchFeeds () {
    if (this._isFetching) {
      return
    }

    this._isFetching = true
    await this.updateState('isFetching', true)

    try {
      const url = this._configuration.feeds[this._state.channel]
      if (!url) {
        throw new Error(
          `Channel "${this._state.channel}" not found, ` +
          `available channels are ${Object.keys(this._configuration.feeds).join(', ')}`
        )
      }

      this._channel.appendLine(`Fetch News ("${this._state.channel}") from ${url}`)
      const feed = await this._parser.parseURL(url)

      await this.updateState('news', feed.items as FeedItem[])
      await this.updateState('isFetching', false)
      await this.updateState('error', null)
      this._tangle?.broadcast({
        news: feed.items,
        isFetching: false,
        error: null
      } as State & Configuration)
      setTimeout(() => { this._isFetching = false }, 100)
    } catch (err: any) {
      await this.updateState('isFetching', false)
      await this.updateState('error', err.message as string)
      this._tangle?.broadcast({
        news: [] as FeedItem[],
        isFetching: false,
        error: err.message
      } as State & Configuration)

      setTimeout(() => {
        this._tangle?.broadcast({ isFetching: false } as State & Configuration)
        this._isFetching = false
      }, 100)
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
