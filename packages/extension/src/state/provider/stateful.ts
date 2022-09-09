import type { ExtensionContext } from 'vscode'
import type { StateProvider } from '../types'

export class StatefulState implements StateProvider {
  constructor (public context: ExtensionContext) {}

  getState (): any {
    throw new Error('Method not implemented')
  }

  async setState () {
    throw new Error('Method not implemented')
  }
}
