import vscode from 'vscode'
import { EventEmitter } from 'events'
import { API, GitExtension, Remote } from '../types/git'
import type { GitRemote } from '../types'

const sleep = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms))

export class GitProvider extends EventEmitter implements vscode.Disposable {
  #git?: API
  #disposables: vscode.Disposable[] = []
  #branch?: string
  #commit?: string
  #gitUri?: string

  constructor (protected _context: vscode.ExtensionContext) {
    super()
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

  get gitUri () {
    return this.#gitUri
  }

  async init () {
    const vscodeGit = vscode.extensions.getExtension('vscode.git') as vscode.Extension<GitExtension>

    if (!vscodeGit) {
      console.error('Failed to load git extension.')
      return
    }

    const ext = await vscodeGit.activate()
    this.#git = ext.getAPI(1)
    this.#registerWhenInitiated()
  }

  /**
   * wait until git extension has initiated the repository and then
   * register listener
   */
  async #registerWhenInitiated () {
    const start = Date.now()
    while (!this.repo) {
      await sleep()
      if ((Date.now() - start) > 5000) {
        break
      }
    }

    if (this.repo) {
      this.repo?.state.onDidChange(this.#updateState.bind(this))
      await this.#updateState()
    }
  }

  async #updateState () {
    this.#branch = this.getBranch()
    this.#commit = await this.getCommit()
    this.#gitUri = await this.getGitUri()
    this.emit('stateUpdate', this)
  }

  getBranch () {
    if (!this.#git) {
      return
    }

    return this.repo?.state.HEAD?.name
  }

  getGitUri () {
    if (!this.#git) {
      return
    }

    const refs = this.#getGitRemotes()
    if (refs.length === 0) {
      return
    }

    return refs[0].url
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

  #getGitRemotes (): GitRemote[] {
    const repo = this.repo
    if (!repo) {
      return []
    }

    const remotes = repo.state.remotes.filter((r) => {
      return r.fetchUrl || r.pushUrl
    })
    const branchRemote = repo.state.HEAD?.upstream?.remote
    remotes.sort((a, b) => {
      if (a.name === branchRemote) {
        return -1
      }
      if (b.name === branchRemote) {
        return 1
      }
      if (a.name === 'origin') {
        return -1
      }
      if (b.name === 'origin') {
        return 1
      }
      const aIncludeGithub = (a.fetchUrl || a.pushUrl || '').includes('github.com')
      const bIncludeGithub = (b.fetchUrl || b.pushUrl || '').includes('github.com')
      if (aIncludeGithub !== bIncludeGithub) {
        if (aIncludeGithub) {
          return -1
        }
        if (bIncludeGithub) {
          return 1
        }
      }
      return a.name.localeCompare(b.name)
    })
    return remotes
      .map((r: Remote) => {
        let url = r.fetchUrl || r.pushUrl || ''
        const i = url.indexOf('#')
        if (i > -1) {
          url = url.slice(0, i)
        }
        // add upstream branch to git url
        if (
          url &&
          r.name &&
          r.name === repo.state.HEAD?.upstream?.remote &&
          repo.state.HEAD.upstream.name
        ) {
          url += `#${repo.state.HEAD.upstream.name}`
        }
        return { name: r.name, url }
      })
      .filter((v) => v.url)
  }

  dispose () {
    this.#disposables.forEach((d) => d.dispose())
  }
}
