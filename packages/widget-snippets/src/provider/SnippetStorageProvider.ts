import path from 'path'
import vscode from 'vscode'
import { EventEmitter } from 'events'
import { Logger, ChildLogger } from '@vscode-marquee/utils/extension'

import Snippet from '../models/Snippet'
import { STATE_KEY } from '../constants'
import type { State } from '../types'

export default class SnippetStorageProvider extends EventEmitter implements vscode.FileSystemProvider {
  static scheme = 'snippet'

  #logger: ChildLogger
  private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>()
  readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event

  constructor (
    private _context: vscode.ExtensionContext,
    private _workspaceId?: string
  ) {
    super()
    this.#logger = Logger.getChildLogger('SnippetStorageProvider')
  }

  watch (): vscode.Disposable {
    return new vscode.Disposable(() => { })
  }

  stat (uri: vscode.Uri): Snippet {
    if (uri.path.slice(1) === 'New Clipboard Item') {
      return new Snippet(this._workspaceId)
    }

    const state = this._context.globalState.get<State>(STATE_KEY)
    let snippet = state?.snippets.find((snippet) => (snippet.storagePath || snippet.path) === uri.path)

    /**
     * in Marquee v2 and earlier `path` was used to recognise the source of the snippet.
     * This has changed in v3 where `path` represents the virtual path and `origin` the
     * source of the snippet. To allow finding old snippets (e.g. imported in v3) we do
     * this extra check.
     * In v4 the storage path in now written into `storagePath` property.
     */
    if (!snippet) {
      const [id, path] = uri.path.split('/').filter(Boolean)
      snippet = state?.snippets.find((snippet) => snippet.id === id && (snippet.storagePath || snippet.path) === path)
    }

    if (!snippet) {
      const message = `Couldn't find snippet at ${uri.path}`
      this.#logger.error(message)
      throw new Error(message)
    }

    this.emit('fileStat', snippet.id)
    return Snippet.fromObject(snippet)
  }

  readDirectory (): [string, vscode.FileType][] {
    const state = this._context.globalState.get<State>(STATE_KEY)
    return state?.snippets.map((s) => [s.title, vscode.FileType.File]) || []
  }

  readFile (uri: vscode.Uri): Uint8Array {
    const snippet = this.stat(uri)
    return snippet.data
  }

  async writeFile (uri: vscode.Uri, content: Uint8Array) {
    /**
     * add new snippet
     */
    if (uri.path.slice(1) === 'New Clipboard Item') {
      const snippetName = await vscode.window.showInputBox({
        title: 'Clipboard Name',
        prompt: 'Please give your Clipboard Item a name (e.g. myReactHook.ts)'
      }).then((val) => val || 'New Clipboard Item')

      const snippet = new Snippet(
        this._workspaceId,
        path.basename(snippetName),
        content.toString()
      )

      /**
       * emit with delay so that VS Code can store the file and no prompt appears
       */
      setTimeout(() => this.emit('saveNewSnippet', snippet), 100)
      this.#logger.info(
        `New snippet add "${snippetName}"` + (this._workspaceId ? `, to workspace with id ${this._workspaceId}` : '')
      )
      return
    }

    const snippet = this.stat(uri)
    snippet.body = content.toString()
    this.#logger.info(`Updated snippet "${snippet.title}"`)
    setTimeout(() => this.emit('updateSnippet', snippet), 100)
  }

  // Not needed/implemented
  rename (): void {}
  delete (): void {}
  createDirectory (): void {}
}
