import os from 'os'
import vscode from 'vscode'
import pick from 'lodash.pick'
import hash from 'object-hash'
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid'
import { Client } from 'tangle'
import { EventEmitter } from 'events'

import { GitProvider } from './provider/git'
import { DEFAULT_CONFIGURATION, DEFAULT_STATE, DEPRECATED_GLOBAL_STORE_KEY, EXTENSION_ID, pkg } from './constants'
import { WorkspaceType, ProjectItem } from './types'
import type { Configuration, State, Workspace } from './types'

const LINE_CHECK_RANGE = 10
const NAMESPACE = '144fb8a8-7dbf-4241-8795-0dc12b8e2fb6'
const CONFIGURATION_TARGET = vscode.ConfigurationTarget.Global
const TELEMETRY_CONFIG_ID = 'telemetry'
const TELEMETRY_CONFIG_ENABLED_ID = 'enableTelemetry'

export default class ExtensionManager<State, Configuration> extends EventEmitter implements vscode.Disposable {
  protected _tangle?: Client<State & Configuration>
  protected _state: State
  protected _configuration: Configuration
  protected _disposables: vscode.Disposable[] = [
    vscode.workspace.onDidChangeConfiguration(this._onConfigChange.bind(this))
  ]
  protected _gitProvider: GitProvider
  protected _subscriptions: { unsubscribe: Function }[] = []
  private _isConfigUpdateListenerDisabled = false
  private _isImportInProgress = false

  constructor (
    protected _context: vscode.ExtensionContext,
    protected _channel: vscode.OutputChannel,
    protected _key: string,
    private _defaultConfiguration: Configuration,
    private _defaultState: State
  ) {
    super()
    this._gitProvider = this._context.subscriptions.find((s) => s instanceof GitProvider) as GitProvider
    const config = vscode.workspace.getConfiguration('marquee')

    const oldGlobalStore = this._context.globalState.get<object>(DEPRECATED_GLOBAL_STORE_KEY, {})
    this._state = {
      ...this._defaultState,
      ...pick(oldGlobalStore, Object.keys(this._defaultState)),
      ...this._context.globalState.get<State>(this._key)
    }

    /**
     * preserve state across different machines
     */
    this._context.globalState.setKeysForSync(Object.keys(this._defaultState))

    this._configuration = {
      ...this._defaultConfiguration,
      ...config.get<Configuration>(this._key),
      ...pick<Configuration>(oldGlobalStore as any, Object.keys(this._defaultConfiguration))
    }
  }

  get state () {
    return this._state
  }

  get configuration () {
    return this._configuration
  }

  public setImportInProgress (inProgress = true) {
    this._isImportInProgress = inProgress
  }

  private _onConfigChange (event: vscode.ConfigurationChangeEvent) {
    if (this._isConfigUpdateListenerDisabled || this._isImportInProgress) {
      return
    }

    for (const configKey of Object.keys(this.configuration)) {
      const prop = configKey as keyof Configuration

      /**
       * don't apply config updates for modes (handled in GUIExtensionManager) and configurations
       * that were not affected by the change event
       */
      if (prop === 'modes' || !event.affectsConfiguration(`marquee.${this._key}.${configKey}`)) {
        continue
      }

      const config = vscode.workspace.getConfiguration('marquee')
      const val = config.get(`${this._key}.${configKey}`) as Configuration[keyof Configuration]
      /**
       * don't propagate updates if changes are already updated
       */
      if (
        typeof val !== 'undefined' &&
        typeof this._configuration[prop] !== 'undefined' &&
        hash(this._configuration[prop]) === hash(val)
      ) {
        continue
      }

      this._channel.appendLine(
        `Update configuration via configuration listener "${prop.toString()}": ${val as any as string}`
      )
      this.broadcast({ [prop]: val } as any)
      this.emit('configurationUpdate', this._configuration)
      break
    }

    return true
  }

  protected broadcast (payload: Partial<State & Configuration>) {
    if (!this._tangle) {
      return
    }

    this._tangle.broadcast(payload as State & Configuration)
  }

  async updateConfiguration <T extends keyof Configuration = keyof Configuration>(
    prop: T,
    val: Configuration[T],
    target = CONFIGURATION_TARGET
  ) {
    this._isConfigUpdateListenerDisabled = true

    /**
     * check if we have to update
     */
    if (
      typeof val !== 'undefined' &&
      typeof this._configuration[prop] !== 'undefined' &&
      hash(this._configuration[prop]) === hash(val)
    ) {
      this._isConfigUpdateListenerDisabled = false
      return
    }

    const config = vscode.workspace.getConfiguration('marquee')
    this._channel.appendLine(`Update configuration "${prop.toString()}": ${val as any as string}`)
    this._configuration[prop] = val
    await config.update(`${this._key}.${prop.toString()}`, val, target)
    this.emit('configurationUpdate', this._configuration)
    this._isConfigUpdateListenerDisabled = false
  }

