import vscode from 'vscode'
import { EventEmitter } from 'events'
import { API, GitExtension } from '../types/git'

export default class GitProvider extends EventEmitter implements vscode.Disposable {
  #git?: API
  #disposables: vscode.Disposable[] = []
  #branch?: string
  #commit?: string

  constructor (protected _context: vscode.ExtensionContext) {
    super()

    if (this.path) {
      this.#init()
    }
  }

  get path () {
    if (!vscode.workspace.workspaceFolders) {
      return
    }
    return vscode.workspace.workspaceFolders[0].uri
  }

  get repo () {
    return this.path ? this.#git?.getRepository(this.path) : undefined
  }

  get branch () {
    return this.#branch
  }

  get commit () {
    return this.#commit
  }

  async #init () {
    console.log('[GitProvider] initiate git extension')
    const vscodeGit = vscode.extensions.getExtension('vscode.git') as vscode.Extension<GitExtension>

    if (!vscodeGit) {
      console.error('Failed to load git extension.')
      return
    }

    const ext = await vscodeGit.activate()
    this.#git = ext.getAPI(1)
    this.repo?.state.onDidChange(this.#updateState.bind(this))
  }

  async #updateState () {
    this.#branch = this.getBranch()
    this.#commit = await this.getCommit()
    this.emit('stateUpdate', this)
  }

  getBranch () {
    if (!this.#git) {
      return
    }

    return this.repo?.state.HEAD?.name
  }

  async getCommit () {
    if (!this.#git) {
      return
    }

    const log = await this.repo?.log({
      maxEntries: 1,
      path: vscode.workspace.asRelativePath(this.path!, false)
    })

    if (!log || log?.length === 0) {
      return
    }

    return log[0].hash
  }

  dispose () {
    this.#disposables.forEach((d) => d.dispose())
  }
}
