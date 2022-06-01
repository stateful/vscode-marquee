import vscode from 'vscode'
import ExtensionManager, { defaultConfigurations } from '@vscode-marquee/utils/extension'

import { MODES_UPDATE_TIMEOUT } from './constants'

export const isExpanded = (id: number): vscode.TreeItemCollapsibleState => {
  const found = [0, 1, 2, 3].filter((item: number) => id === item).length > 0

  if (found) {
    return vscode.TreeItemCollapsibleState.Expanded
  }

  return vscode.TreeItemCollapsibleState.Collapsed
}

export const filterByScope = <T extends { workspaceId: string | null }>(
  obj: T[],
  aws: null | { id: string },
  globalScope: boolean
) => {
  return obj.filter((n) => globalScope || (aws && aws.id === n.workspaceId))
}

export const DEFAULT_STATE = {
  modeName: 'default',
  prevMode: null
}

export const DEFAULT_CONFIGURATION = {
  modes: defaultConfigurations['marquee.configuration.modes'].default,
  proxy: defaultConfigurations['marquee.configuration.proxy'].default,
  fontSize: defaultConfigurations['marquee.configuration.fontSize'].default,
  launchOnStartup: defaultConfigurations['marquee.configuration.launchOnStartup'].default,
  workspaceLaunch: defaultConfigurations['marquee.configuration.workspaceLaunch'].default,
  colorScheme: undefined
}

type Configuration = typeof DEFAULT_CONFIGURATION
type State = typeof DEFAULT_STATE

export class GUIExtensionManager extends ExtensionManager<State, Configuration> {
  private _lastModesChange = Date.now()

  constructor (
    context: vscode.ExtensionContext,
    channel: vscode.OutputChannel,
    key: string,
    defaultConfiguration: Configuration,
    defaultState: State
  ) {
    super(context, channel, key, defaultConfiguration, defaultState)
    this._disposables.push(vscode.workspace.onDidChangeConfiguration(this._onModeChange.bind(this)))
  }

  async updateConfiguration <T extends keyof Configuration = keyof Configuration>(prop: T, val: Configuration[T]) {
    /**
     * when updating modes the webview passes the native ascii icon (e.g. "💼") which
     * breaks when sending from webview to extension host. This ensures that we don't
     * includes these broken ascii characters into the VSCode settings file
     */
    if (prop === 'modes') {
      this._lastModesChange = Date.now()

      for (const modeName of Object.keys(val)) {
        if (val[modeName].icon) {
          delete val[modeName].icon.native
        }
      }

      /**
       * in order to prevent storing modes into the global workspace we should check weather
       * they are part of the workspace settings
       */
      const workspaceFolder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]
      if (workspaceFolder) {
        try {
          const workspaceSettings: Record<string, any> = JSON.parse((await vscode.workspace.fs.readFile(
            vscode.Uri.joinPath(workspaceFolder.uri, '.vscode', 'settings.json')
          )).toString())
          for (const workspaceMode of Object.keys(workspaceSettings['marquee.configuration.modes'])) {
            delete val[workspaceMode]
          }
        } catch (err) {
          // no-op
        }
      }
    }

    return super.updateConfiguration(prop, val)
  }

  _onModeChange (event: vscode.ConfigurationChangeEvent) {
    if (
      !event.affectsConfiguration('marquee.configuration.modes') ||
      (Date.now() - this._lastModesChange) < MODES_UPDATE_TIMEOUT
    ) {
      return
    }

    const config = vscode.workspace.getConfiguration('marquee')
    const val = config.get('configuration.modes') as Configuration[keyof Configuration]
    this._channel.appendLine('Update configuration.modes via configuration listener')
    this.broadcast({ modes: JSON.parse(JSON.stringify(val)) })
  }
}

export function activateGUI (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new GUIExtensionManager(context, channel, 'configuration', DEFAULT_CONFIGURATION, DEFAULT_STATE)

  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    }
  }
}

export const linkMarquee = async (item: any) => {
  let file = item?.item?.origin

  if (!file) {
    return
  }

  let splt = file.split(':')
  let ln = '1'
  if (splt.length > 2) {
    ln = splt[splt.length - 1]
    splt = splt.splice(0, splt.length - 1)
    file = splt.join(':')
  } else if (splt.length > 1) {
    [file, ln] = splt
  }
  const rpath = vscode.Uri.parse(file).fsPath
  const doc = await vscode.workspace.openTextDocument(rpath)
  if (!doc) {
    return
  }

  const editor = await vscode.window.showTextDocument(doc)
  const r = doc.lineAt(parseInt(ln)).range
  if (!editor || !r) {
    return
  }

  editor.revealRange(r, vscode.TextEditorRevealType.InCenter)
}
