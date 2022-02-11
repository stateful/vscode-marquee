import fs from 'fs/promises';
import path from "path";
import vscode from "vscode";
import crypto from 'crypto';
import Channel from 'tangle/webviews';
import { URL } from 'universal-url';
import { EventEmitter } from "events";
import { getExtProps } from '@vscode-marquee/utils/extension';
import type { Client } from 'tangle';
import type { MarqueeEvents } from '@vscode-marquee/utils';

import StateManager from "./stateManager";
import { DEFAULT_FONT_SIZE, THIRD_PARTY_EXTENSION_DIR } from './constants';
import type { ExtensionConfiguration, ExtensionExport } from './types';

declare const EXTENSION_TEMPLATE: string;
declare const BACKEND_BASE_URL: string;
declare const BACKEND_GEO_URL: string;
declare const BACKEND_FWDGEO_URL: string;

export class MarqueeGui extends EventEmitter {
  private panel: vscode.WebviewPanel | null = null;
  private guiActive: boolean = false;
  private client?: Client<MarqueeEvents>;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly stateMgr: StateManager
  ) {
    super();

    /**
     * register listeners for Marquee state managers so they can interact with the gui
     */
    for (const widgetExtension of this.stateMgr.widgetExtensions) {
      widgetExtension.exports.marquee?.disposable?.on('gui.open', this.open.bind(this));
      widgetExtension.exports.marquee?.disposable?.on('gui.close', this.close.bind(this));
    }
  }

  public isActive() {
    return this.guiActive;
  }

  public close() {
    this.panel?.dispose();
  }

  public broadcast (event: keyof MarqueeEvents, payload: any) {
    if (!this.client) {
      return false;
    }
    this.client.emit(event, payload);
  }

  public async open() {
    if (this.guiActive && this.panel) {
      this.panel.reveal();
      this.emit('webview.open');
      return;
    }

    const basePath = path.join(this.context.extensionPath, "/dist/gui/");
    this.panel = vscode.window.createWebviewPanel(
      "marqueeGui", // Identifies the type of the webview. Used internally
      "Marquee", // Title of the this.panel displayed to the user
      vscode.ViewColumn.One, // Editor column to show the new webview panel in.
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );
    this.panel.onDidChangeViewState(this._handleViewStateChange.bind(this));
    this.panel.iconPath = {
      light: vscode.Uri.parse(
        `${this.context.extensionPath}/assets/marquee-tab.svg`
      ),
      dark: vscode.Uri.parse(
        `${this.context.extensionPath}/assets/marquee-tab.svg`
      ),
    };
    this.panel.onDidDispose(() => {
      this.guiActive = false;
      this.panel = null;
      this.emit('webview.close');
    });

    const index = globalThis.process
      ? await fs.readFile(`${this.context.extensionPath}/dist/extension.html`, "utf-8")
      : EXTENSION_TEMPLATE;

    const baseAppUri = this.panel.webview.asWebviewUri(
      vscode.Uri.file(basePath)
    );
    console.log(baseAppUri);
    // const vscode = vscode_1.default;
    //     const uri_ = vscode.Uri.joinPath(this.context.extensionUri)
    //     console.log(uri_);
    //     console.log(this.context.extensionPath);
    console.log(await vscode.workspace.fs.readDirectory(baseAppUri));


    const nonce = crypto.randomBytes(16).toString('base64');
    const config = vscode.workspace.getConfiguration('marquee');
    const pref: ExtensionConfiguration | undefined = config.get('configuration');
    // calculate font-size as range between 0.5 - 1.5
    const fontSize = 0.5 + ((typeof pref?.fontSize === 'number' ? pref.fontSize : DEFAULT_FONT_SIZE) / 10);
    const widgets = [
      /**
       * 3rd party VSCode extension widgets
       */
      ...vscode.extensions.all,
      /**
       * Marquee widgets
       */
      ...this.stateMgr.widgetExtensions
    ] as vscode.Extension<ExtensionExport>[];

    const widgetScripts: string[] = [];
    for (const extension of widgets) {
      if (!extension.packageJSON.marquee?.widget) {
        continue;
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
        const defaultState = extension.exports.marquee?.disposable?.state || {};
        const defaultConfiguration = extension.exports.marquee?.disposable?.configuration || {};
        const ch = new Channel(extension.id, { ...defaultState, ...defaultConfiguration });
        ch.registerPromise([this.panel.webview]).then((client) => {
          extension.exports.marquee.setup(client);
        });
      }

      /**
       * in order to allow accessing assets outside of the Marquee extension
       * we need to link to the directory as accessing files outside of the
       * extension dir is not possible (returns a 404)
       *
       * Only do this when extension host is running within Node.js environment.
       */
      if (extension.extensionPath && globalThis.process) {
        const extPath = path.join(this.context.extensionPath, THIRD_PARTY_EXTENSION_DIR, extension.id);
        const doesExist = await fs.access(extPath).then(() => true, () => false);
        if (!doesExist) {
          await fs.symlink(extension.extensionPath, extPath);
        }

        const targetPath = path.join(extPath, extension.packageJSON.marquee?.widget);
        const src = this.panel.webview.asWebviewUri(vscode.Uri.file(targetPath));
        widgetScripts.push(`<script type="module" src="${src}" nonce="${nonce}"></script>`);
      }
    }

    const aws = this.stateMgr.projectWidget.getActiveWorkspace();
    const cs = pref?.colorScheme!;
    const colorScheme = typeof cs.r === 'number' && typeof cs.g === 'number' && typeof cs.b === 'number' && typeof cs.a === 'number'
      ? `rgba(${cs.r}, ${cs.g}, ${cs.b}, ${cs.a})`
      : 'transparent';

    const widgetStateConfigurations = this.stateMgr.widgetExtensions.reduce((prev, curr) => ({
      ...prev,
      [curr.id]: {
        configuration: curr.exports.marquee?.disposable?.configuration || {},
        state: curr.exports.marquee?.disposable?.state || {}
      }
    }), {} as Record<string, any>);

    const content = index
      .replace(/app-ext-path/g, baseAppUri.toString())
      .replace(/app-ext-props/g, JSON.stringify(getExtProps()))
      .replace(/app-ext-backend-baseUrl/g, BACKEND_BASE_URL)
      .replace(/app-ext-backend-geoUrl/g, BACKEND_GEO_URL)
      .replace(/app-ext-backend-fwdGeoUrl/g, BACKEND_FWDGEO_URL)
      .replace(/app-ext-backendHost-api/g, (new URL(BACKEND_BASE_URL)).origin)
      .replace(/app-ext-backendHost-usCentral/g, (new URL(BACKEND_GEO_URL)).origin)
      .replace(/app-ext-nonce/g, nonce)
      .replace(/app-ext-cspSource/g, this.panel.webview.cspSource)
      .replace(/app-ext-fontSize/g, `${fontSize}em`)
      .replace(/app-ext-workspace/g, JSON.stringify(aws))
      .replace(/app-ext-theme-color/g, colorScheme)
      .replace(/app-ext-state-config/g, JSON.stringify(widgetStateConfigurations))
      .replace(/app-ext-thirdParty-widgets/g, widgetScripts.length.toString())
      .replace(/app-ext-widgets/, [
        ' begin 3rd party widgets -->',
        ...widgetScripts.join('\n'),
        '\n<!-- end of 3rd party widgets'
      ].join(''));

    const ch = new Channel<MarqueeEvents>('vscode.marquee');
    ch.registerPromise([this.panel.webview])
      .then((client) => (this.client = client));
    this.panel.webview.html = content;
    this.panel.webview.onDidReceiveMessage((e) => {
      if (e.west && Array.isArray(e.west.execCommands)) {
        e.west.execCommands.forEach(this._executeCommand.bind(this));
      }

      if (e.west && e.west.notify && e.west.notify.message) {
        return this._handleNotifications(e.west.notify);
      }

      if (e.ready) {
        this.guiActive = true;
        this._handleViewStateChange({ webviewPanel: { visible: true } } as any);
        return this.emit('webview.open');
      }
    });
    this.panel.onDidDispose(async () => {
      this.client?.removeAllListeners();
      delete this.client;
    });
  }

  private _executeCommand ({ command, args, options }: { command: string, args: any[], options: any }) {
    if (args && args.length > 0 && command === "vscode.openFolder") {
      return vscode.commands.executeCommand(command, vscode.Uri.parse(args[0].toString()), options);
    }

    if (args && args.length > 0) {
      return vscode.commands.executeCommand(command, args[0], options);
    }

    vscode.commands.executeCommand(command, undefined, options);
  }

  private _handleNotifications ({ type, message }: { type: string, message: string }) {
    switch (type) {
      case 'error':
        vscode.window.showErrorMessage(message);
      break;
      case 'warning':
        vscode.window.showWarningMessage(message);
      break;
      default:
        vscode.window.showInformationMessage(message);
    }
  }

  private _handleViewStateChange (e: vscode.WebviewPanelOnDidChangeViewStateEvent) {
    const widgetDisposables = this.stateMgr.widgetExtensions
      .map((w) => w.exports?.marquee?.disposable)
      .filter(Boolean);
    for (const widgetExtension of widgetDisposables) {
      widgetExtension.stopListenOnChangeEvents = e.webviewPanel.visible;
    }
  }
}
