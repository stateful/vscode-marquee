import fs from 'fs/promises';
import vscode from "vscode";
import path from "path";
import { WorkspaceType } from '@vscode-marquee/utils/extension';
import type { MarqueeEvents } from "@vscode-marquee/utils";

import StateManager from "./stateManager";
import { MarqueeGui } from "./gui.view";
import { TreeView } from "./tree.view";
import { ContextMenu } from "./tree.view";
import { linkMarquee } from './utils';
import { config, THIRD_PARTY_EXTENSION_DIR } from './constants';
import type { ExtensionConfiguration } from './types';

export class MarqueeExtension {
  private readonly _channel = vscode.window.createOutputChannel('Marquee');
  private readonly _stateMgr = new StateManager(this.context, this._channel);

  private readonly gui: MarqueeGui;
  private readonly view: vscode.TreeView<any>;
  private readonly treeView: TreeView;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.gui = new MarqueeGui(this.context, this._stateMgr);
    this.treeView = new TreeView(this.context, this._stateMgr);
    this.setupCommands();

    this.view = vscode.window.createTreeView("marquee", {
      treeDataProvider: this.treeView,
    });

    vscode.window.onDidChangeActiveColorTheme(this._onColorThemeChange.bind(this));

    /**
     * allow widget to trigger extension methods
     */
    this._stateMgr.onWidget('openDialog',
      ({ event, payload }) => this.openDialog(event as keyof MarqueeEvents, payload));

    /**
     * clear symlink to 3rd party extensions as new extension could have
     * been installed since then
     *
     * Only run this if extension host is running within a Node.js environment
     */
    if (globalThis.process) {
      const thirdPartyDir = path.join(context.extensionPath, THIRD_PARTY_EXTENSION_DIR);
      fs.rm(thirdPartyDir, { force: true, recursive: true }).then(
        () => fs.mkdir(thirdPartyDir)
      ).then(() => (
        this._channel.appendLine(`Regenerated widget extension dir ${thirdPartyDir}`)
      )).then(
        () => this.openMarqueeOnStartup(config.get('configuration')),
        (err) => this._channel.appendLine(`[Error]: ${err.message}`)
      );
    }
  }

  private _onColorThemeChange () {
    if (!this.gui.isActive()) {
      return;
    }

    this.gui.close();
    vscode.window.showInformationMessage(
      `Please reload your Marquee View to apply the new theme.`
    );
  }

  /**
   * open Marquee on startup based on configuration
   */
  private openMarqueeOnStartup (pref?: ExtensionConfiguration) {
    const aws = this._stateMgr.projectWidget.getActiveWorkspace();
    const launchOnStartup = pref && pref.launchOnStartup;
    const workspaceOnly = pref && pref.workspaceLaunch;

    if (!launchOnStartup) {
      return;
    }

    if (workspaceOnly && aws && aws.type !== WorkspaceType.WORKSPACE) {
      return;
    }

    return this.openGui();
  }

  private async openDialog (event: keyof MarqueeEvents, payload?: any) {
    await this.openGui();
    this.gui.broadcast(event, payload);
  }

  private async wipe() {
    this.gui.broadcast('resetMarquee', true);
    this.treeView.clearTree();
    await this._stateMgr.clearAll();
    this.closeGui();
  }

  private async _switchTo (openView: boolean = false) {
    await this.openGui();
    if (openView) {
      this.openView();
    }
  }

  private setupCommands(): vscode.Disposable[] {
    const disposables: vscode.Disposable[] = [
      vscode.commands.registerCommand("marquee.link", linkMarquee),
      vscode.commands.registerCommand("marquee.open", this._switchTo.bind(this)),
      vscode.commands.registerCommand("marquee.touchbar", this._switchTo.bind(this)),
      vscode.commands.registerCommand("marquee.expand", () => this.openGui()),
      vscode.commands.registerCommand("marquee.clear", () => this.wipe()),
      vscode.commands.registerCommand("marquee.edit", (item: ContextMenu) => {
        this.openDialog(item.getDialogs("edit") as keyof MarqueeEvents, item.id);
      })
    ];

    disposables.map((d) => this.context.subscriptions.push(d));
    return disposables;
  }

  public openView() {
    if (this.treeView.focus) {
      this.view.reveal(this.treeView.focus, {
        focus: false,
        select: false,
      });
    }
  }

  public openGui() {
    const ret = new Promise<void>(
      (resolve) => this.gui.once('webview.open', resolve));
    this.gui.open();
    return ret;
  }

  public closeGui() {
    this.gui.close();
  }

  public guiActive() {
    return this.gui.isActive();
  }
}
