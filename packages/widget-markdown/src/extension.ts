import vscode from 'vscode'

import ExtensionManager from '@vscode-marquee/utils/extension'
import { Configuration, MarkdownDocument, State } from './types'
import path from 'path'
import { v5 as uuid } from 'uuid'
import { Client } from 'tangle'
import fetch from 'node-fetch'

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

export class MarkdownExtensionManager extends ExtensionManager<
State,
Configuration
> {
  constructor (context: vscode.ExtensionContext, channel: vscode.OutputChannel) {
    super(
      context,
      channel,
      STATE_KEY,
      { externalMarkdownFiles: [] },
      { markdownDocuments: [], selectedMarkdownContent: undefined }
    )

    // Load initial documents
    this.loadMarkdownDocuments().then((markdownDocuments) => {
      this.updateState('markdownDocuments', markdownDocuments)
      this.broadcast({ markdownDocuments })
      if (markdownDocuments.length > 0) {
        this.loadMarkdownContent(markdownDocuments[0])
      }
    })

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
    const { workspace } = vscode
    const fileUris = await workspace.findFiles('*.md')
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
    let selectedMarkdownContent
    if (doc.isRemote) {
      try {
        selectedMarkdownContent = await fetchRemoteDocument(doc.path)
      } catch (e) {
        selectedMarkdownContent = 'Error: Could not fetch remote document.'
      }
    } else {
      const uri = vscode.Uri.file(doc.path)
      selectedMarkdownContent = (
        await vscode.workspace.fs.readFile(uri)
      ).toString()
    }

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
      defaultConfiguration: stateManager.configuration,
      setup: (tangle: Client<State & Configuration>) => {
        // load content when file is selected
        tangle.whenReady().then(() => {
          tangle.listen(
            'markdownDocumentSelected',
            (markdownDocumentSelectedId) => {
              if (
                stateManager.state.markdownDocumentSelected ===
                markdownDocumentSelectedId
              ) {
                // Check if the selected document actually changed.
                // Otherwise we end up in an infinite state updating loop.
                // See https://github.com/stateful/tangle/issues/35
                return
              }
              const selectedDoc = stateManager.state.markdownDocuments.find(
                (doc) => doc.id === markdownDocumentSelectedId
              )
              if (!selectedDoc) {
                return
              }
              stateManager.loadMarkdownContent(selectedDoc)
            }
          )
        })
        return stateManager.setBroadcaster(tangle)
      },
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
