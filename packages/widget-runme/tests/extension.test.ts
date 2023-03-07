import vscode from 'vscode'
import { activate } from '../src/extension'

const sleep = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms))

test('can be initiated', async () => {
  (vscode.workspace.findFiles as jest.Mock).mockResolvedValue(['foo', 'bar'])
  const ext = activate({} as any)
  expect(vscode.workspace.createFileSystemWatcher)
    .toBeCalledWith('**/*.md', false, true, false)
  expect(ext.marquee.disposable.state.isInstalled).toBe(false)
  await sleep()
  expect(ext.marquee.disposable.updateState).toBeCalledWith('notebooks', ['foo', 'bar'], true)
})

test('it can find files', async () => {
  (vscode.workspace.findFiles as jest.Mock).mockResolvedValue(['foo', 'bar'])
  const onDidDelete = jest.fn()
  const onDidCreate = jest.fn()
  ;(vscode.workspace.createFileSystemWatcher as jest.Mock).mockReturnValue({
    onDidCreate, onDidDelete
  })
  const ext = activate({} as any)
  await sleep()
  onDidCreate.mock.calls[0][0]('foobar')
  expect(ext.marquee.disposable.updateState)
    .toBeCalledWith('notebooks', ['foo', 'bar', 'foobar'], true)
  ;(ext.marquee.disposable.updateState as jest.Mock).mockClear()

  onDidDelete.mock.calls[0][0]('bar')
  expect(ext.marquee.disposable.updateState)
    .toBeCalledWith('notebooks', ['foo'], true)
  ;(ext.marquee.disposable.updateState as jest.Mock).mockClear()

  onDidDelete.mock.calls[0][0]('barfoo')
  expect(ext.marquee.disposable.updateState).toBeCalledTimes(0)
})

// import vscode from 'vscode'
// import ExtensionManager, { Logger }  from '@vscode-marquee/utils/extension'
// import { DEFAULT_CONFIGURATION, DEFAULT_STATE } from './constants'
// import type { Configuration, State } from './types'

// const STATE_KEY = 'widgets.runme'

// export class RunmeExtensionManager extends ExtensionManager<State, Configuration> {
//   #notebooks: string[] = []

//   constructor (context: vscode.ExtensionContext) {
//     super(
//       context,
//       STATE_KEY,
//       DEFAULT_CONFIGURATION,
//       DEFAULT_STATE
//     )
//     this._state = DEFAULT_STATE
//     this.#init()

//     const watcher = vscode.workspace.createFileSystemWatcher(
//       '**/*.md',
//       false,
//       true,
//       false
//     )
//     watcher.onDidCreate((uri) => this.#onFileChange(uri))
//     watcher.onDidDelete((uri) => this.#onFileChange(uri, true))
//   }

//   async #init () {
//     this.#notebooks = [
//       ...await vscode.workspace.findFiles('**/*.md'),
//       // ...await vscode.workspace.findFiles('**/*.mdx')
//     ].map((notebook) => notebook.toString())
//     this.updateState('notebooks', this.#notebooks, true)
//   }

//   #onFileChange (uri: vscode.Uri, wasDeleted?: boolean) {
//     const notebookPath = uri.toString()
//     const notebooks = JSON.parse(JSON.stringify(this.#notebooks))

//     if (wasDeleted) {
//       notebooks.splice(notebooks.indexOf(notebookPath), 1)
//     } else {
//       notebooks.push(notebookPath)
//     }

//     this.updateState('notebooks', notebooks, true)
//     this.broadcast({ notebooks })
//     Logger.info(wasDeleted
//       ? `Runme notebook ("${notebookPath}") was deleted from file system`
//       : `New notebook found in file system "${notebookPath}"`)
//   }
// }

// export function activate (context: vscode.ExtensionContext) {
//   const stateManager = new RunmeExtensionManager(context)
//   return {
//     marquee: {
//       disposable: stateManager,
//       defaultState: stateManager.state,
//       defaultConfiguration: stateManager.configuration,
//       setup: stateManager.setBroadcaster.bind(stateManager)
//     }
//   }
// }
