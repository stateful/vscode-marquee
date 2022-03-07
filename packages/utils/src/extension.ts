import os from 'os';
import vscode from 'vscode';
import pick from 'lodash.pick';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import { Client } from 'tangle';
import { EventEmitter } from 'events';

import { DEFAULT_CONFIGURATION, DEFAULT_STATE, DEPRECATED_GLOBAL_STORE_KEY, EXTENSION_ID, pkg } from './constants';
import { WorkspaceType } from './types';
import type { Configuration, State, Workspace } from './types';

const NAMESPACE = '144fb8a8-7dbf-4241-8795-0dc12b8e2fb6';
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
      ...config.get<Configuration>(this._key),
      ...pick<Configuration>(oldGlobalStore as any, Object.keys(this._defaultConfiguration))
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
        config.update(
          `${this._key}.${key}`,
          this._defaultConfiguration[key as keyof Configuration],
          CONFIGURATION_TARGET
        )
      ))
    );
    await config.update(this._key, undefined, CONFIGURATION_TARGET);
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
      const id = uuidv5(path, NAMESPACE);
      return { id, name, type, path };
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
    return uuidv4();
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

export function activate (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new ExtensionManager<State, Configuration>(context, channel, 'configuration', DEFAULT_CONFIGURATION, DEFAULT_STATE);
  const aws = stateManager.getActiveWorkspace();

  /**
   * transform configurations from Marquee v2 -> v3
   */
  const oldGlobalStore = context.globalState.get<any>(DEPRECATED_GLOBAL_STORE_KEY, {});
  if (oldGlobalStore.bg) {
    stateManager.updateConfiguration('background', oldGlobalStore.bg);
  }

  /**
   * set global state to true if we don't have a workspace
   */
  if (!aws) {
    stateManager.updateState('globalScope', true);
  }

  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    }
  };
}

export function getExtProps() {
  const extProps: Record<string, string> = {};

  if (globalThis.process) {
    extProps.os = os.platform();
    extProps.platformversion = (os.release() || "").replace(
      /^(\d+)(\.\d+)?(\.\d+)?(.*)/,
      "$1$2$3"
    );
  }

  extProps.extname = EXTENSION_ID;
  extProps.extversion = pkg.version;
  if (vscode && vscode.env) {
    extProps.vscodemachineid = vscode.env.machineId;
    extProps.vscodesessionid = vscode.env.sessionId;
    extProps.vscodeversion = vscode.version;

    switch (vscode.env.uiKind) {
      case vscode.UIKind.Web:
        extProps.uikind = "web";
        break;
      case vscode.UIKind.Desktop:
        extProps.uikind = "desktop";
        break;
      default:
        extProps.uikind = "unknown";
    }
  }
  return extProps;
}

/**
 * export all helper methods that need an Node.js environment
 */
export * from './types';
export * from './constants';
