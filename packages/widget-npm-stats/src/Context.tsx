import React, { createContext, useEffect } from 'react'
import { connect, getEventListener, MarqueeWindow } from '@vscode-marquee/utils'

import type { Context, Configuration, State } from './types'

declare const window: MarqueeWindow
const NPMStatsContext = createContext<Context>({} as Context)
export const WIDGET_ID = '@vscode-marquee/npm-stats-widget'

export const NPMStatsProvider = ({ children }: { children: React.ReactElement }) => {
  const widgetState = getEventListener<Configuration & State>(WIDGET_ID)
  const providerValues = connect<Configuration & State>({
    ...window.marqueeStateConfiguration[WIDGET_ID].configuration,
    ...window.marqueeStateConfiguration[WIDGET_ID].state
  }, widgetState)

  useEffect(() => {
    return () => {
      widgetState.removeAllListeners()
    }
  }, [])

  return (
    <NPMStatsContext.Provider value={{ ...providerValues }}>
      {children}
    </NPMStatsContext.Provider>
  )
}

export default NPMStatsContext
