import { IconButton, Popover, Grid, Divider } from '@mui/material'
import { HideWidgetContent } from '@vscode-marquee/widget'
import React, { useState, useCallback } from 'react'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { Configuration } from './Configuration'

let DependenciesPop = () => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)

  const handleClick = useCallback((event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const open = Boolean(anchorEl)
  const id = open ? 'hide-popover' : undefined

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
        <Grid container style={{ minHeight: '80px', minWidth: '300px', padding: '16px' }} direction="column">
          <Grid item>
            <Configuration />
          </Grid>

          <Grid item>&nbsp;</Grid>
          <Grid item>
            <Divider />
          </Grid>
          <Grid item>&nbsp;</Grid>

          <HideWidgetContent name="dependencies" />
        </Grid>
      </Popover>
    </div>
  )
}

export default React.memo(DependenciesPop)