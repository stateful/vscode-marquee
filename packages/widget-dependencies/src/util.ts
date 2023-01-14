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
  private terminal?: vscode.Terminal
  
  constructor (
    private name: string
  ) { }

  getOrCreateTerminal (): vscode.Terminal {
    if(this.terminal && !this.terminal.exitStatus) { return this.terminal }

    this.terminal?.dispose()
    
    this.terminal = vscode.window.createTerminal(
      this.name
    )

    return this.terminal
  }

  dispose () {
    this.terminal?.dispose()
  }
}