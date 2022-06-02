import React, { createContext, useContext, useEffect } from 'react'
import { connect, getEventListener, MarqueeWindow } from '@vscode-marquee/utils'

import type { State, Context } from './types'

declare const window: MarqueeWindow
const ProjectInfoContext = createContext<Context>({} as Context)
export const WIDGET_ID = '@vscode-marquee/project-info-widget'

export const ProjectInfoProvider = ({ children }: { children: React.ReactElement }) => {
  const widgetState = getEventListener<State>(WIDGET_ID)
  const providerValues = connect<State>(window.marqueeStateConfiguration[WIDGET_ID].state, widgetState)

  useEffect(() => {
    return () => {
      widgetState.removeAllListeners()
    }
  }, [])

  return (
    <ProjectInfoContext.Provider
      value={{
        ...providerValues,
      }}
    >
      {children}
    </ProjectInfoContext.Provider>
  )
}

export const useProjectInfoContext = () => {
  return useContext(ProjectInfoContext)
}

export default ProjectInfoContext
