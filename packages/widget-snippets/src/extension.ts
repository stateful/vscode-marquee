import vscode from 'vscode';

import ExtensionManager from '@vscode-marquee/utils/extension';

import { DEFAULT_STATE } from './constants';
import type { Snippet, State, Selection, Language } from './types';

const STATE_KEY = 'widgets.snippets';


export class SnippetExtensionManager extends ExtensionManager<State, {}> {
  constructor (context: vscode.ExtensionContext, channel: vscode.OutputChannel) {
    super(context, channel, STATE_KEY, {}, DEFAULT_STATE);
    this._disposables.push(
      vscode.commands.registerCommand('marquee.snippet.move', this._moveSnippet.bind(this)),
      vscode.commands.registerCommand('marquee.snippet.insert', this._insertSnippet.bind(this)),
      vscode.commands.registerCommand("marquee.snippet.addEmpty", this._addEmptySnippet.bind(this)),
      vscode.commands.registerTextEditorCommand('marquee.snippet.insertEditor', this._insertEditor.bind(this)),
      vscode.commands.registerTextEditorCommand('marquee.snippet.add', this._addSnippet.bind(this))
    );
  }

  private _addEmptySnippet () {
    this.emit('openDialog', { event: 'openAddSnippetDialog', payload: true });
  }

  /**
   * add snippet into text editor
   */
  private _addSnippet (editor: vscode.TextEditor) {
    const { text, path, name, lang } = this.getTextSelection(editor);

    if (text.length < 1) {
      return vscode.window.showWarningMessage('Marquee: no text selected');
    }

    const snippet: Snippet = {
      archived: false,
      title: name,
      body: text,
      createdAt: new Date().getTime(),
      id: this.generateId(),
      origin: path,
      path: path,
      language: { name: lang, value: lang } as Language,
      workspaceId: this.getActiveWorkspace()?.id || null,
    };
    const newSnippets = [snippet].concat(this.state.snippets);
    this.updateState('snippets', newSnippets);
    this.broadcast({ snippets: newSnippets });

    vscode.commands.executeCommand("marquee.refreshCodeActions");
    vscode.window.showInformationMessage(
      `Added ${name} to your snippets in Marquee`,
      "Open Marquee"
    ).then((item) => item && this.emit('gui.open'));
  }

  /**
   * insert snippet into editor
   */
  private _insertEditor (editor: vscode.TextEditor) {
    const qp = vscode.window.createQuickPick<Selection>();
    qp.items = this.state.snippets.map((snippet: Snippet): Selection => ({
      label: snippet.title,
      snippet
    }));
    qp.onDidChangeSelection((selection) => {
      editor.insertSnippet(
        new vscode.SnippetString(selection[0].snippet.body),
        editor.selection.start
      );
      qp.hide();
    });
    qp.onDidHide(() => qp.dispose());
    qp.show();
  }

  /**
   * insert snippet
   */
  private _insertSnippet (item: Snippet) {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (!activeTextEditor) {
      return console.error('No active text editor found');
    }

    activeTextEditor.edit((editor) => {
      if (!activeTextEditor.selection) {
        return console.warn('No text selected');
      }

      const pos = activeTextEditor.selection;
      editor.insert(pos.active, item.body);
      activeTextEditor.revealRange(
        new vscode.Range(pos.start, pos.end),
        vscode.TextEditorRevealType.InCenterIfOutsideViewport
      );
      vscode.window.showTextDocument(activeTextEditor.document);
    });
  }

  /**
   * archive todo
   * @param item TreeView item that represents a todo in a tree view
   * @returns (un)archived todo
   */
  private _moveSnippet (item: { id: string, archived: boolean }) {
    const awsp = this.getActiveWorkspace();

    if (!awsp) {
      return console.warn('Can\'t move snippet, no workspace selected');
    }

    const snippetIndex = this.state.snippets.findIndex((s) => s.id === item.id);

    if (snippetIndex < 0) {
      return console.warn(`Couldn't find snippet to toggle with id "${item.id}"`);
    }

    this.state.snippets[snippetIndex].workspaceId = awsp.id;
    this.updateState('snippets', this.state.snippets);
  }
}

export function activate (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new SnippetExtensionManager(context, channel);

  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    }
  };
}
export * from './types';
