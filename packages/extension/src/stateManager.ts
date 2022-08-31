import vscode from 'vscode'

import ExtensionManager, {
  Logger,
  pkg as packageJson,
  activate as activateUtils,
  State as GlobalState,
  Configuration as GlobalConfiguration,
  DEPRECATED_GLOBAL_STORE_KEY,
  MarqueeEvents
} from '@vscode-marquee/utils/extension'
import { activate as activateWelcomeWidget } from '@vscode-marquee/widget-welcome/extension'
import { activate as activateNewsWidget } from '@vscode-marquee/widget-news/extension'
import { activate as activateProjectsWidget, ProjectsExtensionManager } from '@vscode-marquee/widget-projects/extension'
import { activate as activateGitHubWidget } from '@vscode-marquee/widget-github/extension'
import { activate as activateWeatherWidget } from '@vscode-marquee/widget-weather/extension'
import { activate as activateTodoWidget, TodoExtensionManager } from '@vscode-marquee/widget-todo/extension'
import { activate as activateMarkdownWidget, MarkdownExtensionManager } from '@vscode-marquee/widget-markdown/extension'
import { activate as activateNotesWidget, NoteExtensionManager } from '@vscode-marquee/widget-notes/extension'
import { activate as activateNPMStatsWidget } from '@vscode-marquee/widget-npm-stats/extension'
import { activate as activateSnippetsWidget, SnippetExtensionManager } from '@vscode-marquee/widget-snippets/extension'

import telemetry from './telemetry'
import { activateGUI, GUIExtensionManager } from './utils'
import { FILE_FILTER, CONFIG_FILE_TYPE } from './constants'
import type { ExtensionExport } from './types'

const MARQUEE_WIDGETS = {
  '@vscode-marquee/utils': activateUtils,
  '@vscode-marquee/gui': activateGUI,
  '@vscode-marquee/welcome-widget': activateWelcomeWidget,
  '@vscode-marquee/news-widget': activateNewsWidget,
  '@vscode-marquee/projects-widget': activateProjectsWidget,
  '@vscode-marquee/github-widget': activateGitHubWidget,
  '@vscode-marquee/weather-widget': activateWeatherWidget,
  '@vscode-marquee/todo-widget': activateTodoWidget,
  '@vscode-marquee/markdown-widget': activateMarkdownWidget,
  '@vscode-marquee/notes-widget': activateNotesWidget,
  '@vscode-marquee/npm-stats-widget': activateNPMStatsWidget,
  '@vscode-marquee/snippets-widget': activateSnippetsWidget
}

interface ExportFormat<T = any> {
  type: typeof CONFIG_FILE_TYPE
  version: string
  state: Record<string, T>
  configuration: Record<string, T>
}

export default class StateManager implements vscode.Disposable {
  public readonly widgetExtensions = Object.entries(MARQUEE_WIDGETS).map(
    /**
     * this is to make Marquee core widget look like external widgets
     * so that the interface is the same
     */
    ([id, activate]) => ({
      id,
      exports: activate(this._context),
      isActive: true,
      packageJSON: { marquee: { widget: true } }
    }) as Pick<vscode.Extension<ExtensionExport>, 'id' | 'exports' | 'isActive' | 'packageJSON'>
  )

  /**
   * widget subscriptions
   */
  private _subscriptions: vscode.Disposable[] = this.widgetExtensions.map(
    (ex) => ex.exports.marquee.disposable)

  constructor (private readonly _context: vscode.ExtensionContext) {
    this._subscriptions.push(
      vscode.commands.registerCommand('marquee.jsonImport', this._import.bind(this)),
      vscode.commands.registerCommand('marquee.jsonExport', this._export.bind(this))
    )

    /**
     * delete old global state so that configurations stored in the globalState in v2
     * can be applied with v3
     */
    this._context.globalState.update(DEPRECATED_GLOBAL_STORE_KEY, undefined)
  }

