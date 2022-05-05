import React, { createContext, useEffect } from 'react'
import { connect, getEventListener, MarqueeWindow } from '@vscode-marquee/utils'

import { DEFAULT_STATE } from './constants'
import type { Context, State, Events } from './types'

declare const window: MarqueeWindow

interface Props {
  children?: React.ReactNode;
}

const TrickContext = createContext<Context>(DEFAULT_STATE as any as Context)
const WIDGET_ID = '@vscode-marquee/welcome-widget'

const TrickProvider = ({ children }: Props) => {
  const widgetState = getEventListener<State>(WIDGET_ID)
  const widgetEvents = getEventListener<Events>(WIDGET_ID)
  const providerValues = connect<State>(window.marqueeStateConfiguration[WIDGET_ID].state, widgetState)

  const _setRead = (id: string) => {
    if (!providerValues.read.includes(id)) {
      providerValues.setRead([...providerValues.read, id])
    }
  }

  const _setLiked = (id: string) => {
    if (!providerValues.liked.includes(id)) {
      providerValues.setLiked([...providerValues.liked, id])
      widgetEvents.emit('upvote', id)
    }
  }

  const _resetRead = () => {
    providerValues.setRead([])
  }

  useEffect(() => {
    return () => {
      widgetState.removeAllListeners()
      widgetEvents.removeAllListeners()
    }
  }, [])

  return (
    <TrickContext.Provider
      value={{
        ...providerValues,
        _setLiked,
        _setRead,
        _resetRead,
      }}
    >
      {children}
    </TrickContext.Provider>
  )
}

export default TrickContext
export { TrickProvider }
