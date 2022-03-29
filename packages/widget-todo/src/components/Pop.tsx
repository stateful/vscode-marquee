import React, { useState, useContext, useCallback } from 'react'
import Popover from '@mui/material/Popover'
import {
  IconButton,
  Grid,
  Divider,
  Checkbox,
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Tooltip from '@mui/material/Tooltip'
import { HideWidgetContent } from '@vscode-marquee/widget'

import TodoContext from '../Context'

let HideBox = React.memo(() => {
  const { setHide, hide } = useContext(TodoContext)

  return (
    <Grid
      container
      direction="row"
      spacing={2}
      justifyContent="space-between"
      alignItems="center"
    >
      <Grid item>Hide completed</Grid>
      <Grid item>
        <Checkbox
          aria-label="Hide completed"
          color="primary"
          checked={hide}
          value={hide}
          name="hide"
          onChange={(e) => setHide(e.target.checked)}
        />
      </Grid>
    </Grid>
  )
})

let ArchivedBox = React.memo(() => {
  const { setShowArchived, showArchived } = useContext(TodoContext)

  return (
    <Grid
      container
      direction="row"
      spacing={2}
      justifyContent="space-between"
      alignItems="center"
    >
      <Grid item>Show archived</Grid>
      <Grid item>
        <Checkbox
          aria-label="Show archived"
          color="primary"
          checked={showArchived}
          value={showArchived}
          name="hide"
          onChange={(e) => setShowArchived(e.target.checked)}
        />
      </Grid>
    </Grid>
  )
})

let AutoDetectBox = React.memo(() => {
  const { setAutoDetect, autoDetect } = useContext(TodoContext)
  return (
    <Grid
      container
      direction="row"
      spacing={2}
      justifyContent="space-between"
      alignItems="center"
    >
      <Grid item>
        <Tooltip
          title="Detect TODO comments in your code, and make them one-click addable to Marquee."
          placement="top"
          arrow
        >
          <>Auto-detect TODOs</>
        </Tooltip>
      </Grid>
      <Grid item>
        <Checkbox
          aria-label="Auto-detect TODOs"
          color="primary"
          checked={autoDetect}
          value={autoDetect}
          name="autodetect"
          onChange={(e) => setAutoDetect(e.target.checked)}
        />
      </Grid>
    </Grid>
  )
})

let TodoPop = () => {
  const [anchorEl, setAnchorEl] = useState(null)

  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const open = Boolean(anchorEl)
  const id = open ? 'todo-popover' : undefined

  return (
    <div>
      <IconButton aria-label="widget-settings" size="small" onClick={handleClick}>
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
        <Grid container style={{ padding: '16px' }} direction="column">
          <Grid item>
            <AutoDetectBox />
          </Grid>
          <Grid item>
            <HideBox />
          </Grid>
          <Grid item>
            <ArchivedBox />
          </Grid>
          <Grid item>&nbsp;</Grid>
          <Grid item>
            <Divider />
          </Grid>
          <Grid item>&nbsp;</Grid>
          <Grid item>
            <HideWidgetContent name="todo" />
          </Grid>
        </Grid>
      </Popover>
    </div>
  )
}

export default React.memo(TodoPop)
