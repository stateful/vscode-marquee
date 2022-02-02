import fs from 'fs/promises';
import vscode from "vscode";
import path from "path";
import crypto from "crypto";
import { existsSync } from "fs-extra";
import {
  Observable,
  combineLatest,
  timer,
  merge,
  of,
  interval,
  from,
} from "rxjs";
import {
  map,
  throttleTime,
  share,
  filter,
  pluck,
  pairwise,
  mergeMap,
} from "rxjs/operators";
import { activate as activateWelcomeWidget } from '@vscode-marquee/widget-welcome/extension';
import { activate as activateProjectsWidget } from '@vscode-marquee/widget-projects/extension';
import { activate as activateGitHubWidget } from '@vscode-marquee/widget-github/extension';
import { activate as activateWeatherWidget } from '@vscode-marquee/widget-weather/extension';
import { activate as activateTodoWidget } from '@vscode-marquee/widget-todo/extension';
import { activate as activateNotesWidget } from '@vscode-marquee/widget-notes/extension';
import getExtProps from '@vscode-marquee/utils/build/getExtProps';

import {
  StateManager,
  Message,
  NotificationType,
  WorkspaceType,
  persistenceKey,
  Snippet,
  Todo,
} from "./state.manager";
import { MarqueeGui } from "./gui.view";
import { TreeView } from "./tree.view";
import { writeFileSync, readFileSync } from "fs-extra";
import { ContextMenu } from "./tree.view";
import { INIT, config, FILE_FILTER, CONFIG_FILE_TYPE, THIRD_PARTY_EXTENSION_DIR } from './constants';
import type { ExtensionConfiguration, ExtensionExport } from './types';
import { MarqueeEvents } from "@vscode-marquee/utils";

export const CODE_TODO = "marquee_todo";
export const TODO = /TODO[:]? /g;

const MARQUEE_WIDGETS = {
  '@vscode-marquee/welcome-widget': activateWelcomeWidget,
  '@vscode-marquee/projects-widget': activateProjectsWidget,
  '@vscode-marquee/github-widget': activateGitHubWidget,
  '@vscode-marquee/weather-widget': activateWeatherWidget,
  '@vscode-marquee/todo-widget': activateTodoWidget,
  '@vscode-marquee/notes-widget': activateNotesWidget
};

export class MarqueeExtension {
  private readonly _channel = vscode.window.createOutputChannel('Marquee');
  private readonly gui: MarqueeGui;
  private readonly view: vscode.TreeView<any>;
  private readonly treeView: TreeView;
  private readonly version: string;

  private readonly widgetExtensions: vscode.Extension<ExtensionExport>[] = Object.entries(MARQUEE_WIDGETS).map(
    ([id, activate]) => ({
      id,
      exports: activate(this.context, this._channel),
      isActive: true,
      packageJSON: { marqueeWidget: true }
    } as any as vscode.Extension<ExtensionExport>)
  );

