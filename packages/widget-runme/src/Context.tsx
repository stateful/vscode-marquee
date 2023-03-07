import React from 'react'

import { connect, getEventListener, MarqueeWindow } from '@vscode-marquee/utils'
import { createContext } from 'react'
import { Configuration, Context, State } from './types'

declare const window: MarqueeWindow

const RunmeContext = createContext<Context>({} as any)
const WIDGET_ID = '@vscode-marquee/runme-widget'

interface Props {
  children?: React.ReactNode;
}

const RunmeProvider = ({ children }: Props) => {
  const widgetState = getEventListener<State & Configuration>(WIDGET_ID)
  const providerValues = connect<Configuration & State>(
    {
      ...window.marqueeStateConfiguration[WIDGET_ID].configuration,
      ...window.marqueeStateConfiguration[WIDGET_ID].state
    }, widgetState
  )

  return (
    <RunmeContext.Provider
      value={{ ...providerValues }}
    >
      { children }
    </RunmeContext.Provider>
  )
}

export default RunmeContext
export { RunmeProvider }
