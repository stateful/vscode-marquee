import type { EventEmitter } from 'events';
import type { Client } from 'tangle';
import type { Disposable } from 'vscode';

export interface ExtensionConfiguration {
  proxy: string
  fontSize: number
  launchOnStartup: boolean
  workspaceLaunch: boolean
  colorScheme: {
    r: number
    g: number
    b: number
    a: number
  }
}

export interface ExtensionExport {
  marquee: {
    disposable: Disposable
    defaultState?: Record<string, any>
    defaultConfiguration?: Record<string, any>
    setup: (tangle: Client<any>) => EventEmitter | undefined
  }
  [i: string]: any
}
