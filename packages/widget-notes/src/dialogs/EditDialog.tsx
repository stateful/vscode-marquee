import React, { useContext, useState, useCallback } from 'react'
import {
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material'
import { theme } from '@vscode-marquee/utils'
import { DialogContainer, DialogTitle } from '@vscode-marquee/dialog'

import NoteEditor from '../components/Editor'
import NoteContext from '../Context'
import type { Note } from '../types'

interface NoteEditDialogProps {
  close: () => void
  note: Note
}

const EditDialog = React.memo(({ close, note }: NoteEditDialogProps) => {
  const { _updateNote, setNoteSelected, _removeNote } = useContext(NoteContext)
  const [error, setError] = useState(false)
  const [body, setBody] = useState(note.body)
  const [text, setText] = useState(note.text)
  const [title, setTitle] = useState(note.title)

  const updateNote = useCallback(() => {
    if (title.trim() === '') {
      return setError(true)
    }

    _updateNote({ ...note, body, title, text })
    setNoteSelected(note.id)
    close()
  }, [title, body])

  return (
    <DialogContainer fullWidth={true} onClose={close}>
      <DialogTitle onClose={close}>{note.title}</DialogTitle>
      <DialogContent dividers={true}>
        <TextField
          error={error}
          fullWidth
          variant="filled"
          onChange={(e) => setTitle(e.target.value)}
          label="Title"
          placeholder="Title of Note"
          name="title"
          autoFocus
          value={title}
          onKeyDown={(e) => {
            if (e.keyCode === 13 && e.metaKey) {
              e.preventDefault()
              updateNote()
            }
          }}
        />
        <div style={{ height: '8px', minWidth: '100%' }} />

        <NoteEditor
          border="1px solid var(--vscode-editorGroup-border)"
          name="add"
          _change={(newBody, newText) => {
            setBody(newBody)
            setText(newText)
          }}
          body={body}
          text={text}
        />
      </DialogContent>
      <DialogActions style={{ paddingRight: theme.spacing(3) }}>
        <Button onClick={close} color="secondary" style={{ padding: '4px 8px', margin: '0 5px' }}>
          Close
        </Button>
        <Button variant="contained" color="secondary" onClick={() => _removeNote(note.id)}>
          Delete
        </Button>
        <Button color="primary" variant="contained" onClick={updateNote}>
          Save
        </Button>
      </DialogActions>
    </DialogContainer>
  )
})

export default EditDialog
