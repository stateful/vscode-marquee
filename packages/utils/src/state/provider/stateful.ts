import type { ExtensionContext } from 'vscode'
import type { StateProvider } from '../types'

export class StatefulState<State> implements StateProvider<State> {
  #state: State = {} as State

  constructor (public context: ExtensionContext) {}

  get state () {
    return this.#state
  }

  async updateState (/*key: keyof State, value: State[keyof State]*/): Promise<void> {
    // throw new Error('Method not implemented.')
  }
  getState (): State {
    throw new Error('Method not implemented.')
  }
  sync (): State {
    throw new Error('Method not implemented.')
  }
  clear (): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
