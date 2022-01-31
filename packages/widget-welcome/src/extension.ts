import { EventEmitter } from 'events';
import vscode from 'vscode';
import Axios, { AxiosRequestConfig } from 'axios';
import { getExtProps } from '@vscode-marquee/utils';

import { Client } from 'tangle';
import type { State, Trick, Storage } from './types';

declare const BACKEND_BASE_URL: string;

const FETCH_INTERVAL = process.env.NODE_ENV === "development"
  ? 1000 * 5 // 5s
  : 5 * 1000 * 60; // 5min
const config = vscode.workspace.getConfiguration('marquee');

class StateManager extends EventEmitter implements vscode.Disposable {
  private _tangle?: Client<State>;
  private _interval: NodeJS.Timeout;
  private _prevtricks?: Trick[];

  constructor (
    private _context: vscode.ExtensionContext,
    private _channel: vscode.OutputChannel
  ) {
    super();
    this.fetchData();
    this._interval = setInterval(this.fetchData.bind(this), FETCH_INTERVAL);
  }

  get backendUrl () {
    return process.env.NODE_ENV === 'test' ? 'http://test' : BACKEND_BASE_URL;
  }

  /**
   * broadcast to webview if available
   * @param state to broadcast
   */
  broadcast (state: Partial<State>) {
    this.emit('state', state);

    if (!this._tangle) {
      return;
    }

    this._tangle.broadcast(state as State);
  }

  /**
   * Make sure we have set proper proxy settings
   * @returns AxiosRequestConfig
   */
  private _getRequestOptions() {
    const pref: any = config.get('configuration');
    const options: AxiosRequestConfig = {};

    if (pref?.proxy) {
      const p = new URL(pref.proxy);
      options.proxy = {
        protocol: p.protocol,
        host: p.hostname,
        port: parseInt(p.port),
        auth: {
          username: p.username,
          password: p.password
        }
      };
    }

    return options;
  }

  /**
   * fetch data and broadcast them across the Marquee app
   */
  async fetchData () {
    const url = `${this.backendUrl}/getTricks`;
    const persistedData = this._context.globalState.get<Storage>('persistence', {} as Storage);
    this._channel.appendLine(`Fetching ${url}`);
    const result = await Axios.get(url, this._getRequestOptions()).then(
      (res) => res.data as Trick[],
      (err) => err as Error
    );

    if (result instanceof Error) {
      this._channel.appendLine(`Error fetching tricks: ${result.message}`);
      return this.broadcast({ error: result });
    }

    if (this._prevtricks && this._prevtricks.length < result.length) {
      const newTrick = result.slice(this._prevtricks.length)
        .filter((trick) => trick.notify && trick.active)
        .pop();

      if (newTrick) {
        this._channel.appendLine(`Notify new trick: ${newTrick.title}`);
        vscode.window
          .showInformationMessage(newTrick.title, "Learn more")
          .then(() => this.emit('gui.open'));
      }
    }

    this._prevtricks = result;
    this.broadcast({
      tricks: result,
      read: persistedData.read,
      liked: persistedData.liked,
      error: undefined
    });
  }

  private _upvoteTrick (id: string) {
    this._channel.appendLine(`Upvote trick with id: ${id}`);
    return Axios.post(
      `${this.backendUrl}/voteTrick`,
      { op: 'upvote', id, props: JSON.stringify(getExtProps(this._context)) },
      this._getRequestOptions()
    ).catch((err) => vscode.window.showErrorMessage('Failed to upvote trick!', err.message));
  }

  setBroadcaster (tangle: Client<State>) {
    this.fetchData();
    this._tangle = tangle;
    this._tangle.on('upvote', this._upvoteTrick.bind(this));
    return this;
  }

  dispose() {
    clearInterval(this._interval);
    delete this._tangle;
  }
}

let stateManager: StateManager;
export function activate (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  stateManager = new StateManager(context, channel);

  return {
    marquee: {
      disposable: stateManager,
      setup: stateManager.setBroadcaster.bind(stateManager)
    }
  };
}
