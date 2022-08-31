import vscode from 'vscode'
import Parser from 'rss-parser'
import ExtensionManager, { Logger } from '@vscode-marquee/utils/extension'

import { DEFAULT_CONFIGURATION, DEFAULT_STATE, MIN_UPDATE_INTERVAL } from './constants'
import type { Configuration, FeedItem, State } from './types'

const STATE_KEY = 'widgets.news'
const DEFAULT_HNRSS_CHANNELS = ['HN Newest', 'HN Ask', 'HN Show', 'HN Jobs', 'HN Best']
const DEPRECATED_HNRSS_URL = 'https://hnrss.org'

export class NewsExtensionManager extends ExtensionManager<State, Configuration> {
  private _parser = new Parser({ requestOptions: { headers: {} } })
  private _isFetching = false

  constructor (context: vscode.ExtensionContext) {
    super(context, STATE_KEY, DEFAULT_CONFIGURATION, DEFAULT_STATE)
    this.fetchFeeds()
    this.on('stateUpdate', () => this.fetchFeeds())

    /**
     * have default interval the minimal possible
     */
    const maxUpdateInterval = Math.max(
      this.configuration.updateInterval,
      MIN_UPDATE_INTERVAL
    )
    setInterval(() => this.fetchFeeds(), maxUpdateInterval)
  }

  async fetchFeeds () {
    if (this._isFetching) {
      return
    }

    /**
     * reset invalid hnrss feed settings
     * ToDo(Christian): remove this once no one uses v3.2.9 anymore
     */
    const feeds = Object.assign({}, this.configuration.feeds)
    if (Object.values(feeds).find((f) => f.startsWith(DEPRECATED_HNRSS_URL))) {
      for (const channel of DEFAULT_HNRSS_CHANNELS) {
        if (feeds[channel] && feeds[channel].startsWith(DEPRECATED_HNRSS_URL)) {
          delete feeds[channel]
        }
      }
      await this.updateConfiguration('feeds', feeds)
    }

    this._isFetching = true
    await this.updateState('isFetching', true)

    try {
      let url = this._configuration.feeds[this._state.channel]
      if (!url) {
        await this.updateState('channel', Object.keys(this._configuration.feeds)[0], true)
        throw new Error(
          `Channel "${this._state.channel}" not found, ` +
          `available channels are ${Object.keys(this._configuration.feeds).join(', ')}`
        )
      }

      Logger.info(`Fetch News ("${this._state.channel}") from ${url}`)
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
      }, 1000)
    }
  }
}

export function activate (context: vscode.ExtensionContext) {
  const stateManager = new NewsExtensionManager(context)
  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    },
  }
}
