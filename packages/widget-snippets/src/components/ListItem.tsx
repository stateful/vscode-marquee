import React, { useState, useContext, useCallback, useMemo } from 'react'
import {
  Typography,
  ListItem,
  ListItemText,
  Popover,
  Grid,
  Tooltip,
} from '@mui/material'
import CodeIcon from '@mui/icons-material/Code'

import copy from 'copy-to-clipboard'
import { escape } from 'html-escaper'

import { MarqueeWindow, jumpTo, getEventListener } from '@vscode-marquee/utils'

import SnippetContext from '../Context'
import { WIDGET_ID } from '../constants'
import type { Events, Snippet } from '../types'

declare const window: MarqueeWindow

interface SnippetListItemProps {
  snippet: Snippet | null
  index: number
  keyVal: React.Key
  style: object
  selected: string
  click: (e: any, index: number) => void
}

let SnippetListItem = ({
  snippet = null,
  index,
  keyVal,
  style,
  selected,
  click,
}: SnippetListItemProps) => {
  const widgetEventListener = getEventListener<Events>(WIDGET_ID)
  const eventListener = getEventListener<Events>()

  const { _removeSnippet, _updateSnippet } = useContext(SnippetContext)
  const [anchorEl, setAnchorEl] = useState(null)

  const matchingWorkspace = useMemo(() => {
    if (!window.activeWorkspace) {
      return true
    }

    if (
      window.activeWorkspace && window.activeWorkspace.id &&
      snippet && snippet.workspaceId &&
      window.activeWorkspace.id === snippet.workspaceId
    ) {
      return true
    }

    return false
  }, [snippet])

  const moveToCurrentWorkspace = useCallback(() => {
    if (!window.activeWorkspace?.id || !snippet) {
      return
    }

    const updatedSnippet = snippet
    updatedSnippet.workspaceId = window.activeWorkspace.id
    _updateSnippet(updatedSnippet)
    setAnchorEl(null)
  }, [snippet])

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
  const id = open ? 'snippet-item-popover' : undefined

  if (!snippet) {
    return <></>
  }
  return (
    <ListItem
      selected={snippet.id === selected}
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
                  let path = snippet.path || ''
                  /**
                   * transform v2 snippets to make them editable in v3
                   */
                  if (!path.startsWith('/')) {
                    path = `/${snippet.id}/${path}`
                  }

                  widgetEventListener.emit('openSnippet', path!)
                  handleClose(e)
                }}
              >
                <ListItemText
                  primary={<Typography variant="body2">Edit</Typography>}
                />
              </ListItem>

              {snippet && snippet.origin && (
                <ListItem
                  button
                  onClick={(e) => {
                    jumpTo(snippet)
                    handleClose(e)
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2">Jump to origin</Typography>
                    }
                  />
                </ListItem>
              )}
              <ListItem
                button
                onClick={(e) => {
                  copy(snippet.body)
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
                  let newNote = { ...snippet }
                  let newBody = escape(snippet.body)
                  newBody = newBody.replace(/ /g, '\u00a0')
                  newBody = newBody.replace(/(?:\r\n|\r|\n)/g, '<br>')
                  newNote.body = newBody

                  _removeSnippet(snippet.id)
                  eventListener.emit('addNote', newNote as Snippet)
                  handleClose(e)
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2">Move to notes</Typography>
                  }
                />
              </ListItem>
              <ListItem
                button
                onClick={(e) => {
                  _removeSnippet(snippet.id)
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
              style={{ paddingTop: '4px' }}
            >
              <Grid item>
                <CodeIcon fontSize="small" />
              </Grid>
              <Grid item>
                <Tooltip title={snippet.title || 'Untitled'} placement="top" arrow>
                  <Typography
                    variant="body1"
                    noWrap
                    style={{ fontFamily: 'monospace' }}
                  >
                    {snippet.title || 'Untitled'}
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

export default React.memo(SnippetListItem)
