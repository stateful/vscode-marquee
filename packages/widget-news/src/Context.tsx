import React, { createContext } from 'react'
import { connect, getEventListener, MarqueeWindow } from '@vscode-marquee/utils'

import type { Context, Configuration, State } from './types'

declare const window: MarqueeWindow
const NewsContext = createContext<Context>({} as Context)
export const WIDGET_ID = '@vscode-marquee/news-widget'

export const NewsProvider = ({ children }: { children: React.ReactElement }) => {
  const widgetState = getEventListener<Configuration & State>(WIDGET_ID)
  const providerValues = connect<Configuration & State>({
    ...window.marqueeStateConfiguration[WIDGET_ID].configuration,
    ...window.marqueeStateConfiguration[WIDGET_ID].state
  }, widgetState)

  return (
    <NewsContext.Provider value={{ ...providerValues }}>
      {children}
    </NewsContext.Provider>
  )
}

export default NewsContext