  constructor(
    private readonly context: vscode.ExtensionContext,
    protected readonly stateMgr: StateManager
  ) {
    this.gui = new MarqueeGui(this.context, stateMgr, this._channel, this.widgetExtensions);
    this.treeView = new TreeView(this.context, stateMgr);
    this.setupCommands();
    this.context.subscriptions.push(...this.widgetExtensions.map((ex) => ex.exports.marquee.disposable));

    const extensionPath = path.join(this.context.extensionPath, "package.json");
    const packageFile = readFileSync(extensionPath, "utf-8");
    const packageJson = JSON.parse(packageFile);
    this.version = packageJson.version;

    this.stateMgr.save((latest: Message) => {
      if (latest.version !== this.version) {
        latest.version = this.version;
      }

      if (latest.globalScope === undefined) {
        latest.globalScope = false;
      }

      if (latest.autoDetect === undefined) {
        latest.autoDetect = true;
      }

      return this.stateMgr.updateWorkspaces(latest);
    });

    this.updatePathsExistence();

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

    this.handleEvents();

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
      () => this.openMarqueeOnStartup(config.get('configuration.startup')),
      (err) => this._channel.appendLine(`[Error]: ${err.message}`)
    );
  }

  /**
   * open Marquee on startup based on configuration
   */
  private openMarqueeOnStartup (pref?: ExtensionConfiguration) {
    const aws = this.stateMgr.getActiveWorkspace();
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

  private wipe() {
    const state = this.stateMgr.recover();
    const keys = Promise.all([
      Object.keys(state).map((k) => {
        return this.context.globalState.update(k, undefined);
      }),
      this.context.globalState.update(persistenceKey, undefined),
    ]);

    keys.then(() => {
      this.stateMgr.recover();
      this.closeGui();
      this.treeView.clearTree();
    });
  }

  private getTextSelection(editor: vscode.TextEditor) {
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
    const id = generateId();
    return { text, id, path, name, lang };
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
      vscode.commands.registerCommand(
        "marquee.toggleTodo",
        this.stateMgr.handleItem((item: any) => {
          return (t: any) => {
            if (t.id === item.id) {
              t.checked = !item.checked;
            }
            return t;
          };
        })
      )
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

    disposables.push(
      vscode.commands.registerCommand("marquee.jsonImport", () => {
        this.wipe();
        vscode.window
          .showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            openLabel: 'Import',
            filters: FILE_FILTER,
            title: 'Import Marquee Extension',
          })
          .then((importPath) => {
            const filePath = (importPath || [])[0];

            if (!filePath) {
              return;
            }

            try {
              const importJSON = readFileSync(filePath.fsPath);
              const obj = JSON.parse(importJSON.toString());

              /**
               * ToDo(Christian): use "type" property to detect valid marquee extension
               * once everyone has updated
               */
              if (!obj.version) {
                throw new Error('Invalid Marquee Configuration');
              }

              this.context.globalState
                .update(persistenceKey, obj)
                .then(() => {
                  vscode.window.showInformationMessage(
                    `Successfully imported Marquee state from ${filePath.path}`
                  );
                  return this.openGui();
                });
            } catch (err: any) {
              vscode.window.showErrorMessage(
                `Error importing file marquee-export.json: ${err.message}`
              );
              return this.openGui();
            }
          });
      })
    );

    disposables.push(
      vscode.commands.registerCommand("marquee.jsonExport", () => {
        const json = this.stateMgr.recover();

        const {
          autoDetect,
          bg,
          language,
          name,
          notes,
          read,
          since,
          snippets,
          spoken,
          todos,
          version,
          workspaces,
        } = json;

        const jsonExport = {
          type: CONFIG_FILE_TYPE,
          autoDetect,
          bg,
          language,
          name,
          notes,
          read,
          since,
          snippets,
          spoken,
          todos,
          version,
          workspaces,
        };

        vscode.window
          .showSaveDialog({
            saveLabel: 'Export',
            filters: FILE_FILTER,
            title: 'Export Marquee Extension',
          })
          .then((exportPath) => {
            if (!exportPath) {
              return;
            }

            const efile = exportPath?.fsPath;
            try {
              writeFileSync(efile, JSON.stringify(jsonExport, null, 1));
              vscode.window.showInformationMessage(
                `Successfully exported Marquee state to ${efile}`
              );
            } catch (err: any) {
              vscode.window.showErrorMessage(
                `Error writing export file marquee-export.json: ${err.message}`
              );
            }
          });
      })
    );

    disposables.push(
      vscode.commands.registerCommand(
        "marquee.archive",
        this.stateMgr.handleItem((item: any) => {
          return (t: any) => {
            if (t.id === item.id) {
              t.archived = !item.archived;
            }
            return t;
          };
        })
      )
    );

    disposables.push(
      vscode.commands.registerCommand(
        "marquee.move",
        this.stateMgr.handleItem((item: any) => {
          return (t: any) => {
            const awsp = this.stateMgr.getActiveWorkspace()?.id;
            if (awsp !== undefined && t.id === item.id) {
              t.workspaceId = awsp;
            }
            return t;
          };
        })
      )
    );

    disposables.push(
      vscode.commands.registerCommand(
        "marquee.insertSnippet",
        (item: Snippet) => {
          vscode.window.activeTextEditor?.edit((editor) => {
            const pos = vscode.window.activeTextEditor?.selection;
            if (pos) {
              editor.insert(pos.active, item.body);
              if (vscode.window.activeTextEditor) {
                vscode.window.activeTextEditor?.revealRange(
                  new vscode.Range(pos.start, pos.end),
                  vscode.TextEditorRevealType.InCenterIfOutsideViewport
                );
                vscode.window.showTextDocument(
                  vscode.window.activeTextEditor.document
                );
              }
            }
          });
        }
      )
    );

    disposables.push(
      vscode.commands.registerTextEditorCommand(
        "marquee.insertSnippetEditor",
        (editor: vscode.TextEditor) => {
          const recovered = this.stateMgr.recover();

          if (recovered.snippets) {
            const qp = vscode.window.createQuickPick();
            qp.items = recovered.snippets.map((snippet: Snippet) => {
              return {
                label: snippet.title,
                snippet,
              };
            });
            qp.onDidChangeSelection((selection: any) => {
              editor.insertSnippet(
                new vscode.SnippetString(selection[0].snippet.body),
                editor.selection.start
              );
              qp.hide();
            });
            qp.onDidHide(() => {
              qp.dispose();
            });
            qp.show();
          }
        }
      )
    );

    disposables.push(
      vscode.commands.registerTextEditorCommand(
        "marquee.addSnippetEditor",
        (editor: vscode.TextEditor) => {
          const { text, id, path, name, lang } = this.getTextSelection(editor);

          if (text.length < 1) {
            return;
          }

          this.stateMgr.save((latest: any) => {
            const snippets = latest.snippets || [];
            const dup = snippets.find((t: any) => t.id === id);
            if (snippets && !dup) {
              const n: Snippet = {
                archived: false,
                title: name,
                body: text,
                createdAt: new Date().getTime(),
                id: id,
                origin: path,
                path: path,
                language: { name: lang, value: lang },
                workspaceId: this.stateMgr.getActiveWorkspace()?.id,
              };
              const newSnippets = [n].concat(snippets);
              return { ...latest, snippets: newSnippets };
            }
          });
          vscode.commands.executeCommand("marquee.refreshCodeActions");
          vscode.window
            .showInformationMessage(
              `Added ${name} to your snippets in Marquee`,
              "Open Marquee"
            )
            .then((item) => {
              if (item) {
                return this.openGui();
              }
            });
        }
      )
    );

    disposables.push(
      vscode.commands.registerTextEditorCommand(
        "marquee.addTodoEditor",
        (editor: vscode.TextEditor) => {
          const { text, id, path, lang } = this.getTextSelection(editor);

          if (text.length < 1) {
            return;
          }

          this.stateMgr.save((latest: any) => {
            const todos = latest.todos || [];
            const dup = todos.find((t: any) => t.id === id);
            if (todos && !dup) {
              const nt: Todo = {
                archived: false,
                body: text,
                checked: false,
                id: id,
                path: path,
                language: lang,
                workspaceId: this.stateMgr.getActiveWorkspace()?.id,
              };
              const newTodos = [nt].concat(todos);
              return { ...latest, todos: newTodos };
            }
            return latest;
          });

          this.openView();
        }
      )
    );

    disposables.push(
      vscode.commands.registerCommand(
        "marquee.addTodo",
        (diagnostic: vscode.Diagnostic) => {
          let body =
            vscode.window.activeTextEditor?.document.getText(
              diagnostic.range
            ) || "";

          if (body.length < 1) {
            return;
          }

          const path = vscode.window.activeTextEditor?.document.uri.path;
          body = body.replace(/TODO[:]? /g, "").trim();
          const lang = vscode.window.activeTextEditor?.document.languageId;

          const nt: Todo = {
            archived: false,
            body: body,
            checked: false,
            id: generateId(),
            path: `${path}:${diagnostic.range.start.line}`,
            language: lang || "",
            workspaceId: this.stateMgr.getActiveWorkspace()?.id,
          };

          this.stateMgr.save((latest: any) => {
            const todos = latest.todos || [];
            const dup = todos.find((t: any) => t.id === nt.id);
            if (todos && !dup) {
              const newTodos = [nt].concat(todos);
              return { ...latest, todos: newTodos };
            }
            return latest;
          });

          vscode.commands.executeCommand("marquee.refreshCodeActions");
          this.openView();
        }
      )
    );

    const snippetDiagnostics = vscode.languages.createDiagnosticCollection(
      "todo"
    );
    this.context.subscriptions.push(snippetDiagnostics);

    this.subscribeToChanges(snippetDiagnostics);
    disposables.push(
      vscode.languages.registerCodeActionsProvider("*", new TodoInfo(), {
        providedCodeActionKinds: TodoInfo.providedCodeActionKinds,
      })
    );

    disposables.map((d) => this.context.subscriptions.push(d));
    return disposables;
  }

  private updatePathsExistence() {
    return this.stateMgr.save((latest: any) => {
      ["snippets", "todos"].map((k) => {
        const data = latest[k] || [];
        data.map((p: any) => {
          p.exists = false;
          if (p.path !== null && p.path) {
            let file = p.path;
            let splt = file.split(":");
            if (splt.length > 2) {
              splt = splt.splice(0, splt.length - 1);
              file = splt.join(":");
            } else if (splt.length > 1) {
              file = splt[0];
            }
            const exists = existsSync(vscode.Uri.parse(file).fsPath);
            p.exists = exists;
          }
          return p;
        });
      });
      return latest;
    });
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

  public subscribeToChanges(diagnostics: vscode.DiagnosticCollection): void {
    this.refreshActiveTextEditor(diagnostics);

    this.context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
          this.refreshDiagnostics(editor.document, diagnostics);
        }
      })
    );
    this.context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument((e) =>
        this.refreshDiagnostics(e.document, diagnostics)
      )
    );
    this.context.subscriptions.push(
      vscode.workspace.onDidCloseTextDocument((doc) =>
        diagnostics.delete(doc.uri)
      )
    );
    this.context.subscriptions.push(
      vscode.commands.registerCommand("marquee.refreshCodeActions", () => {
        this.refreshActiveTextEditor(diagnostics);
      })
    );
  }

  private refreshActiveTextEditor(diagnostics: vscode.DiagnosticCollection) {
    if (vscode.window.activeTextEditor) {
      this.refreshDiagnostics(
        vscode.window.activeTextEditor.document,
        diagnostics
      );
    }
  }

  private refreshDiagnostics(
    doc: vscode.TextDocument,
    snippetDiagnostics: vscode.DiagnosticCollection
  ): void {
    const diagnostics: vscode.Diagnostic[] = [];
    const recovered = this.stateMgr.recover();
    const enabled = recovered.autoDetect === true;

    for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
      const lineOfText = doc.lineAt(lineIndex);
      if (enabled && lineOfText.text.match(TODO)) {
        if (recovered.todos) {
          const found = recovered.todos.find((snippet: any) => {
            if (
              snippet.path &&
              vscode.Uri.parse(snippet.path).fsPath.indexOf(doc.uri.fsPath) > -1
            ) {
              const splt = snippet.path.split(":");
              const li = parseInt(splt[splt.length - 1], 10);
              return lineIndex === li;
            }
          });
          if (found) {
            continue;
          }
        }
        diagnostics.push(this.createDiagnostic(doc, lineOfText, lineIndex));
      }
    }

    snippetDiagnostics.set(doc.uri, diagnostics);
  }

  private createDiagnostic(
    doc: vscode.TextDocument,
    lineOfText: vscode.TextLine,
    lineIndex: number
  ): vscode.Diagnostic {
    const match = lineOfText.text.match(TODO);
    const sub = match ? match[0] : "TODO ";
    const index = lineOfText.text.indexOf(sub);
    const range = new vscode.Range(
      lineIndex,
      index,
      lineIndex,
      lineOfText.text.length
    );

    const diagnostic = new vscode.Diagnostic(
      range,
      "Add todo to Marquee?",
      vscode.DiagnosticSeverity.Information
    );
    diagnostic.code = CODE_TODO;
    diagnostic.source = doc.getText(range);
    return diagnostic;
  }

  private onWest(state: Observable<Message>, key: string) {
    return state.pipe(
      pluck("west"),
      filter((west) => west !== undefined),
      filter((obj) => {
        if (!obj) {
          return false;
        }
        return Object.keys(obj).filter((k) => k === key).length === 1;
      }),
      map((obj) => {
        return obj;
      })
    );
  }

  protected handleEvents() {
    const update$ = this.stateMgr.handleUpdates();
    this.handleNotify(update$);
    this.handleCommands(update$);
    const recovered: Message = { east: { ...this.stateMgr.recover() } };
    const state$ = merge(of(recovered), update$);
    this.handleExists(state$);

    const interval$ = interval(10000);
    const global$ = timer(INIT, 300);
    const workspace = of(this.stateMgr.getActiveWorkspace());

    merge(
      interval$,
      global$.pipe(
        map(() => vscode.window.state.focused),
        pairwise(),
        filter((pair) => pair[0] !== pair[1])
      )
    )
      .pipe(throttleTime(1000))
      .subscribe(() => {
        this.stateMgr.save((latest: any) => {
          return { ...latest };
        });
      });

    const all$ = combineLatest([
      workspace,
      state$,
    ]).pipe(share());

    const info = getExtProps(this.context);
    all$.subscribe(
      ([activeWorkspace, update]) => {
        const upd = { ...update.east, ...update.west };
        const payload = {
          ...upd,
          activeWorkspace,
          info,
        };
        this.stateMgr.update(payload);
      }
    );
  }

  private handleExists(state$: Observable<any>) {
    state$
      .pipe(
        filter((obj) => obj.east !== undefined),
        map((obj) => {
          return { ...obj.east };
        }),
        map((obj) => {
          return from(
            ["snippets", "todos"].map((k) => {
              const data = obj[k] || [];
              return data.filter((item: any) => item.exists === undefined);
            })
          );
        }),
        mergeMap((obj) => obj),
        filter((obj) => {
          if (obj.length > 0) {
            return obj;
          }
        })
      )
      .subscribe(() => {
        this.updatePathsExistence();
      });
  }

  private handleCommands(state$: Observable<any>) {
    this.onWest(state$, "execCommands")
      .pipe(
        filter((obj) => {
          return obj !== undefined && obj.execCommands !== undefined;
        }),
        mergeMap((obj) => {
          if (obj && obj.execCommands) {
            return from(obj.execCommands);
          }

          return from([]);
        })
      )
      .subscribe((cmd) => {
        if (
          cmd.args &&
          cmd.args.length > 0 &&
          cmd.command === "vscode.openFolder"
        ) {
          vscode.commands.executeCommand(
            cmd.command,
            vscode.Uri.parse(cmd.args[0].toString()),
            cmd.options
          );
        } else if (cmd.args && cmd.args.length > 0) {
          vscode.commands.executeCommand(cmd.command, cmd.args[0], cmd.options);
        } else {
          vscode.commands.executeCommand(cmd.command, undefined, cmd.options);
        }
      });
  }

  private handleNotify(state$: Observable<any>) {
    this.onWest(state$, "notify")
      .pipe(
        map((obj) => {
          if (obj && obj.notify !== undefined) {
            return obj.notify;
          }
        })
      )
      .subscribe((notif: any) => {
        switch (notif.type) {
          case NotificationType.ERROR:
          default:
            vscode.window.showErrorMessage(notif.message);
        }
      });
  }
}

class TodoInfo implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ];

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
  ): vscode.CodeAction[] {
    return context.diagnostics
      .filter((diagnostic) => diagnostic.code === CODE_TODO)
      .map((diagnostic) => {
        return this.createCommandCodeAction(diagnostic);
      });
  }

  private createCommandCodeAction(
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(
      "Add todo",
      vscode.CodeActionKind.QuickFix
    );
    action.command = {
      command: "marquee.addTodo",
      title: "Add todo",
      arguments: [diagnostic],
    };
    action.diagnostics = [diagnostic];
    action.isPreferred = true;
    return action;
  }
}

function generateId(): string {
  const buf = Buffer.alloc(20);
  return crypto.randomFillSync(buf).toString("hex");
}
