import vscode from 'vscode'
import Axios, { AxiosRequestConfig } from 'axios'
import axiosRetry from 'axios-retry'
import ExtensionManager, { Logger, ChildLogger } from '@vscode-marquee/utils/extension'
import { Client } from 'tangle'

import { DEFAULT_STATE } from './constants'
import type { State, Events, Configuration, Trick } from './types'

declare const BACKEND_BASE_URL: string

const STATE_KEY = 'widgets.welcome'
const FETCH_INTERVAL = 5 * 1000 * 60 // 5min
const AXIOS_RETRIES = process.env.NODE_ENV === 'development'
  ? 1
  : 10
const config = vscode.workspace.getConfiguration('marquee')
axiosRetry(Axios, { retries: AXIOS_RETRIES, retryDelay: axiosRetry.exponentialDelay })

class StateManager extends ExtensionManager<State & Events, Configuration> {
  #logger: ChildLogger

  private _interval: NodeJS.Timeout
  private _prevtricks?: Trick[]
  private _retainTricks: boolean = false

  constructor (context: vscode.ExtensionContext) {
    super(context, STATE_KEY, {}, DEFAULT_STATE as State & Events)
    this.#logger = Logger.getChildLogger(STATE_KEY)
    this.fetchData()
    this._interval = setInterval(this.fetchData.bind(this), FETCH_INTERVAL)
  }

  get backendUrl () {
    return process.env.NODE_ENV === 'test' ? 'http://test' : BACKEND_BASE_URL
  }

  /**
   * broadcast to webview if available
   * @param state to broadcast
   */
  broadcast (state: Partial<State & Events>) {
    this.emit('state', state)

    if (!this._tangle) {
      return
    }

    this._tangle.broadcast(state as State & Events)
  }

  /**
   * Make sure we have set proper proxy settings
   * @returns AxiosRequestConfig
   */
  private _getRequestOptions () {
    const pref: any = config.get('configuration')
    const options: AxiosRequestConfig = {}

    if (pref?.proxy) {
      const p = new URL(pref.proxy)
      options.proxy = {
        protocol: p.protocol,
        host: p.hostname,
        port: parseInt(p.port),
        auth: {
          username: p.username,
          password: p.password
        }
      }
    }

    return options
  }

  /**
   * fetch data and broadcast them across the Marquee app
   */
  async fetchData () {
    const url = `${this.backendUrl}/getTricks`
    this.#logger.info(`Fetching ${url}`)
    const result = await Axios.get(url, this._getRequestOptions()).then(
      (res) => res.data as Trick[],
      (err) => err as Error
    )

    if (result instanceof Error) {
      this.#logger.error(`Error fetching tricks: ${result.message}`)
      return this.broadcast({ error: result })
    }

    if (this._prevtricks && this._prevtricks.length < result.length) {
      const newTrick = result.slice(this._prevtricks.length)
        .filter((trick) => trick.notify && trick.active)
        .pop()

      if (newTrick) {
        this.#logger.info(`Notify new trick: ${newTrick.title}`)
        vscode.window
          .showInformationMessage(newTrick.title, 'Learn more')
          .then(() => this.emit('gui.open'))
      }
    }

    /**
     * only broadcast if we haven't before or a new trick was received
     */
    const prevTrickIds = new Set(this._prevtricks?.map((trick) => trick.id) ?? [])
    const netNewTrickIds = new Set(result.filter(resTrick => !prevTrickIds.has(resTrick.id)))
    if (this._retainTricks && (!this._prevtricks || netNewTrickIds.size > 0)) {
      this._prevtricks = result
      this.#logger.info(`Broadcast ${result.length} tricks`)
      this.broadcast({ error: null, tricks: result })
    }
  }

  private _upvoteTrick (id: string) {
    this.#logger.info(`Upvote trick with id: ${id}`)
    return Axios.post(
      `${this.backendUrl}/voteTrick`,
      { op: 'upvote', id },
      this._getRequestOptions()
    ).catch((err) => vscode.window.showErrorMessage('Failed to upvote trick!', err.message))
  }

  setBroadcaster (tangle: Client<State & Events>) {
    super.setBroadcaster(tangle)
    tangle.whenReady().then(() => {
      this._retainTricks = true
      return this.fetchData()
    })
    tangle.on('upvote', this._upvoteTrick.bind(this))
    return this
  }

  dispose () {
    super.dispose()
    clearInterval(this._interval)
  }
}

let stateManager: StateManager
export function activate (context: vscode.ExtensionContext) {
  stateManager = new StateManager(context)

  // don't allow errors to be recovered from default state
  const defaultState = stateManager.state
  if (defaultState.error) {
    defaultState.error = null
  }

  return {
    marquee: {
      disposable: stateManager,
      defaultState,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    }
  }
}
