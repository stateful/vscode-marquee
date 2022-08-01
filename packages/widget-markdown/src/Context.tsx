import React, { createContext, useContext, useEffect, useState } from 'react'
import { connect, getEventListener, MarqueeWindow } from '@vscode-marquee/utils'

import type { State, Context, WidgetEvents, MarkdownDocument } from './types'

declare const window: MarqueeWindow
const MarkdownContext = createContext<Context>({} as Context)
export const WIDGET_ID = '@vscode-marquee/markdown-widget'

export const MarkdownProvider = ({ children }: { children: React.ReactElement }) => {
  const [selectedMarkdownContent, setSelectedMarkdownContent] = useState<string>()
  const [markdownDocuments, setMarkdownDocuments] = useState<MarkdownDocument[]>([])
  const widgetState = getEventListener<State & WidgetEvents>(WIDGET_ID)
  const providerValues = connect<State>(window.marqueeStateConfiguration[WIDGET_ID].state, widgetState as any)
  useEffect(() => {
    widgetState.on('selectedMarkdownContent', setSelectedMarkdownContent)
    widgetState.on('markdownDocuments', setMarkdownDocuments)

    return () => {
      widgetState.removeAllListeners()
    }
  }, [])

  return (
    <MarkdownContext.Provider
      value={{
        ...providerValues,
        selectedMarkdownContent,
        markdownDocuments
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
