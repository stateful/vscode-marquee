import fs from 'fs';
import path from "path";
import vscode from "vscode";
import crypto from 'crypto';
import Channel from 'tangle/webviews';
import { URL } from 'url';
import { EventEmitter } from "events";
import { readFileSync } from "fs-extra";
import { getExtProps } from '@vscode-marquee/utils/extension';
import type { Client } from 'tangle';
import type { MarqueeEvents } from '@vscode-marquee/utils';

import StateManager from "./stateManager";
import { DEFAULT_FONT_SIZE, THIRD_PARTY_EXTENSION_DIR } from './constants';
import type { ExtensionConfiguration, ExtensionExport } from './types';

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

  public open() {
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

    const index = readFileSync(
      `${this.context.extensionPath}/dist/extension.html`,
      "utf-8"
    );

    const baseAppUri = this.panel.webview.asWebviewUri(
      vscode.Uri.file(basePath)
    );

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
      if (!extension.packageJSON.marqueeWidget) {
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
        const defaultState = extension.exports.marquee.defaultState || {};
        const defaultConfiguration = extension.exports.marquee.defaultConfiguration || {};
        const ch = new Channel(extension.id, { ...defaultState, ...defaultConfiguration });
        ch.registerPromise([this.panel.webview]).then((client) => {
          const stateManager = extension.exports.marquee.setup(client);
          if (stateManager) {
            stateManager.on('gui.open', () => this.open());
          }
        });
      }

      /**
       * in order to allow accessing assets outside of the Marquee extension
       * we need to link to the directory as accessing files outside of the
       * extension dir is not possible (returns a 404)
       */
      if (extension.extensionPath) {
        const extPath = path.join(this.context.extensionPath, THIRD_PARTY_EXTENSION_DIR, extension.id);
        if (!fs.existsSync(extPath)) {
          fs.symlinkSync(extension.extensionPath, extPath);
        }

        const targetPath = path.join(extPath, extension.packageJSON.marqueeWidget);
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
        configuration: curr.exports.marquee.disposable.configuration,
        state: curr.exports.marquee.disposable.state
      }
    }), {} as Record<string, any>);

    const content = index
      .replace(/app-ext-path/g, baseAppUri.toString())
      .replace(/app-ext-props/g, JSON.stringify(getExtProps(this.context)))
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
      .replace(/app-ext-widgets/, [
        ' begin 3rd party widgets -->',
        ...widgetScripts.join('\n'),
        '\n<!-- end of 3rd party widgets'
      ].join(''));

    const ch = new Channel<MarqueeEvents>('vscode.marquee');
    ch.registerPromise([this.panel.webview])
      .then((client) => (this.client = client));
    this.panel.webview.html = content;
  }
}
