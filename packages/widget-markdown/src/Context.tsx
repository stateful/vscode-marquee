import React, { createContext, useContext, useEffect } from 'react'
import { connect, getEventListener, MarqueeWindow } from '@vscode-marquee/utils'

import type { State, Context } from './types'

declare const window: MarqueeWindow
const MarkdownContext = createContext<Context>({} as Context)
export const WIDGET_ID = '@vscode-marquee/markdown-widget'

export const MarkdownProvider = ({ children }: { children: React.ReactElement }) => {
  const widgetState = getEventListener<State>(WIDGET_ID)
  const providerValues = connect<State>(window.marqueeStateConfiguration[WIDGET_ID].state, widgetState)

  useEffect(() => {
    return () => {
      widgetState.removeAllListeners()
    }
  }, [])

  return (
    <MarkdownContext.Provider
      value={{
        ...providerValues,
      }}
    >
      {children}
    </MarkdownContext.Provider>
  )
}

export const useMarkdownContext = () => {
  return useContext(MarkdownContext)
}

export default MarkdownContext
