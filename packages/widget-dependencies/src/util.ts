import vscode from 'vscode'
import type { TerminalProvider } from './types'

declare const IS_WEB_BUNDLE: boolean

// https://decipher.dev/30-seconds-of-typescript/docs/URLJoin/
export function urlJoin (...args: string[]) {
  return args
    .join('/')
    .replace(/[\/]+/g, '/')
    .replace(/^(.+):\//, '$1://')
    .replace(/^file:/, 'file:/')
    .replace(/\/(\?|&|#[^!])/g, '$1')
    .replace(/\?/g, '&')
    .replace('&', '?')
}

export function getFetch (): typeof fetch {
  return IS_WEB_BUNDLE ? fetch : require('node-fetch').default
}

export class NamedTerminalProvider implements TerminalProvider {
  private terminals: Record<string, vscode.Terminal> = {}

  constructor (
    private name: string
  ) { }

  getOrCreateTerminal (cwd: vscode.Uri): vscode.Terminal {
    const key = cwd.fsPath

    if(key in this.terminals && this.terminals[key].exitStatus) {
      this.terminals[key].dispose()
      delete this.terminals[key]
    }

    if(!(key in this.terminals)) {
      this.terminals[key] = vscode.window.createTerminal(
        {
          name: this.name,
          cwd: cwd.fsPath,
          isTransient: true
        }
      )
    }

    const terminal = this.terminals[key]

    return terminal
  }

  dispose () {
    Object.values(this.terminals)
      .forEach(terminal => terminal.dispose())
  }
}
