import React, { createContext, useState, useEffect } from 'react'
import { connect, getEventListener, MarqueeWindow, MarqueeEvents } from '@vscode-marquee/utils'

import AddDialog from './dialogs/AddDialog'
import EditDialog from './dialogs/EditDialog'
import type { State, Context, Note, Events } from './types'
import { DialogContainer, DialogTitle } from '@vscode-marquee/dialog'
import { Button, DialogActions, DialogContent, Typography } from '@mui/material'

declare const window: MarqueeWindow
const NoteContext = createContext<Context>({} as Context)
const WIDGET_ID = '@vscode-marquee/notes-widget'

const NoteProvider = ({ children }: { children: React.ReactElement }) => {
  const eventListener = getEventListener<Events & MarqueeEvents>()
  const widgetState = getEventListener<State>(WIDGET_ID)
  const providerValues = connect<State>(window.marqueeStateConfiguration[WIDGET_ID].state, widgetState)
  /**
   * for so far unknown reason the `providerValues.notes` doesn't change when
   * `providerValues.setNotes` is called within the context, therefor we need
   * to maintain a local state
   */
  const [notes, _setNotes] = useState<Note[]>(providerValues.notes)

  const setNotes = (notes: Note[]) => {
    _setNotes(notes)
    providerValues.setNotes(notes)
  }

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState<string | undefined>()
  const [showCloudSyncFeature, setShowCloudSyncFeature] = useState(false)

  const _addNote = (note: Pick<Note, 'title' | 'body' | 'text'>, isWorkspaceTodo: boolean): string => {
    eventListener.emit('telemetryEvent', { eventName: 'addNote' })
    const globalNotes = notes
    const id = [...Array(8)].map(() => Math.random().toString(36)[2]).join('')

    const newNote = Object.assign({}, note, {
      id: id,
      archived: false,
      createdAt: new Date().getTime(),
      workspaceId: isWorkspaceTodo
        ? window.activeWorkspace?.id || null
        : null,
    })

    globalNotes.unshift(newNote)
    setNotes(globalNotes)
    return id
  }

  const _removeNote = (id: string) => {
    eventListener.emit('telemetryEvent', { eventName: 'removeNote' })
    const globalNotes = notes
    const index = globalNotes.findIndex((note) => note.id === id)

    if (index < 0) {
      return console.error(`Couldn't find note with id "${id}"`)
    }

    globalNotes.splice(index, 1)
    setNotes(globalNotes)
  }

  const _updateNote = (note: Note) => {
    eventListener.emit('telemetryEvent', { eventName: 'updateNote' })
    const globalNotes = notes
    const index = globalNotes.findIndex((entry) => entry.id === note.id)

    if (index < 0) {
      return console.error(`Couldn't find note with id "${note.id}"`)
    }

    if (JSON.stringify(note) === JSON.stringify(globalNotes[index])) {
      return
    }

    globalNotes[index] = note
    setNotes(globalNotes)
  }
  const _isInterestedInSyncFeature = () => {
    console.log('intersted in sync feature')
    eventListener.emit('telemetryEvent', { eventName: 'noteSyncInterest' })
  }

  useEffect(() => {
    eventListener.on('openAddNoteDialog', setShowAddDialog)
    eventListener.on('openEditNoteDialog', setShowEditDialog)
    eventListener.on('addNote', (note) => _addNote(
      note,
      note.workspaceId === window.activeWorkspace?.id
    ))
    eventListener.on('openCloudSyncFeatureInterest', setShowCloudSyncFeature)
    return () => {
      widgetState.removeAllListeners()
      eventListener.removeAllListeners()
    }
  }, [])

  return (
    <NoteContext.Provider
      value={{
        ...providerValues,
        _addNote,
        _removeNote,
        _updateNote,
        showCloudSyncFeature,
        setShowCloudSyncFeature,

        showAddDialog,
        setShowAddDialog,
        showEditDialog,
        setShowEditDialog,

      }}
    >
      {showAddDialog && (
        <AddDialog close={() => setShowAddDialog(false)} />
      )}
      {showEditDialog && notes.find((n) => n.id === showEditDialog) && (
        <EditDialog note={notes.find((n) => n.id === showEditDialog)!} close={() => setShowEditDialog(undefined)} />
      )}
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
            }}>
              Yes
            </Button>
          </DialogActions>
        </DialogContainer>
      }
      {children}
    </NoteContext.Provider>
  )
}

export default NoteContext

export { NoteProvider }
