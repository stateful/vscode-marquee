import vscode from 'vscode'
import Axios, { AxiosRequestConfig } from 'axios'
import ExtensionManager from '@vscode-marquee/utils/extension'
import { Client } from 'tangle'

import { DEFAULT_STATE } from './constants'
import type { State, Events, Configuration, Trick } from './types'

declare const BACKEND_BASE_URL: string

const STATE_KEY = 'widgets.welcome'
const FETCH_INTERVAL = process.env.NODE_ENV === 'development'
  ? 1000 * 5 // 5s
  : 5 * 1000 * 60 // 5min
const config = vscode.workspace.getConfiguration('marquee')
let i = 0

class StateManager extends ExtensionManager<State & Events, Configuration> {
  private _interval: NodeJS.Timeout
  private _prevtricks?: Trick[]

  constructor (
    context: vscode.ExtensionContext,
    channel: vscode.OutputChannel
  ) {
    super(context, channel, STATE_KEY, {}, DEFAULT_STATE as State & Events)
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
    this._channel.appendLine(`Fetching ${url}`)
    const result = await Axios.get(url, this._getRequestOptions()).then(
      (res) => res.data as Trick[],
      (err) => err as Error
    )

    if (result instanceof Error) {
      this._channel.appendLine(`Error fetching tricks: ${result.message}`)
      return this.broadcast({ error: result })
    }

    this._channel.appendLine(
      `---> [${++i}] ${JSON.stringify(result)} - but ${this._prevtricks?.length.toString() || 'undefined'}`)
    if (this._prevtricks && this._prevtricks.length < result.length) {
      const newTrick = result.slice(this._prevtricks.length)
        .filter((trick) => trick.notify && trick.active)
        .pop()

      if (newTrick) {
        this._channel.appendLine(`Notify new trick: ${newTrick.title}`)
        vscode.window
          .showInformationMessage(newTrick.title, 'Learn more')
          .then(() => this.emit('gui.open'))
      }
    }

    /**
     * only broadcast if we haven't before or a new trick was received
     */
    if (!this._prevtricks || this._prevtricks.length < result.length) {
      this._prevtricks = result
      this._channel.appendLine(`Broadcast ${result.length} tricks`)
      this.broadcast({ error: null, tricks: result })
    }
  }

  private _upvoteTrick (id: string) {
    this._channel.appendLine(`Upvote trick with id: ${id}`)
    return Axios.post(
      `${this.backendUrl}/voteTrick`,
      { op: 'upvote', id },
      this._getRequestOptions()
    ).catch((err) => vscode.window.showErrorMessage('Failed to upvote trick!', err.message))
  }

  setBroadcaster (tangle: Client<State & Events>) {
    super.setBroadcaster(tangle)
    this.fetchData()
    tangle.on('upvote', this._upvoteTrick.bind(this))
    return this
  }

  dispose () {
    super.dispose()
    clearInterval(this._interval)
  }
}

let stateManager: StateManager
export function activate (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  stateManager = new StateManager(context, channel)

  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    }
  }
}
