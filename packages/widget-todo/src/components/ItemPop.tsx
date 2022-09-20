import React, { useState, useCallback } from 'react'
import Popover from '@mui/material/Popover'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { IconButton } from '@mui/material'

import TodoPopItemContent from './PopItemContent'

import type { Todo } from '../types'

let TodoItemPop = ({ todo }: { todo: Todo }) => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)

  const handleClick = useCallback((event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const open = Boolean(anchorEl)
  const id = open ? 'todo-item-popover' : undefined

  return (
    <div>
      <IconButton aria-label="todo-options" size="small" onClick={handleClick}>
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <TodoPopItemContent todo={todo} close={handleClose} />
      </Popover>
    </div>
  )
}

export default React.memo(TodoItemPop)
