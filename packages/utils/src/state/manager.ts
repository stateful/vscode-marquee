import { Disposable, ExtensionContext } from 'vscode'

import provider from './provider'
import { VSCodeState } from './provider/vscode'
import { Logger } from '../logger'
import type { StateProvider } from './types'

export class StateManager<State> implements Disposable {
  #state?: State
  #logger: Logger
  #context: ExtensionContext
  #provider: StateProvider<State>[] = []

  constructor (context: ExtensionContext, key: string, defaultState: State) {
    this.#logger = Logger.getChildLogger('StateManager')
    this.#context = context
    this.#provider.push(
      /**
       * always
       */
      new VSCodeState(this.#context, key, defaultState),
      ...(this.#context.workspaceState.get<string[]>('stateProvider') || [])
        .filter((p) => Boolean(provider[p]))
        .map((p) => new provider[p](context, key, defaultState))
    )
  }

  get state (): State  {
    if (!this.state) {
      throw new Error('StateManager is not in sync')
    }

    return this.state
  }

  async updateState <T extends keyof State = keyof State>(prop: T, val: State[T]) {
    for (const provider of this.#provider) {
      await provider.updateState(prop, val)
    }
  }

  async clearState () {
    for (const provider of this.#provider) {
      await provider.clear()
    }
  }

  /**
   * Downloads current State from providers and merge them if necessary
   */
  async sync () {
    for (const provider of this.#provider) {
      await provider.sync()
    }
  }

  dispose () {
    // nothing to do
  }
}
