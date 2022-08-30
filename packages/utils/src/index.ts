/* istanbul ignore file */

import { useState, useEffect } from 'react'
import Channel from 'tangle/webviews'

import type { Client } from 'tangle'

import calculateTheme from './calculateTheme'

import BetterComplete from './components/BetterComplete'
import NetworkError from './components/NetworkError'
import DoubleClickHelper from './components/DoubleClickHelper'
import ProjectItemLink from './components/ProjectItemLink'
import { jumpTo } from './components/utils'

import GlobalContext, { GlobalProvider } from './contexts/Global'
import type { MarqueeWindow, ContextProperties } from './types'

const defaultChannel = 'vscode.marquee'
const theme = calculateTheme()

declare const window: MarqueeWindow

const tangleChannels = new Map<string, any>()
const getEventListener = <T>(channel = defaultChannel) => {
  if (!tangleChannels.has(channel)) {
    const ch = new Channel<T>(channel)
    const eventListener = ch.attach(window.vscode as any)
    tangleChannels.set(channel, eventListener)
    return eventListener
  }
  return tangleChannels.get(channel)! as Client<T>
}

type Entries<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T][]

/**
 * Helper method to connect a widget context with its configuration and
 * application state of the extension host
 *
 * @param defaults combind default values for configuration and state
 * @param tangle   tangle client to broadcast information
 * @returns object containing state values and its setter methods
 */
function connect<T, Events = {}> (defaults: T, tangle: Client<T & Events>): ContextProperties<T> {
  const prevState: any = window.vscode.getState() || {}
  const contextValues: Partial<ContextProperties<T>> = {}
  for (const [prop, defaultVal] of Object.entries(defaults as any) as Entries<ContextProperties<T>>) {
    /**
     * get default state either from:
     * - the webview state (when widget was removed and re-loaded)
     * - the actual default value
     */
    const defaultState = typeof prevState[prop] === 'undefined'
      ? defaultVal
      : prevState[prop]

    const [propState, setPropState] = useState<typeof defaultVal>(defaultState)
    contextValues[prop as keyof T] = propState as ContextProperties<T>[keyof T]

    /**
     * define a custom setter method for a state that:
     * - updates the state
     * - broadcasts it to the extension host for sync
     * - add it to the webview state so if a webview is being revived it
     *   receives its former configurations
     */
    const firstLetter = (prop as string).slice(0, 1).toUpperCase()
    const restLetters = (prop as string).slice(1)
    const setProp = `set${firstLetter}${restLetters}` as `set${Capitalize<keyof T & string>}`
    contextValues[setProp] = ((val: any) => {
      setPropState(val)
      tangle.broadcast({ [prop]: val } as T & Events)
      window.vscode.setState({
        ...(window.vscode.getState() || {}),
        [prop]: val
      })
    }) as any

    /**
     * listen to updates from the extension host and apply it to the property
     * state and webview state
     */
    useEffect(() => {
      const subs = tangle.listen(prop as keyof T, (val: any) => {
        setPropState(val)
        window.vscode.setState({
          ...(window.vscode.getState() || {}),
          [prop]: val
        })
      })

      return () => { subs?.unsubscribe() }
    }, [])
  }

  return contextValues as ContextProperties<T>
}

export {
  jumpTo,
  getEventListener,
  theme,
  connect,

  // components
  BetterComplete,
  NetworkError,
  DoubleClickHelper,
  ProjectItemLink,

  // contexts
  GlobalContext,
  GlobalProvider
}
export default theme
export * from './types'
