import pick from 'lodash.pick'
import hash from 'object-hash'
import type { ExtensionContext } from 'vscode'

import { Logger } from '../../logger'
import { DEPRECATED_GLOBAL_STORE_KEY } from '../../constants'
import type { StateProvider } from '../types'

export class VSCodeState<State> implements StateProvider<State> {
  #state: State

  constructor (
    public context: ExtensionContext,
    private _key: string,
    private _defaultState: State
  ) {
    const oldGlobalStore = this.context.globalState.get<object>(DEPRECATED_GLOBAL_STORE_KEY, {})
    this.#state = {
      ...this._defaultState,
      ...pick(oldGlobalStore, Object.keys(this._defaultState as any)),
      ...this.context.globalState.get<State>(this._key)
    }

    /**
     * preserve state across different machines
     */
    this.context.globalState.setKeysForSync(Object.keys(this._defaultState as any))
  }

  get state () {
    return this.#state
  }

  /**
   * Update extension state
   * @param prop state property name
   * @param val new state property value
   * @param broadcastState set to true if you want to broadcast this state change
   *                       (only needed when updating state from the extension host)
   */
  async updateState <T extends keyof State = keyof State>(prop: T, val: State[T]) {
    /**
     * check if we have to update
     */
    if (
      typeof val !== 'undefined' &&
      typeof this.#state[prop] !== 'undefined' &&
      hash(this.#state[prop] as any) === hash(val as any)
    ) {
      return
    }

    Logger.info(`Update state "${prop.toString()}": ${val as any as string}`)
    this.#state[prop] = val
    await this.context.globalState.update(this._key, this.#state)
  }

  async clear () {
    this.#state = { ...this._defaultState }
    await this.context.globalState.update(this._key, this.#state)
    await this.context.globalState.update(DEPRECATED_GLOBAL_STORE_KEY, undefined)
  }

  getState (): State {
    throw new Error('Method not implemented.')
  }

  sync (): State {
    return this.state
  }
}
