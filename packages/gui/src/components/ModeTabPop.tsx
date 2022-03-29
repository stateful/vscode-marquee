import React, { useState, useContext, useCallback } from 'react'
import { Typography, ListItem, ListItemText, Popover } from '@mui/material'

import ModeContext from '../contexts/ModeContext'
import { ModeEditDialog } from '../dialogs/ModeEditDialog'
import { presetModes } from '../constants'

interface ModeTabPopProps {
  name: string
  children: React.ReactElement
}

const ModeTabPop = ({ name, children }: ModeTabPopProps) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [showModeTab, setShowModeTab] = useState(false)
  const { _removeMode } = useContext(ModeContext)

  const handleRightClick = useCallback((e) => {
    e.preventDefault()
    //if this isn't one of the preset modes
    if (!presetModes.includes(name)) {
      setAnchorEl(e.currentTarget)
    }
  }, [name])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const handleDelete = useCallback(
    () => {
      _removeMode(name)
    },
    [name]
  )

  const open = Boolean(anchorEl)
  const id = open ? 'project-item-popover' : undefined

  return (
    <>
      {showModeTab && (
        <ModeEditDialog onClose={() => setShowModeTab(false)} name={name} />
      )}
      <div style={{ width: '100%' }} onContextMenu={handleRightClick}>
        {children}
      </div>
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
          onClick={() => {
            setShowModeTab(true)
            handleClose()
          }}
        >
          <ListItemText
            primary={<Typography variant="body2">Copy to new</Typography>}
          />
        </ListItem>
        <ListItem
          button
          onClick={() => {
            handleDelete()
            handleClose()
          }}
        >
          <ListItemText
            primary={<Typography variant="body2">Delete</Typography>}
          />
        </ListItem>
      </Popover>
    </>
  )
}

export default React.memo(ModeTabPop)
