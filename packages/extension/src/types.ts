import type { EventEmitter } from 'events';
import type { Client } from 'tangle';
import type { Disposable } from 'vscode';
import type ExtensionManager from '@vscode-marquee/utils/extension';

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

export interface ExtensionExport<State = any, Configuration = any> {
  marquee: {
    disposable: ExtensionManager<State, Configuration> & Disposable
    defaultState?: Record<string, any>
    defaultConfiguration?: Record<string, any>
    setup: (tangle: Client<any>) => EventEmitter | undefined
  }
  [i: string]: any
}
