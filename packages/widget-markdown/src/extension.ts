import path from 'path'
import vscode from 'vscode'

import fetch from 'node-fetch'
import { v5 as uuid } from 'uuid'
import { Client } from 'tangle'

import ExtensionManager from '@vscode-marquee/utils/extension'

import { DEFAULT_CONFIGURATION, DEFAULT_STATE } from './constants'
import type { Configuration, MarkdownDocument, State, WidgetEvents } from './types'

const STATE_KEY = 'widgets.markdown'
const FILE_UUID_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341'
const MARKDOWN_FETCH_ERROR_MESSAGE = 'Couldn\'t fetch markdown file!'

const getMarkdownDocumentId = (path: string) => {
  // derive deterministic ID for files from path
  return uuid(path, FILE_UUID_NAMESPACE)
}

const uriToMarkdownDocument = (uri: string, isRemote: boolean) => ({
  id: getMarkdownDocumentId(uri),
  path: uri,
  name: path.basename(uri),
  isRemote,
})

export class MarkdownExtensionManager extends ExtensionManager<State, Configuration> {
  private _eventTangle?: Client<WidgetEvents>
  private _markdownDocuments: MarkdownDocument[] = []

  constructor (context: vscode.ExtensionContext, channel: vscode.OutputChannel) {
    super(
      context,
      channel,
      STATE_KEY,
      DEFAULT_CONFIGURATION,
      DEFAULT_STATE
    )

    // Load initial documents
    this.loadMarkdownDocuments().then((markdownDocuments) => {
      this._markdownDocuments = markdownDocuments
      this.emitEvent('markdownDocuments', this._markdownDocuments)
      if (markdownDocuments.length > 0) {
        this.loadMarkdownContent(markdownDocuments[0])
      }
    })

    // keep watching for changes
    const watcher = vscode.workspace.createFileSystemWatcher('**/*.md', false, true, false)
    watcher.onDidCreate(({ fsPath }) => this.addMarkdownDocument(fsPath))
    watcher.onDidDelete(({ fsPath }) => this.removeMarkdownDocument(fsPath))

    vscode.workspace.onDidChangeConfiguration((ev: vscode.ConfigurationChangeEvent) => {
      if (!ev.affectsConfiguration('marquee.widgets.markdown.externalMarkdownFiles')) {
        return
      }

      const configuration = vscode.workspace.getConfiguration('marquee.widgets.markdown')
      const externalMarkdownFiles: string[] = configuration.get('externalMarkdownFiles')!
      this._markdownDocuments = [
        ...this._markdownDocuments.filter(({ isRemote }) => !isRemote),
        ...externalMarkdownFiles.map((uri) => uriToMarkdownDocument(uri, true)),
      ]

      this.updateConfiguration('externalMarkdownFiles', externalMarkdownFiles)
      this.emitEvent('markdownDocuments', this._markdownDocuments)
    })
  }

  emitEvent (eventName: keyof WidgetEvents, payload: WidgetEvents[keyof WidgetEvents]) {
    if (!this._eventTangle) {
      return
    }
    this._eventTangle.emit(eventName, payload)
  }

  loadMarkdownDocuments = async () => {
    const fileUris = await vscode.workspace.findFiles('*.md')
    const markdownDocuments = [
      ...fileUris.map((fileUri) =>
        uriToMarkdownDocument(fileUri.fsPath, false)
      ),
      ...this.configuration.externalMarkdownFiles.map((path) =>
        uriToMarkdownDocument(path, true)
      ),
    ]

    return markdownDocuments
  }

  loadMarkdownContent = async (doc: MarkdownDocument) => {
    let selectedMarkdownContent: string
    if (doc.isRemote) {
      selectedMarkdownContent = await fetchRemoteDocument(doc.path).then(
        (content: string) => content,
        (err: Error) => {
          this._channel.appendLine(`Markdown Widget: failed to fetch document - ${err.message}`)
          return 'Error: Could not fetch remote document.'
        })
    } else {
      const uri = vscode.Uri.file(doc.path)
      selectedMarkdownContent = (
        await vscode.workspace.fs.readFile(uri)
      ).toString()
    }

    this.emitEvent('selectedMarkdownContent', selectedMarkdownContent)
    this.updateState('markdownDocumentSelected', doc.id, true)
  }

  private addMarkdownDocument = async (uri: string) => {
    const doc = await uriToMarkdownDocument(uri, false)
    this._markdownDocuments = [...this._markdownDocuments, doc]
    this.emitEvent('markdownDocuments', this._markdownDocuments)
  }

  private removeMarkdownDocument = (uri: string) => {
    const rid = getMarkdownDocumentId(uri)
    this._markdownDocuments = this._markdownDocuments.filter(({ id }) => id !== rid)
    this.emitEvent('markdownDocuments', this._markdownDocuments)
  }

  public setBroadcaster (tangle: Client<State & Configuration> | Client<WidgetEvents>) {
    this._eventTangle = tangle as Client<WidgetEvents>
    super.setBroadcaster(tangle as Client<State & Configuration>)

    // load content when file is selected
    ;(tangle as Client<State & Configuration>).listen('markdownDocumentSelected', (id) => {
      if (this.state.markdownDocumentSelected === id) {
        // Check if the selected document actually changed.
        // Otherwise we end up in an infinite state updating loop.
        // See https://github.com/stateful/tangle/issues/35
        return
      }
      const selectedDoc = this._markdownDocuments.find((doc) => doc.id === id)
      if (!selectedDoc) {
        return
      }
    })
    return this
  }
}

export function activate (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new MarkdownExtensionManager(context, channel)
  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration
    }
  }
}

export async function fetchRemoteDocument (url: string) {
  console.log(`Fetch markdown document via: ${url}`)
  const res = await fetch(url).catch(() => {
    throw new Error(MARKDOWN_FETCH_ERROR_MESSAGE)
  })

  if (!res.ok) {
    throw new Error(`${MARKDOWN_FETCH_ERROR_MESSAGE} (status: ${res.status})`)
  }

  const data = await res.text()
  return data
}
