import React, { createContext, useState, useEffect } from 'react'
import { connect, getEventListener, MarqueeWindow, MarqueeEvents } from '@vscode-marquee/utils'

import { WIDGET_ID } from './constants'
import type { State, Context, Snippet, Events } from './types'
import { DialogContainer, DialogTitle } from '@vscode-marquee/dialog'
import { Button, DialogActions, DialogContent, Typography } from '@mui/material'

declare const window: MarqueeWindow
const SnippetContext = createContext<Context>({} as Context)

const SnippetProvider = ({ children }: { children: React.ReactElement }) => {
  const eventListener = getEventListener<Events & MarqueeEvents>()
  const widgetEvents = getEventListener<Events>(WIDGET_ID)
  const widgetState = getEventListener<State>(WIDGET_ID)
  const providerValues = connect<State>(window.marqueeStateConfiguration[WIDGET_ID].state, widgetState)

  /**
   * for so far unknown reason the `providerValues.snippets` doesn't change when
   * `providerValues.setSnippets` is called within the context, therefor we need
   * to maintain a local state
   */
  const [snippets, _setSnippets] = useState<Snippet[]>(providerValues.snippets)
  const [showCloudSyncFeature, setShowCloudSyncFeature] = useState(false)

  const setSnippets = (snippets: Snippet[]) => {
    _setSnippets(snippets)
    providerValues.setSnippets(snippets)
  }

  const _addSnippet = (
    snippet: Pick<Snippet, 'title' | 'body'>,
    isWorkspaceTodo: boolean
  ): string => {
    eventListener.emit('telemetryEvent', { eventName: 'addSnippet' })
    const globalSnippets = snippets
    const id = [...Array(8)].map(() => Math.random().toString(36)[2]).join('')

    const newSnippet: Partial<Snippet> = Object.assign({}, snippet, {
      id,
      archived: false,
      createdAt: new Date().getTime(),
      workspaceId: isWorkspaceTodo
        ? window.activeWorkspace?.id || null
        : null
    })

    globalSnippets.unshift(newSnippet as Snippet)
    setSnippets(globalSnippets)
    return id
  }

  useEffect(() => {
    widgetEvents.on('selectSnippet', (id) => providerValues.setSnippetSelected(id))
    eventListener.on('addSnippet', (snippet) => _addSnippet(
      snippet,
      snippet.workspaceId === window.activeWorkspace?.id
    ))
    eventListener.on('openCloudSyncFeatureInterest', setShowCloudSyncFeature)
    return () => {
      widgetState.removeAllListeners()
      eventListener.removeAllListeners()
    }
  }, [])

  const _removeSnippet = (id: string) => {
    eventListener.emit('telemetryEvent', { eventName: 'removeSnippet' })
    const globalSnippets = snippets
    const index = globalSnippets.findIndex((snippet) => snippet.id === id)

    if (index < 0) {
      return console.error(`Couldn't find note with id "${id}"`)
    }

    globalSnippets.splice(index, 1)
    setSnippets(globalSnippets)
  }

  const _updateSnippet = (snippet: Snippet) => {
    eventListener.emit('telemetryEvent', { eventName: 'updateSnippet' })
    const globalSnippets = snippets
    const index = globalSnippets.findIndex((s) => s.id === snippet.id)

    if (index < 0) {
      return console.error(`Couldn't find note with id "${snippet.id}"`)
    }

    globalSnippets[index] = snippet
    setSnippets(globalSnippets)
  }
  const _isInterestedInSyncFeature = () => {
    eventListener.emit('telemetryEvent', {
      eventName: 'noteSyncInterest',
      properties: { 'interestedIn': 'noteSyncFeature' }
    })
  }

  return (
    <SnippetContext.Provider
      value={{
        ...providerValues,
        _addSnippet,
        _removeSnippet,
        _updateSnippet,
        setShowCloudSyncFeature
      }}
    >
      {showCloudSyncFeature &&
        <DialogContainer fullWidth={true} onClose={() => setShowCloudSyncFeature(false)} >
          <DialogTitle onClose={() => setShowCloudSyncFeature(false)} >
            <Typography style={{ width: '75%' }}>
              Would you like to have the optional auth and sync notes/todos with the Stateful Backend ?
            </Typography>
          </DialogTitle>
          <DialogContent>
            <p>This new feature will be syncing todos and notes from the stateful extension.
              If you are interested press yes, if not press no.
            </p>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCloudSyncFeature(false)} >No</Button>
            <Button onClick={() => {
              _isInterestedInSyncFeature()
              setShowCloudSyncFeature(false)
            }}>Yes</Button>
          </DialogActions>
        </DialogContainer>
      }
      {children}
    </SnippetContext.Provider>
  )
}

export default SnippetContext

export { SnippetProvider }
