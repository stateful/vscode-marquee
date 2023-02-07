import path from 'path'
import vscode from 'vscode'

import fetch from 'node-fetch'
import { v5 as uuid } from 'uuid'
import { Client } from 'tangle'

import ExtensionManager, { Logger, ChildLogger } from '@vscode-marquee/utils/extension'

import { DEFAULT_CONFIGURATION, DEFAULT_STATE } from './constants'
import type { Configuration, MarkdownDocument, State } from './types'

export const STATE_KEY = 'widgets.markdown'
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
  #logger: ChildLogger
  #loadedDocument?: MarkdownDocument

  constructor (context: vscode.ExtensionContext) {
    super(
      context,
      STATE_KEY,
      DEFAULT_CONFIGURATION,
      DEFAULT_STATE
    )

    this.#logger = Logger.getChildLogger(STATE_KEY)
    // keep watching for changes
    const watcher = vscode.workspace.createFileSystemWatcher(
      '**/*.md',
      false,
      true,
      false
    )
    watcher.onDidCreate(({ fsPath }) => this.addMarkdownDocument(fsPath))
    watcher.onDidDelete(({ fsPath }) => this.removeMarkdownDocument(fsPath))
    this.onChangeExternalMarkdownFiles((externalMarkdownFiles) => {
      const markdownDocuments = [
        ...this.state.markdownDocuments.filter(({ isRemote }) => !isRemote),
        ...externalMarkdownFiles.map((uri) => uriToMarkdownDocument(uri, true)),
      ]

      this.updateConfiguration('externalMarkdownFiles', externalMarkdownFiles)
      this.updateState('markdownDocuments', markdownDocuments)
      this.broadcast({ externalMarkdownFiles, markdownDocuments })
    })
  }

  onChangeExternalMarkdownFiles = (cb: (files: string[]) => void) => {
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (
        e.affectsConfiguration('marquee.widgets.markdown.externalMarkdownFiles')
      ) {
        const configuration = vscode.workspace.getConfiguration(
          'marquee.widgets.markdown'
        )

        const updatedExternalMarkdownFiles: string[] = configuration.get(
          'externalMarkdownFiles'
        )!

        cb(updatedExternalMarkdownFiles)
      }
    })
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
    /**
     * ensure we don't unnecessarily load the same content
     * and run into a tangle endless loop
     */
    if (this.#loadedDocument?.id === doc.id) {
      return
    }

    let selectedMarkdownContent
    if (doc.isRemote) {
      selectedMarkdownContent = await fetchRemoteDocument(doc.path).then(
        (content) => content,
        (err: any) => `Error: Could not fetch remote document: ${(err as Error).message}`
      )
    } else {
      const uri = vscode.Uri.file(doc.path)
      selectedMarkdownContent = (await vscode.workspace.fs.readFile(uri)).toString()
    }

    this.#loadedDocument = doc
    this.updateState('selectedMarkdownContent', selectedMarkdownContent)
    this.updateState('markdownDocumentSelected', doc.id)
    this.broadcast({ selectedMarkdownContent })
  }

  private addMarkdownDocument = async (uri: string) => {
    const doc = await uriToMarkdownDocument(uri, false)
    const oldMarkdownDocuments = this.state.markdownDocuments
    const updatedMarkdownDocuments = [...oldMarkdownDocuments, doc]
    this.updateState('markdownDocuments', updatedMarkdownDocuments)
    this.broadcast({ markdownDocuments: updatedMarkdownDocuments })
  }

  private removeMarkdownDocument = (uri: string) => {
    const id = getMarkdownDocumentId(uri)
    const oldMarkdownDocuments = this.state.markdownDocuments
    const updatedMarkdownDocuments = oldMarkdownDocuments.filter(
      (doc) => doc.id !== id
    )
    this.updateState('markdownDocuments', updatedMarkdownDocuments)
    this.broadcast({ markdownDocuments: updatedMarkdownDocuments })
  }

  public setBroadcaster (tangle: Client<State & Configuration>) {
    super.setBroadcaster(tangle)

    // load content when file is selected
    tangle.listen('markdownDocumentSelected', (id) => {
      const selectedDoc = this.state.markdownDocuments
        .find((doc) => doc.id === id)
      if (!selectedDoc) {
        return
      }
      this.loadMarkdownContent(selectedDoc)
    })

    // Load initial documents
    this.loadMarkdownDocuments().then((markdownDocuments) => {
      this.updateState('markdownDocuments', markdownDocuments)
      this.broadcast({ markdownDocuments })
      if (markdownDocuments.length > 0) {
        this.loadMarkdownContent(markdownDocuments[0])
      }
    }, (err: any) => this.#logger.error(`Error fetching Markdown files: ${(err as Error).message}`))

    return this
  }
}

export function activate (context: vscode.ExtensionContext) {
  const stateManager = new MarkdownExtensionManager(context)
  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    },
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

export * from './types'