  /**
   * Update extension state
   * @param prop state property name
   * @param val new state property value
   * @param broadcastState set to true if you want to broadcast this state change
   *                       (only needed when updating state from the extension host)
   */
  async updateState <T extends keyof State = keyof State>(prop: T, val: State[T], broadcastState?: boolean) {
    /**
     * check if we have to update
     */
    if (
      typeof val !== 'undefined' &&
      typeof this._state[prop] !== 'undefined' &&
      hash(this._state[prop]) === hash(val)
    ) {
      return
    }

    this._channel.appendLine(`Update state "${prop.toString()}": ${val as any as string}`)
    this._state[prop] = val
    await this.emitStateUpdate(broadcastState)
  }

  async emitStateUpdate (broadcastState?: boolean) {
    await this._context.globalState.update(this._key, this._state)
    this.emit('stateUpdate', this._state)
    if (broadcastState && this._tangle) {
      this._tangle.broadcast(this._state as State & Configuration)
    }
  }

  /**
   * clear state and configuration of widget
   */
  public async clear () {
    this._isConfigUpdateListenerDisabled = true

    const config = vscode.workspace.getConfiguration('marquee')
    this._state = { ...this._defaultState }
    await this._context.globalState.update(this._key, this._state)
    await this._context.globalState.update(DEPRECATED_GLOBAL_STORE_KEY, undefined)
    this.emit('stateUpdate', this._state)

    this._configuration = { ...this._defaultConfiguration }
    await Promise.all(
      Object.keys(this._defaultConfiguration).map((key) => (
        config.update(
          `${this._key}.${key}`,
          this._defaultConfiguration[key as keyof Configuration],
          CONFIGURATION_TARGET
        )
      ))
    )
    await config.update(this._key, undefined, CONFIGURATION_TARGET)
    this._isConfigUpdateListenerDisabled = false
  }

  /**
   * get current opened workspace
   * @returns workspace object or null if no workspace is opened
   */
  public getActiveWorkspace (): Workspace | null {
    const wsp = vscode.workspace
    let name = wsp.name || ''
    let path = ''
    let type = WorkspaceType.NONE

    if (wsp.workspaceFile) {
      type = WorkspaceType.WORKSPACE
      path = wsp.workspaceFile.path
    } else if (wsp.workspaceFolders) {
      type = WorkspaceType.FOLDER
      path =
        wsp.workspaceFolders.length > 0 ? wsp.workspaceFolders[0].uri.path : ''
    }

    if (type && path) {
      const id = uuidv5(path, NAMESPACE)
      return { id, name, type, path }
    }

    return null
  }

  /**
   * get text selection
   * @param editor vscode.TextEditor
   * @returns selected text
   */
  public getTextSelection (editor: vscode.TextEditor) {
    const textRange = new vscode.Range(
      editor.selection.start.line,
      editor.selection.start.character,
      editor.selection.end.line,
      editor.selection.end.character
    )

    const hier = editor.document.uri.path.split('/')
    const text = editor.document.getText(textRange)
    const name = hier[hier.length - 1]
    const path = `${editor.document.uri.path}:${editor.selection.start.line}`
    const lang = editor.document.languageId
    return { text, path, name, lang }
  }

  public setBroadcaster (tangle: Client<State & Configuration>) {
    this._tangle = tangle
    this._tangle.on<any>('clear', this.clear.bind(this))

    /**
     * listen on configuration changes
     */
    for (const configProp of Object.keys(this._defaultConfiguration)) {
      const c = configProp as keyof Configuration
      this._subscriptions.push(this._tangle.listen(c, (val) => this.updateConfiguration(c, val)))
    }

    /**
     * listen on state changes
     */
    for (const stateProp of Object.keys(this._defaultState)) {
      const s = stateProp as keyof State
      this._subscriptions.push(this._tangle.listen(s, (val) => this.updateState(s, val)))
    }

    return this
  }

  public generateId (): string {
    return uuidv4()
  }

  getItemsWithReference (itemName: 'todos' | 'snippets' | 'notes'): ProjectItem[] {
    const ws = this.getActiveWorkspace()
    return (this.state[itemName as keyof State] as Array<ProjectItem>)
      // only watch files that have todos in current workspace
      .filter((t) => Boolean(t.path) && ws && ws.id === t.workspaceId)
  }

