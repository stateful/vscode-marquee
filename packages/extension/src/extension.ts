import fs from 'fs/promises';
import vscode from "vscode";
import path from "path";
import { WorkspaceType } from '@vscode-marquee/utils/extension';

import StateManager from "./stateManager";
import { MarqueeGui } from "./gui.view";
import { TreeView } from "./tree.view";
import { ContextMenu } from "./tree.view";
import { config, THIRD_PARTY_EXTENSION_DIR } from './constants';
import type { ExtensionConfiguration } from './types';
import { MarqueeEvents } from "@vscode-marquee/utils";

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

    vscode.window.onDidChangeActiveColorTheme(() => {
      if (!this.gui.isActive()) {
        return;
      }

      this.gui.close();
      vscode.window.showInformationMessage(
        `Please reload your Marquee View to apply the new theme.`
      );
    });

    /**
     * clear symlink to 3rd party extensions as new extension could have
     * been installed since then
     */
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
    await new Promise((r) => setTimeout(r, 1000));
    this.closeGui();
  }

  private setupCommands(): vscode.Disposable[] {
    const disposables: vscode.Disposable[] = new Array<vscode.Disposable>();

    const switchTo = async (openView: boolean = false) => {
      await this.openGui();
      if (openView) {
        this.openView();
      }
    };

    disposables.push(vscode.commands.registerCommand("marquee.open", switchTo));

    disposables.push(
      vscode.commands.registerCommand("marquee.touchbar", switchTo)
    );

    disposables.push(
      vscode.commands.registerCommand("marquee.expand", () => this.openGui())
    );

    disposables.push(
      vscode.commands.registerCommand("marquee.link", (item: any) => {
        let file = item.item.path;
        let splt = file.split(":");
        let ln = "1";
        if (splt.length > 2) {
          ln = splt[splt.length - 1];
          splt = splt.splice(0, splt.length - 1);
          file = splt.join(":");
        } else if (splt.length > 1) {
          [file, ln] = splt;
        }
        const rpath = vscode.Uri.parse(file).fsPath;
        vscode.workspace.openTextDocument(rpath).then((doc) => {
          if (!doc) {
            return;
          }
          vscode.window.showTextDocument(doc).then((editor) => {
            const r = doc.lineAt(parseInt(ln)).range;
            if (editor && r) {
              editor.revealRange(r, vscode.TextEditorRevealType.InCenter);
            }
          });
        });
      })
    );

    disposables.push(
      vscode.commands.registerCommand("marquee.edit", (item: ContextMenu) => {
        this.openDialog(item.getDialogs("edit"), item.id);
      })
    );

    disposables.push(
      vscode.commands.registerCommand("marquee.addEmptyTodo", () => {
        this.openDialog('openAddTodoDialog', true);
      })
    );

    disposables.push(
      vscode.commands.registerCommand("marquee.addEmptySnippet", () => {
        this.openDialog('openAddSnippetDialog', true);
      })
    );

    disposables.push(
      vscode.commands.registerCommand("marquee.addEmptyNote", () => {
        this.openDialog('openAddNoteDialog', true);
      })
    );

    disposables.push(
      vscode.commands.registerCommand("marquee.clear", () => {
        this.wipe();
      })
    );

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
