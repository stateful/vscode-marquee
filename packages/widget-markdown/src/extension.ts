import vscode from 'vscode'

import ExtensionManager from '@vscode-marquee/utils/extension'
import { State } from './types'
import path from 'path'
import { v5 as uuid } from 'uuid'

const STATE_KEY = 'widgets.markdown'

const FILE_UUID_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341'

const loadMarkdownDocuments = async () => {
  const { workspace } = vscode
  const fileUris = await workspace.findFiles('*.md')
  const markdownDocuments = await Promise.all(
    fileUris.map(async (fileUri) => ({
      // derive deterministic ID for files from path
      id: uuid(fileUri.path, FILE_UUID_NAMESPACE),
      name: path.basename(fileUri.path),
      content: (await workspace.fs.readFile(fileUri)).toString(),
    }))
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
  }
}

export function activate (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new MarkdownExtensionManager(context, channel)
  loadMarkdownDocuments().then((markdownDocuments) => {
    stateManager.updateState('markdownDocuments', markdownDocuments)
    if (markdownDocuments.length > 0) {
      stateManager.updateState('markdownDocumentSelected', markdownDocuments[0].id)
    }
  })

  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager),
    },
  }
}
