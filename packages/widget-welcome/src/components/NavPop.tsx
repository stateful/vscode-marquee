import React, { useState, useContext, useMemo, MouseEvent } from 'react'
import Popover from '@mui/material/Popover'
import { IconButton, Grid, Badge, styled } from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import TrickContent from './TrickContent'
import TrickContext, { TrickProvider } from '../Context'



const PREFIX = 'WidgetProjectsListItem'

const classes = {
  badge: `${PREFIX}-badge`,
}

const Root = styled('div')(() => ({
  [`&.${classes.badge}`]: {
    minHeight: '16px',
    minWidth: '16px',
    height: '16px',
    width: '16px',
  },
}))

let NavPop = () => {
  const [anchorEl, setAnchorEl] = useState(null)
  const { tricks, read } = useContext(TrickContext)

  const handleClick = (event: MouseEvent) => {
    setAnchorEl(event.currentTarget as any)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'nav-popover' : undefined

  // calculate unread tricks
  // read array includes active and inactive tricks
  // therefore we need to compare against the incoming
  // active tricks for the badge count
  let unread = useMemo(() => {
    return tricks.filter((trick) => {
      if (read.indexOf(trick.id) === -1) {
        return trick
      }
    })
  }, [tricks, read])

  return (
    <Root>
      <IconButton size="small" onClick={handleClick}>
        <Badge
          classes={{ badge: classes.badge }}
          badgeContent={unread.length}
          color="secondary"
        >
          <NotificationsIcon fontSize="small" />
        </Badge>
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
          <Grid item style={{ width: '350px' }}>
            <TrickContent />
          </Grid>
        </Grid>
      </Popover>
    </Root>
  )
}

const Component = () => (
  <TrickProvider>
    <NavPop />
  </TrickProvider>
)
export default React.memo(Component)
