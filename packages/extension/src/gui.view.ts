import fs from 'fs/promises'
import path from 'path'
import vscode from 'vscode'
import Channel from 'tangle/webviews'
import { v4 as uuidv4 } from 'uuid'
import { EventEmitter } from 'events'
import { render } from 'eta'
import { getExtProps } from '@vscode-marquee/utils/extension'
import type { Client } from 'tangle'
import type { MarqueeEvents } from '@vscode-marquee/utils'

import telemetry from './telemetry'
import StateManager from './stateManager'
import { DEFAULT_STATE } from './utils'
import { DEFAULT_FONT_SIZE, THIRD_PARTY_EXTENSION_DIR } from './constants'
import type { ExtensionConfiguration, ExtensionExport } from './types'

declare const BACKEND_BASE_URL: string
declare const BACKEND_GEO_URL: string
declare const BACKEND_FWDGEO_URL: string

export class MarqueeGui extends EventEmitter {
  private panel: vscode.WebviewPanel | null = null
  private guiActive: boolean = false
  private client?: Client<MarqueeEvents>

  private _baseUri = vscode.Uri.joinPath(this.context.extensionUri)
  private _template: Thenable<Uint8Array>
  private _templateDecoded?: string

  constructor (
    private readonly context: vscode.ExtensionContext,
    private readonly stateMgr: StateManager,
    private readonly channel: vscode.OutputChannel
  ) {
    super()
    this._template = vscode.workspace.fs.readFile(vscode.Uri.joinPath(this._baseUri, 'dist', 'extension.html'))

    /**
     * register listeners for Marquee state managers so they can interact with the gui
     */
    for (const widgetExtension of this.stateMgr.widgetExtensions) {
      widgetExtension.exports.marquee?.disposable?.on('gui.open', this.open.bind(this))
      widgetExtension.exports.marquee?.disposable?.on('gui.close', this.close.bind(this))
    }
  }

  async getTemplate () {
    if (this._templateDecoded) {
      return this._templateDecoded
    }

    const dec = new TextDecoder('utf-8')
    const tpl = await this._template
    this._templateDecoded = dec.decode(tpl)
    return this._templateDecoded
  }

  public isActive () {
    return this.guiActive
  }

  public close () {
    this.panel?.dispose()
  }

  public broadcast<EventName extends keyof MarqueeEvents>(
    event: EventName,
    payload: MarqueeEvents[EventName]
  ) {
    if (!this.client) {
      return false
    }
    this.client.emit(event, payload)
  }

  private async _verifyWidgetStates () {
    /**
     * check if current selected mode was removed and switch to the default
     * mode if so
     */
    if (this.stateMgr.gui.state.modeName && !this.stateMgr.gui.configuration.modes[this.stateMgr.gui.state.modeName]) {
      this.channel.appendLine(`Couldn't find selected mode "${this.stateMgr.gui.state.modeName}", switching to default`)
      await this.stateMgr.gui.updateState('modeName', DEFAULT_STATE.modeName)
    }
  }

