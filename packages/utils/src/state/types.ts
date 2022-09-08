import { ExtensionContext } from 'vscode'

export abstract class StateProvider<State> {
  abstract context: ExtensionContext
  abstract state: State

  /**
   * Allows to sync a specific key value pair with provider
   * @param key state key
   * @param value state value
   */
  abstract updateState (key: keyof State, value: State[keyof State]): Promise<void>
  /**
   * Downloads the latest state from the provider and returns it
   */
  abstract getState (): State
  /**
   * Gets the provider values and compares them with local ones. If a conflict
   * is detected the value of the environment that was last updated is picked.
   * ToDo(Christian): make this configurable, e.g. allow to get asked etc.
   */
  abstract sync (): State
  /**
   * Clears the state of the provider
   */
  abstract clear (): Promise<void>
}
