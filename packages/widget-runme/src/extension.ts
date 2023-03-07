import vscode from 'vscode'
import ExtensionManager, { Logger }  from '@vscode-marquee/utils/extension'
import { DEFAULT_CONFIGURATION, DEFAULT_STATE } from './constants'
import type { Configuration, State } from './types'

const STATE_KEY = 'widgets.runme'

export class RunmeExtensionManager extends ExtensionManager<State, Configuration> {
  #notebooks: string[] = []

  constructor (context: vscode.ExtensionContext) {
    super(
      context,
      STATE_KEY,
      DEFAULT_CONFIGURATION,
      DEFAULT_STATE
    )
    this._state = DEFAULT_STATE
    this.#init()

    const watcher = vscode.workspace.createFileSystemWatcher(
      '**/*.md',
      false,
      true,
      false
    )
    watcher.onDidCreate((uri) => this.#onFileChange(uri))
    watcher.onDidDelete((uri) => this.#onFileChange(uri, true))
  }

  async #init () {
    this.#notebooks = [
      ...await vscode.workspace.findFiles('**/*.md'),
      // ...await vscode.workspace.findFiles('**/*.mdx')
    ].map((notebook) => notebook.toString())
    this.updateState('notebooks', this.#notebooks, true)
  }

  #onFileChange (uri: vscode.Uri, wasDeleted?: boolean) {
    const notebookPath = uri.toString()
    const notebooks = JSON.parse(JSON.stringify(this.#notebooks))

    if (!wasDeleted) {
      notebooks.push(notebookPath)
    } else if (notebooks.includes(notebookPath)) {
      notebooks.splice(notebooks.indexOf(notebookPath), 1)
    } else {
      return
    }

    this.updateState('notebooks', notebooks, true)
    this.broadcast({ notebooks })
    Logger.info(wasDeleted
      ? `Runme notebook ("${notebookPath}") was deleted from file system`
      : `New notebook found in file system "${notebookPath}"`)
  }
}

export function activate (context: vscode.ExtensionContext) {
  const stateManager = new RunmeExtensionManager(context)
  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    }
  }
}
