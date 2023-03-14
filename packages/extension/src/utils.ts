import vscode from 'vscode'
import ExtensionManager, { defaultConfigurations, Logger } from '@vscode-marquee/utils/extension'

import { DEFAULT_MODES } from './constants'

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
  modes: DEFAULT_MODES
}

export const DEFAULT_CONFIGURATION = {
  proxy: defaultConfigurations['marquee.configuration.proxy'].default,
  fontSize: defaultConfigurations['marquee.configuration.fontSize'].default,
  launchOnStartup: defaultConfigurations['marquee.configuration.launchOnStartup'].default,
  workspaceLaunch: defaultConfigurations['marquee.configuration.workspaceLaunch'].default,
  colorScheme: undefined
}

type Configuration = typeof DEFAULT_CONFIGURATION
type State = typeof DEFAULT_STATE

export class GUIExtensionManager extends ExtensionManager<State, Configuration> {}

export function activateGUI (context: vscode.ExtensionContext) {
  const key = 'configuration'
  const modeConfigKey = `${key}.modes`
  /**
   * In v3.3.0 we moved `modes` from configuration to state
   * see https://github.com/stateful/vscode-marquee/issues/221
   * This section checks if modes were stored as configuration object and
   * moves them over to state
   */
  let defaultState: State = JSON.parse(JSON.stringify(DEFAULT_STATE))
  const config = vscode.workspace.getConfiguration('marquee')
  const modeAsConfiguration = config.get(modeConfigKey)
  if (modeAsConfiguration) {
    context.globalState.update(modeConfigKey, modeAsConfiguration)
    config.update(modeConfigKey, undefined, vscode.ConfigurationTarget.Global)
    defaultState.modes = modeAsConfiguration
  }

  const stateManager = new GUIExtensionManager(context, key, DEFAULT_CONFIGURATION, defaultState)
  if (!stateManager.state.modes || Object.keys(stateManager.state.modes).length === 0) {
    stateManager.updateState('modes', DEFAULT_STATE.modes)
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

export const linkMarquee = async (item: any) => {
  let file = item?.item?.path

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

  try {
    const editor = await vscode.window.showTextDocument(doc)
    const r = doc.lineAt(parseInt(ln)).range
    if (!editor || !r) {
      return
    }

    editor.revealRange(r, vscode.TextEditorRevealType.InCenter)
    editor.selection = new vscode.Selection(r.start, r.end)
  } catch (err: any) {
    Logger.warn(`Marquee: ${(err as Error).message}`)
  }
}
