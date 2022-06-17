import React, { MouseEvent, useContext, useEffect, useRef, useState } from 'react'
import { Box, Dialog, Grid, IconButton, Link, Popover, Typography } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord } from '@fortawesome/free-brands-svg-icons/faDiscord'

import wrapper, { Dragger, ToggleFullScreen } from '@vscode-marquee/widget'
import { NetworkError } from '@vscode-marquee/utils'

import TrickContext, { TrickProvider } from './Context'
import TrickContent from './components/TrickContent'
import PopMenu from './components/Pop'
import MoreVertIcon from '@mui/icons-material/MoreVert'

const WidgetBody = () => {
  const { error } = useContext(TrickContext)
  const link = 'https://discord.gg/BQm8zRCBUY'
  return (
    <Grid item xs>
      <Grid
        container
        wrap="nowrap"
        direction="column"
        style={{ height: '100%' }}
      >
        {error && (
          <Grid
            item
            xs
            style={{
              overflow: 'auto',
              height: '100%',
              width: '100%',
              padding: '24px',
            }}
          >
            <NetworkError message={error.message} />
          </Grid>
        )}
        {!error && (
          <Grid
            item
            xs
            style={{
              overflow: 'auto',
              paddingTop: '16px',
              paddingRight: '16px',
              paddingLeft: '16px',
              paddingBottom: '8px',
            }}
          >
            <Grid
              container
              style={{
                height: '100%',
                width: '100%',
              }}
              direction="column"
              wrap="nowrap"
            >
              <Grid item xs={1} style={{ maxWidth: '100%' }}>
                <Grid
                  container
                  justifyContent="flex-end"
                  alignItems="center"
                  style={{ height: '100%', padding: '8px' }}
                >
                  <Grid item>
                    <Typography variant="caption">
                      <Link
                        component="a"
                        href={link}
                        target="_blank"
                        underline="hover">
                        Join Discord &nbsp;
                        <FontAwesomeIcon icon={faDiscord} />
                      </Link>
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={11} style={{ maxWidth: '100%' }}>
                <TrickContent />
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Grid>
  )
}

let Welcome = () => {
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
              justifyContent="space-between"
              alignItems="center"
            >
              <Grid item>
                <Typography variant="subtitle1">Mailbox</Typography>
              </Grid>
              {!minimizeNavIcon &&
                <Grid item>
                  <Grid container direction="row" spacing={1}>
                    <Grid item>
                      <PopMenu />
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
                              <PopMenu />
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
        <WidgetBody />
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
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item>
              <Typography variant="subtitle1">Mailbox</Typography>
            </Grid>
            <Grid item>
              <Grid container direction="row" spacing={1}>
                <Grid item>
                  <PopMenu />
                </Grid>
                <Grid item>
                  <ToggleFullScreen toggleFullScreen={handleToggleFullScreen} isFullScreenMode={fullscreenMode} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Grid>
      <WidgetBody />
    </Dialog>
  )
}

const Widget = () => (
  <TrickProvider>
    <Welcome />
  </TrickProvider>
)
export default wrapper(Widget, 'welcome')
