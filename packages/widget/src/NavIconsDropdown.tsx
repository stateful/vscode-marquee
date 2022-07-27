import React from 'react'
import { ClickAwayListener, Grid, IconButton, Paper, Popper } from '@mui/material'
import {
  bindToggle,
  bindPopper,
  PopupState,
  anchorRef
} from 'material-ui-popup-state/hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'

interface NavIconDropdownPropTypes {
  popupState: PopupState,
  children: React.ReactChild,
}
const NavIconDropdown = ({ popupState, children } : NavIconDropdownPropTypes) => {
  return (
    <ClickAwayListener onClickAway={() => popupState.close()}>
      <Grid item xs={1}>
        <IconButton {...bindToggle(popupState)} ref={() => anchorRef(popupState)}>
          <FontAwesomeIcon icon={faEllipsisV} fontSize={'small'} />
        </IconButton>
        <Popper {...bindPopper(popupState)} disablePortal sx={{ zIndex: 1000 }}
          modifiers={[
            {
              name: 'flip',
              enabled: false,
              options: {
                altBoundary: false,
                rootBoundary: 'document',
                padding: 8,
              },
            },
            {
              name: 'preventOverflow',
              enabled: false,
              options: {
                altAxis: false,
                altBoundary: false,
                tether: false,
                rootBoundary: 'document',
                padding: 8,
              },
            },
          ]}
        >
          <Paper className='tooltip' style={{ zIndex: 1000 }}>
            {children}
          </Paper>
        </Popper>
      </Grid>
    </ClickAwayListener>
  )
}

export default NavIconDropdown