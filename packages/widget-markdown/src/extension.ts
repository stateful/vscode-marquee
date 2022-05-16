import vscode from 'vscode'

import ExtensionManager from '@vscode-marquee/utils/extension'
import { MarkdownDocument, State } from './types'
import path from 'path'
import { v5 as uuid } from 'uuid'
import { Client } from 'tangle'

const STATE_KEY = 'widgets.markdown'
const FILE_UUID_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341'

const getMarkdownDocumentId = (path: string) => {
  // derive deterministic ID for files from path
  return uuid(path, FILE_UUID_NAMESPACE)
}

const uriToMarkdownDocument = (fileUri: vscode.Uri) => ({
  id: getMarkdownDocumentId(fileUri.path),
  path: fileUri.path,
  name: path.basename(fileUri.path),
  content: undefined,
})

const loadMarkdownDocuments = async () => {
  const { workspace } = vscode
  const fileUris = await workspace.findFiles('*.md')
  const markdownDocuments = fileUris.map(uriToMarkdownDocument)

  return markdownDocuments
}

export class MarkdownExtensionManager extends ExtensionManager<State, {}> {
  constructor (context: vscode.ExtensionContext, channel: vscode.OutputChannel) {
    super(
      context,
      channel,
      STATE_KEY,
      {},
      { markdownDocuments: [], selectedMarkdownContent: undefined }
    )

    // Load initial documents
    loadMarkdownDocuments().then((markdownDocuments) => {
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
    watcher.onDidCreate(this.addMarkdownDocument)
    watcher.onDidDelete(this.removeMarkdownDocument)
  }

  loadMarkdownContent = async (doc: MarkdownDocument) => {
    const uri = vscode.Uri.file(doc.path)
    const selectedMarkdownContent = (
      await vscode.workspace.fs.readFile(uri)
    ).toString()
    this.updateState('selectedMarkdownContent', selectedMarkdownContent)
    this.broadcast({ selectedMarkdownContent })
  }

  private addMarkdownDocument = async (uri: vscode.Uri) => {
    const doc = await uriToMarkdownDocument(uri)
    const oldMarkdownDocuments = this.state.markdownDocuments
    const updatedMarkdownDocuments = [...oldMarkdownDocuments, doc]
    this.updateState('markdownDocuments', updatedMarkdownDocuments)
    this.broadcast({ markdownDocuments: updatedMarkdownDocuments })
  }

  private removeMarkdownDocument = (uri: vscode.Uri) => {
    const id = getMarkdownDocumentId(uri.path)
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
      setup: (tangle: Client<State>) => {
        // load content when file is selected
        tangle.whenReady().then(() => {
          tangle.listen(
            'markdownDocumentSelected',
            (markdownDocumentSelectedId) => {
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
