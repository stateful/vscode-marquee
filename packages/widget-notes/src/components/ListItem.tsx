import React, { useState, useContext, useCallback, useMemo } from 'react'
import {
  Typography,
  ListItem,
  ListItemText,
  Popover,
  Grid,
  Tooltip,
} from '@mui/material'
import NoteIcon from '@mui/icons-material/Note'
import copy from 'copy-to-clipboard'
import { stripHtml } from 'string-strip-html'
import { unescape } from 'html-escaper'

import { MarqueeWindow, getEventListener } from '@vscode-marquee/utils'

import NoteContext from '../Context'
import type { Note, Events } from '../types'

declare const window: MarqueeWindow

interface NoteListItemProps {
  note: Note
  index: number
  keyVal: React.Key
  style: object
  selected: string
  click: (e: any, index: number) => void
}

let NoteListItem = ({ note, index, keyVal, style, selected, click }: NoteListItemProps) => {
  const eventListener = getEventListener<Events>()
  const { _removeNote, _updateNote, setShowEditDialog } = useContext(NoteContext)

  const [anchorEl, setAnchorEl] = useState(null)

  const matchingWorkspace = useMemo(() => {
    if (!window.activeWorkspace) {
      return true
    }

    if (
      window.activeWorkspace && window.activeWorkspace.id &&
      note && note.workspaceId &&
      window.activeWorkspace.id === note.workspaceId
    ) {
      return true
    }

    return false
  }, [note])

  const moveToCurrentWorkspace = useCallback(() => {
    if (!window.activeWorkspace || !window.activeWorkspace.id) {
      return
    }

    _updateNote({ ...note, workspaceId: window.activeWorkspace.id })
    setAnchorEl(null)
  }, [note])

  const handleRightClick = useCallback((e) => {
    e.preventDefault()
    setAnchorEl(e.currentTarget)
  }, [])

  const handleClose = useCallback((e) => {
    setAnchorEl(null)
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const open = Boolean(anchorEl)
  const id = open ? 'note-item-popover' : undefined

  if (!note) {
    return <></>
  }
  return (
    <ListItem
      selected={note.id === selected}
      button
      disableRipple
      disableTouchRipple
      sx={{
        color: 'var(--vscode-foreground)',
        '&.Mui-selected': {
          backgroundColor: 'var(--vscode-dropdown-background)',
          color: 'var(--vscode-foreground)',
        },
        '&.Mui-selected:hover': {
          backgroundColor: 'var(--vscode-dropdown-background)',
          color: 'var(--vscode-foreground)',
        },
        '&.MuiListItem-button:hover': {
          backgroundColor: 'var(--vscode-dropdown-background)',
          color: 'var(--vscode-foreground)',
        },
      }}
      style={style}
      key={keyVal}
      onClick={(e: any) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.target.innerHTML !== 'Copy to clipboard') {
          click(e, index)
        }
      }}
      onContextMenu={handleRightClick}
      component="div"
      ContainerComponent="div"
    >
      <ListItemText
        primary={
          <>
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'center',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <ListItem
                button
                onClick={(e) => {
                  setShowEditDialog(note.id)
                  handleClose(e)
                }}
              >
                <ListItemText
                  primary={<Typography variant="body2">Edit</Typography>}
                />
              </ListItem>
              <ListItem
                button
                onClick={(e) => {
                  copy(note.body)
                  handleClose(e)
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2">Copy to clipboard</Typography>
                  }
                />
              </ListItem>
              {!matchingWorkspace && (
                <ListItem
                  button
                  onClick={() => moveToCurrentWorkspace()}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        Move to current workspace
                      </Typography>
                    }
                  />
                </ListItem>
              )}

              <ListItem
                button
                onClick={(e) => {
                  let newSnippet = note
                  if (typeof note.text === 'string' && note.text.length > 0) {
                    newSnippet.body = unescape(note.text)
                  } else {
                    newSnippet.body = stripHtml(note.body).result
                  }

                  _removeNote(note.id)
                  eventListener.emit('addSnippet', newSnippet)
                  handleClose(e)
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2">Move to snippets</Typography>
                  }
                />
              </ListItem>
              <ListItem
                button
                onClick={(e) => {
                  _removeNote(note.id)
                  handleClose(e)
                }}
              >
                <ListItemText
                  primary={<Typography variant="body2">Delete</Typography>}
                />
              </ListItem>
            </Popover>

            <Grid
              container
              wrap="nowrap"
              spacing={1}
              justifyContent="flex-start"
              alignItems="stretch"
              direction="row"
              style={{ paddingTop: '4px' }}
            >
              <Grid item>
                <NoteIcon fontSize="small" />
              </Grid>
              <Grid item>
                <Tooltip title={note.title || 'Untitled'} placement="top" arrow>
                  <Typography variant="body2" noWrap>
                    {note.title || 'Untitled'}
                  </Typography>
                </Tooltip>
              </Grid>
            </Grid>
          </>
        }
      />
    </ListItem>
  )
}

export default React.memo(NoteListItem)
