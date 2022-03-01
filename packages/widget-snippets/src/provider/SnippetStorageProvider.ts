import path from 'path';
import vscode from 'vscode';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

import { STATE_KEY } from '../constants';
import type { State, Snippet as OrigSnippet } from '../types';

export class Snippet implements vscode.FileStat {
  type: vscode.FileType = vscode.FileType.File;
  size: number;
  path: string;
  origin: string;
  ctime: number;
  mtime: number;

  constructor(
    public workspaceId: string | null = null,
    public title = 'New Snippet',
    public body = '',
    public archived = false,
    public createdAt = Date.now(),
    public id = uuidv4(),
    snippetPath?: string
  ) {
    this.type = vscode.FileType.File;
    this.size = body.length;
    this.path = path.join(`/${id}`, snippetPath || title);
    this.origin = this.path;
    this.ctime = this.createdAt;
    this.mtime = this.createdAt;
  }

  static fromSnippet (s: OrigSnippet) {
    const snippet = new Snippet(s.workspaceId, s.title, s.body, s.archived, s.createdAt, s.id, s.path);
    return snippet;
  }

  get data () {
    const enc = new TextEncoder();
    return enc.encode(this.body);
  }
}

export default class SnippetStorageProvider extends EventEmitter implements vscode.FileSystemProvider {
  static scheme = 'snippet';

  private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
  readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

  constructor (
    private _context: vscode.ExtensionContext,
    private _channel: vscode.OutputChannel,
    private _workspaceId?: string
  ) {
    super();
  }

  watch(): vscode.Disposable {
    return new vscode.Disposable(() => { });
  }

  stat(uri: vscode.Uri): Snippet {
    if (uri.path.slice(1) === 'New Snippet') {
      return new Snippet(this._workspaceId);
    }

    const state = this._context.globalState.get<State>(STATE_KEY);
    const snippet = state?.snippets.find((snippet) => snippet.path === uri.path);

    if (!snippet) {
      throw new Error(`Couldn't find snippet at ${uri.path}`);
    }

    this.emit('fileStat', snippet.id);
    return Snippet.fromSnippet(snippet);
  }

  readDirectory(): [string, vscode.FileType][] {
    const state = this._context.globalState.get<State>(STATE_KEY);
    return state?.snippets.map((s) => [s.title, vscode.FileType.File]) || [];
  }

  readFile(uri: vscode.Uri): Uint8Array {
    const snippet = this.stat(uri);
    return snippet.data;
  }

  async writeFile(uri: vscode.Uri, content: Uint8Array) {
    if (uri.path.slice(1) === 'New Snippet') {
      const snippetName = await vscode.window.showInputBox({
        title: 'Snippet Name',
        prompt: 'Please give your snippet a name (e.g. myReactHook.ts)'
      }).then((val) => val || 'New Snippet');

      const snippet = new Snippet(
        this._workspaceId,
        path.basename(snippetName),
        content.toString(),
        false,
        undefined,
        undefined,
        snippetName
      );

      /**
       * emit with delay so that VSCode can store the file and no prompt appears
       */
      setTimeout(() => this.emit('saveNewSnippet', snippet), 100);
      this._channel.appendLine(`New snippet add "${snippetName}"` + this._workspaceId ? `, to workspace with id ${this._workspaceId}` : '');
      return;
    }

    const snippet = this.stat(uri);
    snippet.body = content.toString();
    this._channel.appendLine(`Updated snippet "${snippet.title}"`);
    setTimeout(() => this.emit('updateSnippet', snippet), 100);
  }

  // Not needed/implemented
  rename(): void {}
  delete(): void {}
  createDirectory(): void {}
}
