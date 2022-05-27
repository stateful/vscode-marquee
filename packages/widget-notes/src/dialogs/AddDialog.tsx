import React, { useContext, useState } from 'react'
import {
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material'
import { SplitButton } from '@vscode-marquee/widget'
import { DialogTitle, DialogContainer } from '@vscode-marquee/dialog'
import { theme, MarqueeWindow } from '@vscode-marquee/utils'

import NoteContext from '../Context'
import NoteEditor from '../components/Editor'

declare const window: MarqueeWindow
const options = ['Add to Workspace', 'Add as Global Note']

const AddDialog = React.memo(({ close }: { close: () => void }) => {
  const { _addNote, setNoteSelected } = useContext(NoteContext)
  const [error, setError] = useState(false)
  const [body, setBody] = useState('')
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')

  const submit = (index: number) => {
    const isWorkspaceTodo = index === 0
    if (title === '') {
      setError(true)
      return
    }

    setNoteSelected(_addNote({ title, body, text }, isWorkspaceTodo))
    close()
  }

  return (
    <DialogContainer fullWidth={true} onClose={close}>
      <DialogTitle onClose={close}>{title || 'Add Note'}</DialogTitle>
      <DialogContent dividers={true}>
        <TextField
          error={error}
          fullWidth
          variant="filled"
          onChange={(e) => {
            setTitle(e.target.value)
          }}
          name="title"
          autoFocus
          value={title}
          label="Title"
          placeholder="Title of Note"
          aria-labelledby="Title"
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
        <Button onClick={close} color="secondary">
          Close
        </Button>
        {window.activeWorkspace
          ? <SplitButton
            options={options}
            onClick={submit}
          />
          : <Button
            color="primary"
            variant="contained"
            onClick={() => submit(1)}
          >
            {options[1]}
          </Button>
        }
      </DialogActions>
    </DialogContainer>
  )
})

export default AddDialog
