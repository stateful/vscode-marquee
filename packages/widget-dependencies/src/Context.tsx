import React, { useEffect, useRef, useState } from 'react'

import { connect, getEventListener, MarqueeWindow } from '@vscode-marquee/utils'
import { createContext } from 'react'
import { Configuration, Context, DisplayedDependency, EventId, Events, EventsObj, State } from './types'

declare const window: MarqueeWindow

const DependencyContext = createContext<Context>({} as any)
const WIDGET_ID = '@vscode-marquee/dependencies-widget'

interface Props {
  children?: React.ReactNode;
}

const DependencyProvider = ({ children }: Props) => {
  const initialized = useRef<boolean>(false)
  
  const widgetState = getEventListener<State & Configuration>(WIDGET_ID)

  const providerValues = connect<Configuration & State>(
    { 
      ...window.marqueeStateConfiguration[WIDGET_ID].configuration,
      ...window.marqueeStateConfiguration[WIDGET_ID].state
    }, widgetState)
  
  const [ _eventId, _setEventId ] = useState<EventId>(0)
  
  const _broadcastEvent = <K extends keyof Events>(
    event: K,
    payload: Events[K]
  ) => {
    const eventObj = {
      type: event, payload
    } as EventsObj
    
    providerValues.setEvent({
      ...eventObj,
      id: _eventId
    })
  
    _setEventId(id => id + 1)
  }

  const _refreshDependencies = () => {
    _broadcastEvent('refreshDependencies', {})
  }

  const _updateDependency = (dep: DisplayedDependency, toVersion: string) => {
    _broadcastEvent(
      'updateDependency',
      {
        packageId: dep.name,
        toVersion,
        workspace: dep.project
      }
    )
  }

  const _removeDependency = (dep: DisplayedDependency) => {
    _broadcastEvent(
      'removeDependency',
      { 
        packageId: dep.name, 
        workspace: dep.project, 
        isRootWorkspace: dep.isRootWorkspace 
      }
    )
  }

  const _updateAllDependencies = () => {
    _broadcastEvent(
      'updateAllDependencies',
      {}
    )
  }

  useEffect(() => {
    if(providerValues.loading || initialized.current) { return }
    _refreshDependencies()
    initialized.current = true
  }, [providerValues.loading])

  return (
    <DependencyContext.Provider
      value={{
        ...providerValues,
        _refreshDependencies,
        _updateDependency,
        _removeDependency,
        _updateAllDependencies
      }}
    >
      { children }
    </DependencyContext.Provider>
  )
}

export default DependencyContext
export { DependencyProvider }