  private async _import () {
    /**
     * disable config change listener during the time we import
     */
    this.widgetExtensions.forEach((ex) => (
      ex.exports.marquee.disposable.setImportInProgress()))

    telemetry.sendTelemetryEvent('import')
    const importPath = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      openLabel: 'Import',
      filters: FILE_FILTER,
      title: 'Import Marquee Extension',
    })
    const filePath = (importPath || [])[0]

    if (!filePath) {
      return
    }

    try {
      Logger.info(`Import configuration from ${filePath}`)
      const dec = new TextDecoder('utf-8')
      const importJSON = await vscode.workspace.fs.readFile(filePath)
      const obj = JSON.parse(dec.decode(importJSON))
      let jsonImport = obj as ExportFormat

      /**
       * ToDo(Christian): use "type" property to detect valid marquee extension
       * once everyone has updated
       */
      if (!obj.version) {
        throw new Error('Invalid Marquee Configuration')
      }

      /**
       * transform old format into new
       */
      if (!obj.configuration || !obj.state) {
        jsonImport = {
          type: CONFIG_FILE_TYPE,
          version: '0.0.0',
          state: {
            '@vscode-marquee/snippets-widget': { snippets: obj.snippets || [] },
            '@vscode-marquee/notes-widget': { notes: obj.notes || [] },
            '@vscode-marquee/todo-widget': { todos: obj.todos || [] },
            '@vscode-marquee/welcome-widget': { read: obj.read || [] },
            '@vscode-marquee/projects-widget': { workspaces: obj.workspaces || [] }
          },
          configuration: {
            '@vscode-marquee/utils': { name: obj.name, background: obj.bg?.toString() },
            '@vscode-marquee/todo-widget': { autoDetect: obj.autoDetect },
            '@vscode-marquee/github-widget': {
              language: obj.language?.name,
              since: obj.since?.name,
              spoken: obj.spoken?.name
            }
          }
        }
      }

      let promises: Promise<void>[] = []
      for (const [id, manager] of this.widgetExtensions.map((we) => [we.id, we.exports.marquee.disposable] as const)) {
        promises.push(...Object.entries(jsonImport.configuration[id] || {}).map(
          ([key, val]) => manager.updateConfiguration(key, val)))
        promises.push(...Object.entries(jsonImport.state[id] || {}).map(
          ([key, val]) => manager.updateState(key, val).then(() => { manager.emit('stateUpdate', manager.state) })))
      }
      await Promise.all(promises)

      vscode.window.showInformationMessage(`Successfully imported Marquee state from ${filePath.path}`)
      this.global.emit('gui.close')
      return this.global.emit('gui.open', true)
    } catch (err) {
      const message = `Error importing file: ${(err as Error).message}`
      Logger.error(message)
      vscode.window.showErrorMessage(message)
    } finally {
      /**
       * re-enable config change listener again
       */
      this.widgetExtensions.forEach((ex) => (
        ex.exports.marquee.disposable.setImportInProgress(false)), 1000)
    }
  }

  private async _export () {
    telemetry.sendTelemetryEvent('export')
    const { state, configuration } = this.widgetExtensions.reduce((format, ext) => ({
      state: {
        ...format.state,
        [ext.id]: ext.exports.marquee.disposable.state
      },
      configuration: {
        ...format.configuration,
        [ext.id]: ext.exports.marquee.disposable.configuration
      }
    }), {} as Pick<ExportFormat, 'configuration' | 'state'>)

    try {
      const exportPath = await vscode.window.showSaveDialog({
        saveLabel: 'Export',
        filters: FILE_FILTER,
        title: 'Export Marquee Extension',
      })

      if (!exportPath) {
        return
      }

      Logger.info(`Export configuration and state to ${exportPath}`)
      const jsonExport: ExportFormat = {
        type: CONFIG_FILE_TYPE,
        version: packageJson.version,
        state,
        configuration
      }

      var enc = new TextEncoder()
      await vscode.workspace.fs.writeFile(exportPath, enc.encode(JSON.stringify(jsonExport, null, 1)))
      vscode.window.showInformationMessage(
        `Successfully exported Marquee state to ${exportPath.fsPath}`
      )
    } catch (err) {
      const message = `Error writing export file: ${(err as Error).message}`
      Logger.error(message)
      vscode.window.showErrorMessage(message)
    }
  }

  get gui () {
    return this.widgetExtensions.find(
      (e) => e.id === '@vscode-marquee/gui'
    )?.exports.marquee.disposable as GUIExtensionManager
  }

  get projectWidget () {
    return this.widgetExtensions.find(
      (e) => e.id === '@vscode-marquee/projects-widget'
    )?.exports.marquee.disposable as ProjectsExtensionManager
  }

  get markdownWidget () {
    return this.widgetExtensions.find(
      (e) => e.id === '@vscode-marquee/markdown-widget'
    )?.exports.marquee.disposable as MarkdownExtensionManager
  }

  get notesWidget () {
    return this.widgetExtensions.find(
      (e) => e.id === '@vscode-marquee/notes-widget'
    )?.exports.marquee.disposable as NoteExtensionManager
  }

  get todoWidget () {
    return this.widgetExtensions.find(
      (e) => e.id === '@vscode-marquee/todo-widget'
    )?.exports.marquee.disposable as TodoExtensionManager
  }

  get snippetsWidget () {
    return this.widgetExtensions.find(
      (e) => e.id === '@vscode-marquee/snippets-widget'
    )?.exports.marquee.disposable as SnippetExtensionManager
  }

  get global () {
    return this.widgetExtensions.find(
      (e) => e.id === '@vscode-marquee/utils'
    )?.exports.marquee.disposable as ExtensionManager<GlobalState, GlobalConfiguration>
  }

  /**
   * reset all tangle subscriptions
   */
  resetAll () {
    return Promise.all(this.widgetExtensions.map(
      (w) => w.exports.marquee.disposable.reset()))
  }

  /**
   * clear state and configuration of all Marquee widgets
   */
  clearAll () {
    return Promise.all(this.widgetExtensions.map(
      (w) => w.exports.marquee.disposable.clear()))
  }

  onWidget<EventName extends keyof MarqueeEvents>(
    eventName: string,
    listener: ({
      event,
      payload,
    }: {
      event: EventName;
      payload: MarqueeEvents[EventName];
    }) => void
  ) {
    return Promise.all(
      this.widgetExtensions.map((w) =>
        w.exports.marquee.disposable.on(eventName, listener)
      )
    )
  }

  /**
   * clear all subscriptions
   */
  dispose () {
    return Promise.all(this._subscriptions.map((s) => s.dispose()))
  }
}
