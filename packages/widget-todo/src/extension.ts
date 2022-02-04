import vscode from 'vscode';

import ExtensionManager from '@vscode-marquee/utils/extension';

import { DEFAULT_CONFIGURATION, DEFAULT_STATE } from './constants';
import type { Configuration, State, Todo } from './types';

const STATE_KEY = 'widgets.todo';
export const CODE_TODO = "marquee_todo";
export const TODO = /(TODO|ToDo|Todo|todo)[:]? /g;

export class TodoExtensionManager extends ExtensionManager<State, Configuration> {
  constructor (context: vscode.ExtensionContext, channel: vscode.OutputChannel) {
    super(context, channel, STATE_KEY, DEFAULT_CONFIGURATION, DEFAULT_STATE);

    const diagnostics = vscode.languages.createDiagnosticCollection('todo');
    this._refreshActiveTextEditor(diagnostics);


    this._disposables.push(
      diagnostics,

      vscode.commands.registerCommand('marquee.todo.toggle', this._toggleTodo.bind(this)),
      vscode.commands.registerCommand('marquee.todo.archive', this._archiveTodo.bind(this)),
      vscode.commands.registerCommand('marquee.todo.move', this._moveTodo.bind(this)),
      vscode.commands.registerCommand('marquee.todo.add', this._addTodo.bind(this)),
      vscode.commands.registerTextEditorCommand('marquee.todo.addEditor', this._addEditor.bind(this)),

      /**
       * diagnostics
       */
      vscode.languages.registerCodeActionsProvider("*", new TodoInfo(), {
        providedCodeActionKinds: TodoInfo.providedCodeActionKinds,
      }),
      vscode.window.onDidChangeActiveTextEditor(
        (editor) => editor && this._refreshDiagnostics(editor.document, diagnostics)),
      vscode.workspace.onDidChangeTextDocument(
        (e) => this._refreshDiagnostics(e.document, diagnostics)),
      vscode.workspace.onDidCloseTextDocument(
        (doc) => diagnostics.delete(doc.uri)),
      vscode.commands.registerCommand("marquee.refreshCodeActions",
        () => this._refreshActiveTextEditor(diagnostics))
    );
  }

  private _refreshActiveTextEditor(diagnostics: vscode.DiagnosticCollection) {
    if (vscode.window.activeTextEditor) {
      this._refreshDiagnostics(
        vscode.window.activeTextEditor.document,
        diagnostics
      );
    }
  }

  private _refreshDiagnostics(
    doc: vscode.TextDocument,
    snippetDiagnostics: vscode.DiagnosticCollection
  ): void {
    const diagnostics: vscode.Diagnostic[] = [];
    const enabled = this.configuration.autoDetect === true;

    for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
      const lineOfText = doc.lineAt(lineIndex);
      if (!enabled || !lineOfText.text.match(TODO)) {
        continue;
      }

      const found = this.state.todos.find((todo: Todo) => {
        if (todo.path && vscode.Uri.parse(todo.path).fsPath.indexOf(doc.uri.fsPath) > -1) {
          const splt = todo.path.split(":");
          const li = parseInt(splt[splt.length - 1], 10);
          return lineIndex === li;
        }

        return false;
      });

      if (found) {
        continue;
      }

      diagnostics.push(this._createDiagnostic(doc, lineOfText, lineIndex));
    }

    snippetDiagnostics.set(doc.uri, diagnostics);
  }

  private _createDiagnostic(
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

  /**
   * add todo
   */
  private _addTodo (diagnostic: vscode.Diagnostic) {
    let body = vscode.window.activeTextEditor?.document.getText(diagnostic.range) || '';

    if (body.length < 1) {
      return;
    }

    const path = vscode.window.activeTextEditor?.document.uri.path;
    body = body.replace(/TODO[:]? /g, "").trim();

    const todo: Todo = {
      archived: false,
      body: body,
      checked: false,
      id: this.generateId(),
      tags: [],
      path: `${path}:${diagnostic.range.start.line}`,
      workspaceId: this.getActiveWorkspace()?.id || null,
    };

    const newTodos = [todo].concat(this.state.todos);
    this.updateState('todos', newTodos);
    this.emit('gui.open');
    vscode.commands.executeCommand("marquee.refreshCodeActions");
  }

  /**
   * add todo from editor
   */
  private _addEditor (editor: vscode.TextEditor) {
    const { text, path } = this.getTextSelection(editor);

    if (text.length < 1) {
      return;
    }

    const todo: Todo = {
      archived: false,
      body: text,
      checked: false,
      id: this.generateId(),
      tags: [],
      path: path,
      workspaceId: this.getActiveWorkspace()?.id || null,
    };
    const newTodos = [todo].concat(this.state.todos);
    this.updateState('todos', newTodos);
    this.emit('gui.open');
  }

  /**
   * toggle todo
   * @param item TreeView item that represents a todo in a tree view
   * @returns toggled todo
   */
  private _toggleTodo (item: { id: string, checked: boolean }) {
    const todoIndex = this.state.todos.findIndex((t) => t.id === item.id);

    if (todoIndex < 0) {
      return console.warn(`Couldn't find todo to toggle with id "${item.id}"`);
    }

    this.state.todos[todoIndex].checked = !item.checked;
    this.updateState('todos', this.state.todos);
  }

  /**
   * archive todo
   * @param item TreeView item that represents a todo in a tree view
   * @returns (un)archived todo
   */
  private _archiveTodo (item: { id: string, archived: boolean }) {
    const todoIndex = this.state.todos.findIndex((t) => t.id === item.id);

    if (todoIndex < 0) {
      return console.warn(`Couldn't find todo to toggle with id "${item.id}"`);
    }

    this.state.todos[todoIndex].archived = !item.archived;
    this.updateState('todos', this.state.todos);
  }

  /**
   * archive todo
   * @param item TreeView item that represents a todo in a tree view
   * @returns (un)archived todo
   */
   private _moveTodo (item: { id: string, archived: boolean }) {
    const awsp = this.getActiveWorkspace();

    if (!awsp) {
      return console.warn('Can\'t move todo, no workspace selected');
    }

    const todoIndex = this.state.todos.findIndex((t) => t.id === item.id);

    if (todoIndex < 0) {
      return console.warn(`Couldn't find todo to toggle with id "${item.id}"`);
    }

    this.state.todos[todoIndex].workspaceId = awsp.id;
    this.updateState('todos', this.state.todos);
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
      command: "marquee.todo.add",
      title: "Add todo",
      arguments: [diagnostic],
    };
    action.diagnostics = [diagnostic];
    action.isPreferred = true;
    return action;
  }
}

export function activate (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new TodoExtensionManager(context, channel);

  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    }
  };
}
