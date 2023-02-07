import type { ExtensionContext } from 'vscode'
import type { StateProvider } from '../types'

export class VSCodeState implements StateProvider {
  constructor (public context: ExtensionContext) {}

  getState (key: string) {
    return this.context.globalState.get(key) as never
  }

  async setState (key: string, value: any) {
    await this.context.globalState.update(key, value)
  }
}
