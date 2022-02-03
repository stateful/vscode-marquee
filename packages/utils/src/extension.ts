import vscode from 'vscode';
import pick from 'lodash.pick';
import { Client } from 'tangle';
import { EventEmitter } from 'events';

import getExtProps from './getExtProps';
import { DEFAULT_CONFIGURATION, DEFAULT_STATE } from './constants';
import type { Configuration, State } from './types';

const config = vscode.workspace.getConfiguration('marquee');

export default class ExtensionManager<State, Configuration> extends EventEmitter implements vscode.Disposable {
  protected _tangle?: Client<State & Configuration>;
  protected _state: State;
  protected _configuration: Configuration;

  constructor (
    protected _context: vscode.ExtensionContext,
    protected _channel: vscode.OutputChannel,
    private _key: string,
    private _defaultConfiguration: Configuration,
    private _defaultState: State
  ) {
    super();

    const oldGlobalStore = this._context.globalState.get<object>('persistence', {});
    this._state = {
      ...this._defaultState,
      ...pick(oldGlobalStore, Object.keys(this._defaultState)),
      ...this._context.globalState.get<State>(this._key)
    };
    this._configuration = {
      ...this._defaultConfiguration,
      ...pick<Configuration>(oldGlobalStore as any, Object.keys(this._defaultConfiguration)),
      ...config.get<Configuration>(this._key)
    };
  }

  get state () {
    return this._state;
  }

  get configuration () {
    return this._configuration;
  }

  updateConfiguration <T extends keyof Configuration>(prop: T, val: Configuration[T]) {
    this._channel.appendLine(`Update configuration "${prop}": ${val}`);
    this._configuration[prop] = val;
    config.update(`${this._key}.${prop}`, val, vscode.ConfigurationTarget.Global);
  }

  updateState <T extends keyof State>(prop: T, val: State[T]) {
    this._channel.appendLine(`Update state "${prop}": ${val}`);
    this._state[prop] = val;
    this._context.globalState.update(this._key, this._state);
  }

  setBroadcaster (tangle: Client<State & Configuration>) {
    this._tangle = tangle;
    this._tangle.broadcast({ ...this._state, ...this._configuration });

    /**
     * listen on configuration changes
     */
    for (const configProp of Object.keys(this._defaultConfiguration)) {
      const c = configProp as keyof Configuration;
      this._tangle.listen(c, (val) => this.updateConfiguration(c, val));
    }

    /**
     * listen on state changes
     */
    for (const stateProp of Object.keys(this._defaultState)) {
      const s = stateProp as keyof State;
      this._tangle.listen(s, (val) => this.updateState(s, val));
    }
  }

  dispose() {
    delete this._tangle;
  }
}

class GlobalExtensionManager extends ExtensionManager<State, Configuration> {
  constructor (
    context: vscode.ExtensionContext,
    channel: vscode.OutputChannel
  ) {
    super(context, channel, 'configuration', DEFAULT_CONFIGURATION, DEFAULT_STATE);
  }
}

function activate (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new GlobalExtensionManager(context, channel);

  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    }
  };
}

/**
 * export all helper methods that need an Node.js environment
 */
export { getExtProps, GlobalExtensionManager, activate };
export * from './types';
