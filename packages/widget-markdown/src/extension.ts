import vscode from 'vscode'

import ExtensionManager from '@vscode-marquee/utils/extension'
import { State } from './types'
import path from 'path'
import { v5 as uuid } from 'uuid'

const STATE_KEY = 'widgets.markdown'

const getMarkdownDocumentId = (path: string) => {
  // derive deterministic ID for files from path
  const FILE_UUID_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341'
  return uuid(path, FILE_UUID_NAMESPACE)
}

const uriToMarkdownDocument = async (fileUri: vscode.Uri) => ({
  id: getMarkdownDocumentId(fileUri.path),
  name: path.basename(fileUri.path),
  content: (await vscode.workspace.fs.readFile(fileUri)).toString(),
})

const loadMarkdownDocuments = async () => {
  const { workspace } = vscode
  const fileUris = await workspace.findFiles('*.md')
  const markdownDocuments = await Promise.all(
    fileUris.map(uriToMarkdownDocument)
  )

  return markdownDocuments
}

export class MarkdownExtensionManager extends ExtensionManager<State, {}> {
  constructor (context: vscode.ExtensionContext, channel: vscode.OutputChannel) {
    super(
      context,
      channel,
      STATE_KEY,
      {},
      { markdownDocuments: [], markdownDocumentSelected: undefined }
    )

    // Load initial documents
    loadMarkdownDocuments().then((markdownDocuments) => {
      this.updateState('markdownDocuments', markdownDocuments)
      this.broadcast({ markdownDocuments })
      if (markdownDocuments.length > 0) {
        this.updateState('markdownDocumentSelected', markdownDocuments[0].id)
        this.broadcast({ markdownDocumentSelected: markdownDocuments[0].id })
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

    this.addListener('markdownDocumentSelected', (markdownDocumentSelected) => {
      console.log('!!!!!!')
      console.log('!!!!!!')
      console.log('!!!!!!')
      console.log(markdownDocumentSelected)
    })

    this._tangle?.listen(
      'markdownDocumentSelected',
      (markdownDocumentSelected) => {
        console.log('!!!!!!')
        console.log('!!!!!!')
        console.log('!!!!!!')
        console.log(markdownDocumentSelected)
      }
    )

    this._tangle?.whenReady().then(() => {
      console.log('READY!!!')
      console.log('READY!!!')
      console.log('READY!!!')
      console.log('READY!!!')
      console.log('READY!!!')
      console.log('READY!!!')
      console.log('READY!!!')
      console.log('READY!!!')
    })
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

  listenToMarkdownSelection = () => {
    console.log('BINGO BONGO', !!this._tangle)
    if (this._tangle) {
      console.log('BINGO!')
      this._subscriptions.push(
        this._tangle.listen('markdownDocumentSelected', (val) =>
          console.log({ val })
        )
      )

      console.log(this._tangle.eventNames())
    }
  }
}

export function activate (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new MarkdownExtensionManager(context, channel)
  stateManager.listenToMarkdownSelection()
  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager),
    },
  }
}