  protected async _onFileChange (itemName: 'todos' | 'snippets' | 'notes', uri: vscode.Uri) {
    const content = (await vscode.workspace.fs.readFile(uri)).toString().split('\n')
    const itemsInFile = this.getItemsWithReference(itemName).filter((t) => uri.path.endsWith(t.path!.split(':')[0]))

    this._channel.appendLine(`Found ${itemsInFile.length} ${itemName} connected to updated file`)
    fileLoop:
    for (const item of itemsInFile) {
      const lineNumber = parseInt(item.path!.split(':').pop()!, 10)

      /**
       * notes have markdown support and might start with <p>
       */
      const itemBody = item.body.split('\n')[0]
      const itemBodyParsed = itemBody.startsWith('<p>')
        ? itemBody.endsWith('</p>')
          ? itemBody.slice('<p>'.length, -('</p>'.length))
          : itemBody.slice('<p>'.length)
        : itemBody

      /**
       * check if we still can find the reference
       */
      if (typeof content[lineNumber] === 'string' && content[lineNumber].includes(itemBodyParsed)) {
        this._channel.appendLine(`item with id ${item.id} does not need to be updated`)
        continue fileLoop
      }

      /**
       * if not check if it can be found some lines further up or down
       */
      lineLoop:
      for (
        let l = Math.max(lineNumber - LINE_CHECK_RANGE, 0);
        l <= Math.min(lineNumber + LINE_CHECK_RANGE, content.length);
        ++l
      ) {
        /**
         * check if reference can be found
         */
        if (content[l].includes(itemBodyParsed)) {
          this._updateReference(itemName, item.id, l)
          continue fileLoop
        }
      }

      /**
       * if reference can not be found anymore, delete path
       */
      this._updateReference(itemName, item.id)
    }
  }

  private _updateReference (itemName: 'todos' | 'snippets' | 'notes', id: string, newLine?: number) {
    const items = this.state[itemName as keyof State] as ProjectItem[]
    const otherItems = items.filter((t) => t.id !== id)
    const modifiedItem = items.find((t) => t.id === id)

    if (!modifiedItem || !modifiedItem.path) {
      return
    }

    if (newLine) {
      const uri = modifiedItem.path.split(':')[0]
      modifiedItem.path = `${uri}:${newLine}`
      this._channel.appendLine(
        `Updated path of ${itemName.slice(0, -1)} item with id ${modifiedItem.id}, new path is ${modifiedItem.path}`
      )
    } else {
      delete modifiedItem.path
      this._channel.appendLine(
        `Can't find original reference for ${itemName.slice(0, -1)} with id ${modifiedItem.id}, removing its path`
      )
    }

    this._state[itemName as keyof State] = [modifiedItem, ...otherItems] as State[keyof State]
    return this.emitStateUpdate(true)
  }

  reset () {
    if (this._tangle) {
      this._subscriptions.forEach((s) => s.unsubscribe())
      this._tangle.removeAllListeners()
      delete this._tangle
    }
  }

  dispose () {
    this._disposables.forEach((d) => d.dispose())
    this.reset()
  }
}


export class GlobalExtensionManager extends ExtensionManager<State, Configuration> {
  constructor (...args: any[]) {
    // @ts-expect-error
    super(...args)
    this._gitProvider?.on('stateUpdate', (provider) => {
      this.updateState('branch', provider.branch, true)
      this.updateState('commit', provider.commit, true)
      this.updateState('gitUri', provider.gitUri, true)
    })
  }
}

export function activate (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new GlobalExtensionManager(
    context,
    channel,
    'configuration',
    DEFAULT_CONFIGURATION,
    DEFAULT_STATE
  )
  const aws = stateManager.getActiveWorkspace()

  /**
   * transform configurations from Marquee v2 -> v3
   */
  const oldGlobalStore = context.globalState.get<any>(DEPRECATED_GLOBAL_STORE_KEY, {})
  if (oldGlobalStore.bg) {
    stateManager.updateConfiguration('background', oldGlobalStore.bg)
  }

  /**
   * set global state to true if we don't have a workspace
   */
  if (!aws) {
    stateManager.updateState('globalScope', true)
  }

  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    }
  }
}

export function getExtProps () {
  const extProps: Record<string, string> = {}

  const config = vscode.workspace.getConfiguration(TELEMETRY_CONFIG_ID)
  if (!config.get<boolean>(TELEMETRY_CONFIG_ENABLED_ID)) {
    return extProps
  }

  if (globalThis.process) {
    extProps.os = os.platform()
    extProps.platformversion = (os.release() || '').replace(
      /^(\d+)(\.\d+)?(\.\d+)?(.*)/,
      '$1$2$3'
    )
  }

  extProps.extname = EXTENSION_ID
  extProps.extversion = pkg.version
  if (vscode && vscode.env) {
    extProps.vscodemachineid = vscode.env.machineId
    extProps.vscodesessionid = vscode.env.sessionId
    extProps.vscodeversion = vscode.version

    switch (vscode.env.uiKind) {
      case vscode.UIKind.Web:
        extProps.uikind = 'web'
        break
      case vscode.UIKind.Desktop:
        extProps.uikind = 'desktop'
        break
      default:
        extProps.uikind = 'unknown'
    }
  }
  return extProps
}

/**
 * export all helper methods that need an Node.js environment
 */
export * from './types'
export * from './constants'
export * from './provider/git'
