import React, { useState, useCallback, SyntheticEvent } from 'react'
import Popover from '@mui/material/Popover'
import { IconButton, Grid } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import HideWidgetContent from './HideWidgetContent'

interface Props {
  name: string
}

let HidePop = (props: Props) => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)

  const handleClick = useCallback((event: SyntheticEvent) => {
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
        <Grid container style={{ minHeight: '80px', padding: '16px' }}>
          <Grid item>
            <HideWidgetContent name={props.name} />
          </Grid>
        </Grid>
      </Popover>
    </div>
  )
}

export default React.memo(HidePop)
