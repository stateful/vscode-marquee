import React, { useCallback, useRef, useState } from 'react'
import { Box, ClickAwayListener, Grid, IconButton, Paper, Popper, Typography } from '@mui/material'

import HidePop from './HidePop'
import Dragger from './Dragger'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'

interface Props {
  name: string
  label: string
  ToggleFullScreen: () => JSX.Element
  minimizeNavIcon: boolean
}

const WidgetBody = ({ name } : { name:string }) => {
  const WidgetTag = name
  return (
    <Grid item xs>
      <Grid
        container
        wrap="nowrap"
        direction="column"
        style={{ height: '100%' }}
      >
        <Grid item xs style={{ overflow: 'auto' }}>
          <WidgetTag />
        </Grid>
      </Grid>
    </Grid>
  )
}

const ThirdPartyWidget = ({ 
  name, 
  label, 
  ToggleFullScreen,
  minimizeNavIcon,
} : Props) => {
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
    setOpen((previousOpen) => !previousOpen)
  },[ref?.current])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
    setOpen(false)
  },[ref?.current]) 

  const canBeOpen = open && Boolean(anchorEl)
  const id = canBeOpen ? 'third-party' : undefined

  const NavButtons = () => (
    <Grid item >
      <Grid  
        container
        justifyContent="right"
        direction={minimizeNavIcon ? 'column-reverse' : 'row'}
        spacing={1}
        alignItems="center"
        padding={minimizeNavIcon ? 0.5 : 0}
      >
        <Grid item>
          <HidePop name={name} />
        </Grid>
        <Grid item>
          <ToggleFullScreen />
        </Grid>
        <Grid item>
          <Dragger />
        </Grid>
      </Grid>
    </Grid>
  )

  const WidgetHeader = () => {
    return (
      <div>
        <Grid item xs={1} style={{ maxWidth: '100%' }}>
          <Box sx={{
            borderBottom: '1px solid var(--vscode-editorGroup-border)',
            padding: '8px 8px 4px',
          }}>
            <Grid
              container
              direction="row"
              wrap="nowrap"
              alignItems="stretch"
              alignContent="stretch"
              justifyContent="space-between"
            >
              <Grid item>
                <Typography variant="subtitle1" noWrap>{label}</Typography>
              </Grid>
              {minimizeNavIcon ?
                <ClickAwayListener onClickAway={handleClose}>
                  <Grid item xs={1}>
                    <div ref={ref}>
                      <IconButton onClick={handleClick}>
                        <FontAwesomeIcon icon={faEllipsisV} fontSize={'small'} />
                      </IconButton>
                    </div>
                    <Popper 
                      id={id}
                      open={open}
                      disablePortal
                      anchorEl={() => ref?.current as any}
                      sx={{ zIndex:100 }}
                    >
                      <Paper>
                        <NavButtons />
                      </Paper>
                    </Popper>
                  </Grid>
                </ClickAwayListener>
                :
                <Grid item xs={8}>
                  <NavButtons />
                </Grid>
              }
            </Grid>
          </Box>
        </Grid>
      </div>
    )
  }

  return (
    <>
      <WidgetHeader />
      <WidgetBody name={name} />
    </>
  )
}

export default ThirdPartyWidget
