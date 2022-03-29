import React, { createContext, useEffect, useState } from 'react'
import { getEventListener, MarqueeWindow, connect } from '@vscode-marquee/utils'

import type { Configuration, State, Context, WidgetItem } from './types'

declare const window: MarqueeWindow

const WorkspaceContext = createContext<Context>({} as Context)
const WIDGET_ID = '@vscode-marquee/projects-widget'

const WorkspaceProvider = ({ children }: { children: React.ReactElement }) => {
  const widgetState = getEventListener<Configuration & State>(WIDGET_ID)
  const providerValues = connect<State & Configuration>({
    ...window.marqueeStateConfiguration[WIDGET_ID].state,
    ...window.marqueeStateConfiguration[WIDGET_ID].configuration
  }, widgetState)

  /**
   * listen on other widget items
   */
  const notesWidgetChannel = getEventListener<{ notes: WidgetItem[] }>('@vscode-marquee/notes-widget')
  const todoWidgetChannel = getEventListener<{ todos: WidgetItem[] }>('@vscode-marquee/todo-widget')
  const snippetsWidgetChannel = getEventListener<{ snippets: WidgetItem[] }>('@vscode-marquee/snippets-widget')
  const [notes, setNotes] = useState<WidgetItem[]>(
    window.marqueeStateConfiguration['@vscode-marquee/notes-widget'].state.notes
  )
  const [todos, setTodos] = useState<WidgetItem[]>(
    window.marqueeStateConfiguration['@vscode-marquee/todo-widget'].state.todos
  )
  const [snippets, setSnippets] = useState<WidgetItem[]>(
    window.marqueeStateConfiguration['@vscode-marquee/snippets-widget'].state.snippets
  )

  const _removeWorkspace = (id: string) => {
    const wsps = [...providerValues.workspaces]
    let index = wsps.findIndex((wsp) => wsp.id === id)

    if (index < 0) {
      return console.error(`Couldn't find workspace with id "${id}"`)
    }

    wsps.splice(index, 1)
    providerValues.setWorkspaces(wsps)
  }

  useEffect(() => {
    const subs: { unsubscribe: () => void }[] = []
    subs.push(notesWidgetChannel.listen('notes', setNotes))
    subs.push(todoWidgetChannel.listen('todos', setTodos))
    subs.push(snippetsWidgetChannel.listen('snippets', setSnippets))
    return () => {
      widgetState.removeAllListeners()
      subs.forEach((s) => s.unsubscribe())
    }
  }, [])

  return (
    <WorkspaceContext.Provider value={{
      ...providerValues,
      notes,
      todos,
      snippets,
      _removeWorkspace
    }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export default WorkspaceContext
export { WorkspaceProvider }
