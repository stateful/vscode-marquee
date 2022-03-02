import vscode from 'vscode';
import type { Client } from 'tangle';

import ExtensionManager from '@vscode-marquee/utils/extension';

import ContentProvider from './provider/ContentProvider';
import SnippetStorageProvider from './provider/SnippetStorageProvider';
import { DEFAULT_STATE, STATE_KEY } from './constants';
import type { Snippet, SnippetTreeItem, State, Events, Selection, Language } from './types';

export class SnippetExtensionManager extends ExtensionManager<State, {}> {
  private _contentProvider = new ContentProvider();
  private _fsProvider: SnippetStorageProvider;

  constructor (context: vscode.ExtensionContext, channel: vscode.OutputChannel) {
    super(context, channel, STATE_KEY, {}, DEFAULT_STATE);
    this._fsProvider = new SnippetStorageProvider(context, channel, this.getActiveWorkspace()?.id);

    this._disposables.push(
      vscode.commands.registerCommand('marquee.snippet.move', this._moveSnippet.bind(this)),
      vscode.commands.registerCommand('marquee.snippet.addEmpty', this._addEmptySnippet.bind(this)),
      vscode.commands.registerCommand('marquee.snippet.insert', this._insertFromTreeView.bind(this)),
      vscode.commands.registerCommand('marquee.snippet.remove', this._removeSnippet.bind(this)),
      vscode.commands.registerCommand('marquee.snippet.copyToClipboard', this._copyToClipboard.bind(this)),

      vscode.commands.registerTextEditorCommand('marquee.snippet.insertEditor', this._insertEditor.bind(this)),
      vscode.commands.registerTextEditorCommand('marquee.snippet.add', this._addSnippet.bind(this)),
      vscode.workspace.registerTextDocumentContentProvider(ContentProvider.scheme, this._contentProvider),
      vscode.workspace.registerFileSystemProvider(SnippetStorageProvider.scheme, this._fsProvider, { isCaseSensitive: true })
    );

    this._fsProvider.on('saveNewSnippet', (snippet) => {
      const newSnippets = [snippet].concat(this.state.snippets);
      this.updateState('snippets', newSnippets);
      this.broadcast({ snippets: newSnippets });

      vscode.commands.executeCommand("marquee.refreshCodeActions");
      vscode.window.showInformationMessage(
        `Added ${snippet.title} to your snippets in Marquee`,
        "Open Marquee"
      );
      vscode.commands.executeCommand("workbench.action.closeActiveEditor");
      this._openSnippet(snippet.path);
    });

    this._fsProvider.on('updateSnippet', (snippet) => {
      const index = this.state.snippets.findIndex((s) => s.id === snippet.id);
      if (index < 0) {
        return vscode.window.showErrorMessage(`Couldn't update snippet "${snippet.title}"`);
      }

      this.state.snippets[index].body = snippet.body;
      this.updateState('snippets', this.state.snippets);
      this.broadcast({ snippets: this.state.snippets });
    });
  }

  private async _addEmptySnippet () {
    return this._openSnippet('/New Snippet');
  }

  private async _openSnippet (path: string) {
    const setting: vscode.Uri = vscode.Uri.parse(`${SnippetStorageProvider.scheme}:${path}`);
    const doc = await vscode.workspace.openTextDocument(setting);
    await vscode.window.showTextDocument(doc, 2, false);
  }

  /**
   * add snippet into text editor
   */
  private _addSnippet (editor: vscode.TextEditor) {
    const { text, name, lang } = this.getTextSelection(editor);

    if (text.length < 1) {
      return vscode.window.showWarningMessage('Marquee: no text selected');
    }

    const id = this.generateId();
    const path = `/${id}/${editor.document.uri.path.split('/').pop() || `/${name}.txt`}`;
    const snippet: Snippet = {
      archived: false,
      title: name,
      body: text,
      createdAt: new Date().getTime(),
      id: this.generateId(),
      origin: path,
      path,
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
   * insert snippet
   * this action is triggerd by either clicking on a snippet tree view item
   * or clicking on "Insert" in the context menu
   */
  private _insertFromTreeView (item: Snippet | SnippetTreeItem) {
    const snippet = (item as SnippetTreeItem).isTreeItem
      ? (item as SnippetTreeItem).item
      : item as Snippet;
    const activeTextEditor = vscode.window.activeTextEditor;

    if (!activeTextEditor) {
      return vscode.window.showInformationMessage(
        'Marquee: No editor open, a snippet can only be inserted into a text document.'
      );
    }

    activeTextEditor.edit((editor) => {
      if (!activeTextEditor.selection) {
        return console.warn('No text selected');
      }

      const pos = activeTextEditor.selection;
      editor.insert(pos.active, snippet.body);
      activeTextEditor.revealRange(
        new vscode.Range(pos.start, pos.end),
        vscode.TextEditorRevealType.InCenterIfOutsideViewport
      );
      vscode.window.showTextDocument(activeTextEditor.document);
    });
  }

  private _copyToClipboard ({ item }: SnippetTreeItem) {
    vscode.env.clipboard.writeText(item.body);
  }

  /**
   * remove snippet after clicking on "Remove" through the context menu
   * in the tree view
   */
  private _removeSnippet ({ item }: SnippetTreeItem) {
    const newSnippets = this.state.snippets.filter((s) => s.id !== item.id);
    this.updateState('snippets', newSnippets);
    this.broadcast({ snippets: newSnippets });
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

  public setBroadcaster (tangle: Client<State>) {
    super.setBroadcaster(tangle);

    const _tangle = this._tangle as any as Client<Events>;

    /**
     * open snippet document by webview request
     */
    _tangle.on('openSnippet', (path: string) => this._openSnippet(path));

    /**
     * select snippet in webview when file is opened
     */
    this._fsProvider.on('fileStat', (id: string) => _tangle.emit('selectSnippet', id));

    return this;
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
