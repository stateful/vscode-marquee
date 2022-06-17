import React, { MouseEvent, useEffect, useRef, useState } from 'react'
import { Box, Dialog, Grid, IconButton, Popover, Typography } from '@mui/material'

import HidePop from './HidePop'
import Dragger from './Dragger'
import ToggleFullScreen from './ToggleFullScreen'
import MoreVertIcon from '@mui/icons-material/MoreVert'

interface Props {
  name: string;
  label: string;
}
const WidgetBody = ({ name }: { name: string }) => {
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

const ThirdPartyWidget = ({ name, label }: Props) => {
  const [fullscreenMode, setFullscreenMode] = useState(false)
  const [minimizeNavIcon, setMinimizeNavIcon] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [anchorEl, setAnchorEl] = useState(null as (HTMLButtonElement | null))
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleToggleFullScreen = () => {
    setFullscreenMode(!fullscreenMode)
    handleClose()
  }
  const open = Boolean(anchorEl)
  const id = open ? 'todo-nav-popover' : undefined

  useEffect(() => {
    if ((ref !== null && ref.current !== null) && ref.current?.offsetWidth < 330) {
      return setMinimizeNavIcon(true)
    }
    setMinimizeNavIcon(false)
  }, [ref.current?.offsetWidth])
  if (!fullscreenMode) {
    return (
      <div ref={ref} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                <Typography variant="subtitle1">{label}</Typography>
              </Grid>
              {!minimizeNavIcon &&
                <Grid item>
                  <Grid container direction="row" spacing={1}>
                    <Grid item>
                      <HidePop name={name} />
                    </Grid>
                    <Grid item>
                      <ToggleFullScreen toggleFullScreen={handleToggleFullScreen} isFullScreenMode={fullscreenMode} />
                    </Grid>
                    <Grid item>
                      <Dragger />
                    </Grid>
                  </Grid>
                </Grid>
              }
              {minimizeNavIcon &&
                <Grid item xs={8}>
                  <Grid container justifyContent="right" direction="row" spacing={1}>
                    <Grid item>
                      <IconButton onClick={handleClick}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                      <Popover
                        open={open}
                        id={id}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                      >
                        <Grid item padding={1}>
                          <Grid container justifyContent="right" direction="column-reverse" spacing={1}>
                            <Grid item>
                              <HidePop name={name} />
                            </Grid>
                            <Grid item>
                              <ToggleFullScreen
                                toggleFullScreen={handleToggleFullScreen}
                                isFullScreenMode={fullscreenMode}
                              />
                            </Grid>
                            <Grid item>
                              <Dragger />
                            </Grid>
                          </Grid>
                        </Grid>
                      </Popover>
                    </Grid>
                  </Grid>
                </Grid>
              }
            </Grid>
          </Box>
        </Grid>
        <WidgetBody name={name} />
      </div>
    )
  }
  return (
    <Dialog fullScreen open={fullscreenMode} onClose={() => setFullscreenMode(false)}>
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
              <Typography variant="subtitle1">{label}</Typography>
            </Grid>
            <Grid item>
              <Grid container direction="row" spacing={1}>
                <Grid item>
                  <HidePop name={name} />
                </Grid>
                <Grid item>
                  <ToggleFullScreen toggleFullScreen={handleToggleFullScreen} isFullScreenMode={fullscreenMode} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Grid>
      <WidgetBody name={name} />
    </Dialog>
  )
}

export default ThirdPartyWidget