  public async open () {
    await this._verifyWidgetStates()

    if (this.guiActive && this.panel) {
      this.panel.reveal()
      this.emit('webview.open')
      return
    }

    this.panel = vscode.window.createWebviewPanel(
      'marqueeGui', // Identifies the type of the webview. Used internally
      'Marquee', // Title of the this.panel displayed to the user
      vscode.ViewColumn.One, // Editor column to show the new webview panel in.
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    )
    this.panel.iconPath = {
      light: vscode.Uri.joinPath(this.context.extensionUri, 'assets', 'marquee-tab.svg'),
      dark: vscode.Uri.joinPath(this.context.extensionUri, 'assets', 'marquee-tab.svg'),
    }

    const basePath = vscode.Uri.joinPath(this._baseUri, 'dist', 'gui')
    const baseAppUri = this.panel.webview.asWebviewUri(basePath)
    const nonce = Buffer.from(uuidv4()).toString('base64')
    const config = vscode.workspace.getConfiguration('marquee')
    const pref: ExtensionConfiguration | undefined = config.get('configuration')
    // calculate font-size as range between 0.5 - 1.5
    const fontSize = 0.5 + ((typeof pref?.fontSize === 'number' ? pref.fontSize : DEFAULT_FONT_SIZE) / 10)
    const widgets = [
      /**
       * 3rd party VSCode extension widgets
       */
      ...vscode.extensions.all,
      /**
       * Marquee widgets
       */
      ...this.stateMgr.widgetExtensions
    ] as vscode.Extension<ExtensionExport>[]

    const widgetScripts: string[] = []
    for (const extension of widgets) {
      /**
       * continue if extension doesn't expose a marquee widget
       * within its package.json
       */
      if (
        !extension.packageJSON.marquee?.widget ||
        /**
         * don't show example widget extension in production
         */
        (process.env.NODE_ENV !== 'development' && extension.id === 'stateful.marquee')
      ) {
        continue
      }

      /**
       * only setup a communication channel to the extension backend, if
       */
      if (
      /**
         * the extension is active so we can access its exported APIs
         */
        extension.isActive &&
        /**
         * the extension properly exports a setup method
         */
        extension.exports &&
        extension.exports.marquee &&
        typeof extension.exports.marquee.setup === 'function'
      ) {
        const defaultState = extension.exports.marquee?.disposable?.state || {}
        const defaultConfiguration = extension.exports.marquee?.disposable?.configuration || {}
        const ch = new Channel(extension.id, { ...defaultState, ...defaultConfiguration })
        ch.registerPromise([this.panel.webview]).then((client) => {
          extension.exports.marquee.setup(client)
        })
      }

      /**
       * in order to allow accessing assets outside of the Marquee extension
       * we need to link to the directory as accessing files outside of the
       * extension dir is not possible (returns a 404)
       *
       * Only do this when extension host is running within Node.js environment.
       */
      if (extension.extensionPath && globalThis.process) {
        const extPath = path.join(this.context.extensionPath, THIRD_PARTY_EXTENSION_DIR, extension.id)
        const doesExist = await fs.access(extPath).then(() => true, () => false)
        if (!doesExist) {
          await fs.symlink(extension.extensionPath, extPath)
        }

        const targetPath = path.join(extPath, extension.packageJSON.marquee?.widget)
        const src = this.panel.webview.asWebviewUri(vscode.Uri.file(targetPath))
        widgetScripts.push(`<script type="module" src="${src.toString()}" nonce="${nonce}"></script>`)
      }
    }

    const aws = this.stateMgr.projectWidget.getActiveWorkspace()
    const cs = pref?.colorScheme
    const colorScheme = (
      typeof cs?.r === 'number' &&
      typeof cs?.g === 'number' &&
      typeof cs?.b === 'number' &&
      typeof cs?.a === 'number'
    )
      ? `rgba(${cs.r}, ${cs.g}, ${cs.b}, ${cs.a})`
      : 'transparent'

    const widgetStateConfigurations = this.stateMgr.widgetExtensions.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.id]: {
          configuration: curr.exports.marquee?.disposable?.configuration || {},
          state: curr.exports.marquee?.disposable?.state || {},
        },
      }),
      {} as Record<string, Pick<ExtensionExport, 'configuration' | 'state'>>
    )

    const backendBaseUrl = vscode.Uri.parse(BACKEND_BASE_URL)
    const backendGeoUrl = vscode.Uri.parse(BACKEND_GEO_URL)
    const content = await render(await this.getTemplate(), {
      aws,
      nonce,
      fontSize,
      baseAppUri,
      colorScheme,
      props: getExtProps(),
      baseUrl: BACKEND_BASE_URL,
      geoUrl: BACKEND_GEO_URL,
      fwdGeoUrl: BACKEND_FWDGEO_URL,
      cspSource: this.panel.webview.cspSource,
      widgetStateConfigurations: Buffer.from(JSON.stringify(widgetStateConfigurations)).toString('base64'),
      widgetScripts,
      connectSrc: [
        `${backendBaseUrl.scheme}://${backendBaseUrl.authority}`,
        `${backendGeoUrl.scheme}://${backendGeoUrl.authority}`,
        'https://api.hackerwebapp.com',
        'https://*.ingest.sentry.io'
      ],
      childSrc: [
        'https://www.youtube.com',
        'https://player.vimeo.com',
        'https://fast.wistia.net'
      ]
    })

    if (!content) {
      return vscode.window.showErrorMessage('Couldn\'t load Marquee')
    }

    const ch = new Channel<MarqueeEvents>('vscode.marquee')
    this.client = await ch.registerPromise([this.panel.webview])
    this.client.on('telemetryEvent', ({ eventName, properties }) => (
      telemetry.sendTelemetryEvent(eventName, properties)))
    this.panel.webview.html = content
    this.panel.webview.onDidReceiveMessage(this._handleWebviewMessage.bind(this))
    this.panel.onDidDispose(this._disposePanel.bind(this))
  }

  private _disposePanel () {
    telemetry.sendTelemetryEvent('guiClose')
    this.guiActive = false
    this.panel = null
    this.emit('webview.close')
    this.client?.removeAllListeners()
    delete this.client
  }

  private async _handleWebviewMessage (e: any) {
    if (e.west && Array.isArray(e.west.execCommands)) {
      try {
        await Promise.all(e.west.execCommands.map(this._executeCommand.bind(this)))
        return
      } catch (err: any) {
        return vscode.window.showErrorMessage(`Marquee Error: ${(err as Error).message}`)
      }
    }

    if (e.west && e.west.notify && e.west.notify.message) {
      return this._handleNotifications(e.west.notify)
    }

    if (e.ready) {
      telemetry.sendTelemetryEvent('guiOpen')
      this.guiActive = true
      return this.emit('webview.open')
    }
  }

  private _executeCommand ({ command, args, options }: { command: string, args: any[], options: any }) {
    telemetry.sendTelemetryEvent('executeCommand', { command })
    if (args && args.length > 0 && command === 'vscode.openFolder') {
      return vscode.commands.executeCommand(command, vscode.Uri.parse(args[0].toString()), options)
    }

    if (args && args.length > 0) {
      return vscode.commands.executeCommand(command, args[0], options)
    }

    vscode.commands.executeCommand(command, undefined, options)
  }

  private _handleNotifications ({ type, message }: { type: string, message: string }) {
    switch (type) {
      case 'error':
        vscode.window.showErrorMessage(message)
        break
      case 'warning':
        vscode.window.showWarningMessage(message)
        break
      default:
        vscode.window.showInformationMessage(message)
    }
  }
}
