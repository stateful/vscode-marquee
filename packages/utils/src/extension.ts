import vscode from 'vscode';
import crypto from 'crypto';
import pick from 'lodash.pick';
import { Client } from 'tangle';
import { EventEmitter } from 'events';

import getExtProps from './getExtProps';
import { DEFAULT_CONFIGURATION, DEFAULT_STATE } from './constants';
import { WorkspaceType } from './types';
import type { Configuration, State, Workspace } from './types';

const DEPRECATED_GLOBAL_STORE_KEY = 'persistence';
const CONFIGURATION_TARGET = vscode.ConfigurationTarget.Global;

export default class ExtensionManager<State, Configuration> extends EventEmitter implements vscode.Disposable {
  protected _tangle?: Client<State & Configuration>;
  protected _state: State;
  protected _configuration: Configuration;
  protected _disposables: vscode.Disposable[] = [
    vscode.workspace.onDidChangeConfiguration(this._onConfigChange.bind(this))
  ];
  protected _subscriptions: { unsubscribe: Function }[] = [];
  private _stopListenOnChangeEvents = false;

  constructor (
    protected _context: vscode.ExtensionContext,
    protected _channel: vscode.OutputChannel,
    private _key: string,
    private _defaultConfiguration: Configuration,
    private _defaultState: State
  ) {
    super();
    const config = vscode.workspace.getConfiguration('marquee');

    const oldGlobalStore = this._context.globalState.get<object>(DEPRECATED_GLOBAL_STORE_KEY, {});
    this._state = {
      ...this._defaultState,
      ...pick(oldGlobalStore, Object.keys(this._defaultState)),
      ...this._context.globalState.get<State>(this._key)
    };

    /**
     * preserve state across different machines
     */
    this._context.globalState.setKeysForSync(Object.keys(this._defaultState));

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

  set stopListenOnChangeEvents (val: boolean) {
    this._stopListenOnChangeEvents = val;
  }

  private _onConfigChange (event: vscode.ConfigurationChangeEvent) {
    /**
     * if the change was triggered by the user through the UI we don't
     * need to act on it because the config change will be already
     * executed
     */
    if (this._stopListenOnChangeEvents) {
      return false;
    }

    for (const configKey of Object.keys(this.configuration)) {
      if (!event.affectsConfiguration(`marquee.${this._key}.${configKey}`)) {
        continue;
      }

      const config = vscode.workspace.getConfiguration('marquee');
      const prop = configKey as keyof Configuration;
      const val = config.get(`${this._key}.${configKey}`) as Configuration[keyof Configuration];
      this._channel.appendLine(`Update configuration via configuration listener "${prop}": ${val}`);
      this._configuration[prop] = val;
      this.broadcast({ [prop]: val } as any);
      break;
    }

    return true;
  }

  protected broadcast (payload: Partial<State & Configuration>) {
    if (!this._tangle) {
      return;
    }

    this._tangle.broadcast(payload as State & Configuration);
  }

  async updateConfiguration <T extends keyof Configuration = keyof Configuration>(prop: T, val: Configuration[T]) {
    const config = vscode.workspace.getConfiguration('marquee');
    this._channel.appendLine(`Update configuration "${prop}": ${val}`);
    this._configuration[prop] = val;
    await config.update(`${this._key}.${prop}`, val, CONFIGURATION_TARGET);
  }

  async updateState <T extends keyof State = keyof State>(prop: T, val: State[T]) {
    this._channel.appendLine(`Update state "${prop}": ${val}`);
    this._state[prop] = val;
    await this._context.globalState.update(this._key, this._state);
    this.emit('stateUpdate', this._state);
  }

  /**
   * clear state and configuration of widget
   */
  public async clear () {
    const config = vscode.workspace.getConfiguration('marquee');
    this._state = { ...this._defaultState };
    await this._context.globalState.update(this._key, this._state);
    await this._context.globalState.update(DEPRECATED_GLOBAL_STORE_KEY, undefined);
    this.emit('stateUpdate', this._state);

    this._configuration = { ...this._defaultConfiguration };
    await Promise.all(
      Object.keys(this._defaultConfiguration).map((key) => (
        config.update(`${this._key}.${key}`, undefined, CONFIGURATION_TARGET)
      ))
    );
    await config.update(this._key, undefined, CONFIGURATION_TARGET);

    /**
     * after we deleted the current configuration, we have to update the
     * object with the default value set in the extension package definition
     * to get its default value from there
     */
    await Promise.all(Object.keys(this._defaultConfiguration).map((key) => {
      type ConfigKey = keyof typeof this._defaultConfiguration;
      const configKey = key as ConfigKey;
      const trueDefault = config.get(`${this._key}.${key}`) as Configuration[ConfigKey] || this._defaultConfiguration[configKey];
      this._configuration[configKey] = trueDefault;
      return config.update(`${this._key}.${key}`, trueDefault, CONFIGURATION_TARGET);
    }));
  }

  /**
   * get current opened workspace
   * @returns workspace object or null if no workspace is opened
   */
  public getActiveWorkspace(): Workspace | null {
    const wsp = vscode.workspace;
    let name = wsp.name || "";
    let path = "";
    let type = WorkspaceType.NONE;

    if (wsp.workspaceFile) {
      type = WorkspaceType.WORKSPACE;
      path = wsp.workspaceFile.path;
    } else if (wsp.workspaceFolders) {
      type = WorkspaceType.FOLDER;
      path =
        wsp.workspaceFolders.length > 0 ? wsp.workspaceFolders[0].uri.path : "";
    }

    if (type && path) {
      const shasum = crypto.createHash("sha1");
      const id = shasum.update(path, "utf8").digest("hex");
      const nws: Workspace = { id, name, type, path };

      return nws;
    }

    return null;
  }

  /**
   * get text selection
   * @param editor vscode.TextEditor
   * @returns selected text
   */
  public getTextSelection(editor: vscode.TextEditor) {
    const textRange = new vscode.Range(
      editor.selection.start.line,
      editor.selection.start.character,
      editor.selection.end.line,
      editor.selection.end.character
    );

    const hier = editor.document.uri.path.split("/");
    const text = editor.document.getText(textRange);
    const name = hier[hier.length - 1];
    const path = `${editor.document.uri.path}:${editor.selection.start.line}`;
    const lang = editor.document.languageId;
    return { text, path, name, lang };
  }

  public setBroadcaster (tangle: Client<State & Configuration>) {
    this._tangle = tangle;

    /**
     * listen on configuration changes
     */
    for (const configProp of Object.keys(this._defaultConfiguration)) {
      const c = configProp as keyof Configuration;
      this._subscriptions.push(this._tangle.listen(c, (val) => this.updateConfiguration(c, val)));
    }

    /**
     * listen on state changes
     */
    for (const stateProp of Object.keys(this._defaultState)) {
      const s = stateProp as keyof State;
      this._subscriptions.push(this._tangle.listen(s, (val) => this.updateState(s, val)));
    }

    return this;
  }

  public generateId (): string {
    const buf = Buffer.alloc(20);
    return crypto.randomFillSync(buf).toString("hex");
  }

  reset () {
    if (this._tangle) {
      this._subscriptions.forEach((s) => s.unsubscribe());
      this._tangle.removeAllListeners();
      delete this._tangle;
    }
  }

  dispose () {
    this._disposables.forEach((d) => d.dispose());
    this.reset();
  }
}

function activate (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new ExtensionManager<State, Configuration>(context, channel, 'configuration', DEFAULT_CONFIGURATION, DEFAULT_STATE);

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
export { getExtProps, activate };
export * from './types';
