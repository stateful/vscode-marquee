import vscode from 'vscode';
import crypto from 'crypto';
import pick from 'lodash.pick';
import { Client } from 'tangle';
import { EventEmitter } from 'events';

import getExtProps from './getExtProps';
import { DEFAULT_CONFIGURATION, DEFAULT_STATE } from './constants';
import { WorkspaceType } from './types';
import type { Configuration, State, Workspace } from './types';

const config = vscode.workspace.getConfiguration('marquee');
const CONFIGURATION_TARGET = vscode.ConfigurationTarget.Global;

export default class ExtensionManager<State, Configuration> extends EventEmitter implements vscode.Disposable {
  protected _tangle?: Client<State & Configuration>;
  protected _state: State;
  protected _configuration: Configuration;
  protected _disposables: vscode.Disposable[] = [];

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

  updateConfiguration <T extends keyof Configuration = keyof Configuration>(prop: T, val: Configuration[T]) {
    this._channel.appendLine(`Update configuration "${prop}": ${val}`);
    this._configuration[prop] = val;
    config.update(`${this._key}.${prop}`, val, CONFIGURATION_TARGET);
  }

  updateState <T extends keyof State = keyof State>(prop: T, val: State[T]) {
    this._channel.appendLine(`Update state "${prop}": ${val}`);
    this._state[prop] = val;
    this._context.globalState.update(this._key, this._state);
  }

  /**
   * clear state and configuration of widget
   */
  public clear () {
    this._state = { ...this._defaultState };
    Object.keys(this._defaultState).forEach(
      (k) => this._context.globalState.update(k, this._defaultState[k as keyof State]));
    this._configuration = { ...this._defaultConfiguration };
    config.update(this._key, {}, CONFIGURATION_TARGET);

    if (this._tangle) {
      this._tangle.broadcast({ ...this._state, ...this._configuration });
    }
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

  public generateId (): string {
    const buf = Buffer.alloc(20);
    return crypto.randomFillSync(buf).toString("hex");
  }

  public dispose () {
    this.clear();
    delete this._tangle;
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
