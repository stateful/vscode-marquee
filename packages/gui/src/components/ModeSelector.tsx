import React, { useContext, useState, useRef } from 'react'

import SettingsIcon from '@mui/icons-material/Settings'
import ViewCompactIcon from '@mui/icons-material/ViewCompact'
import CheckIcon from '@mui/icons-material/Check'
import { Emoji } from 'emoji-mart'
import {
  Popper,
  Grow,
  Paper,
  Button,
  Grid,
  ListItemIcon,
  Typography,
  ListItem,
  ListItemText,
  List,
  ListItemSecondaryAction,
  Divider,
  ClickAwayListener,
  IconButton
} from '@mui/material'

import ModeContext from '../contexts/ModeContext'
import ModeDialog from '../dialogs/ModeDialog'
import { ucFirst } from '../utils'
import { defaultLayout } from '../constants'

const DenseListIcon = ({ children }: { children: any[] }) => {
  return (
    <ListItemIcon style={{ minWidth: '36px', margin: '0px' }}>
      {children}
    </ListItemIcon>
  )
}

const ModeSelector = () => {
  const [open, setOpen] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [showModeDialog, setShowModeDialog] = useState(false)
  const { modeName, _setModeName, modes } = useContext(ModeContext)
  const anchorRef = useRef(null)
  const mode = modes[modeName] || defaultLayout

  /**
   * if user deletes the selected mode within the settings.json while
   * the webview is open, we have to switch back to default
   */
  if (!mode) {
    const newDefaultMode = Object.keys(modes)[0]
    console.warn(`Can't find mode "${modeName}" anymore, switching back to "${newDefaultMode}"`)
    _setModeName(newDefaultMode)
    return null
  }

  const setModeName = (newMode: string) => {
    /**
     * switching modes is a very costly operation, let's ensure we
     * debounce this operation to avoid running into signal loops
     */
    setDisabled(true)
    setTimeout(() => setDisabled(false), 1000)
    _setModeName(newMode)
  }

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  return (
    <div>
      {showModeDialog && <ModeDialog close={() => setShowModeDialog(false)} />}
      <Button
        disabled={disabled}
        size="medium"
        aria-controls={open ? 'split-button-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-label="Set Mode"
        aria-haspopup="menu"
        onClick={handleToggle}
        onMouseEnter={handleToggle}
        sx={{display:'flex', background: 'transparent', margin:0, minHeight:0, minWidth:0}}
        ref={anchorRef}
      >
        {!mode.icon && (
          <ViewCompactIcon fontSize="small" className="modeIcon" />
        )}
        {mode.icon && <Emoji emoji={mode.icon} size={16} />}
      </Button>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        onMouseLeave={handleToggle}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener
                onClickAway={(event: any) => {
                  const targetClassList = event.target?.parentNode?.classList.value

                  if (
                    !targetClassList ||
                    (anchorRef.current && (anchorRef.current as any).contains(event.target)) ||
                    targetClassList.indexOf('modeIcon') !== -1 ||
                    targetClassList.indexOf('emoji-mart-emoji') !== -1
                  ) {
                    return
                  }

                  setOpen(false)
                }}
              >
                <Grid
                  container
                  style={{ padding: '8px', minWidth: '200px' }}
                  direction="column"
                >
                  <Grid item>
                    <Grid
                      container
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid item>Modes</Grid>
                      <Grid item>
                        <IconButton
                          aria-label="Open Mode Dialog"
                          size="small"
                          onClick={() => setShowModeDialog(true)}
                        >
                          <SettingsIcon fontSize="small" />
                        </IconButton>
                      </Grid>
                    </Grid>
                    <Grid item style={{ paddingTop: '4px' }}>
                      <Divider />
                    </Grid>
                    <Grid item>
                      <List component="nav" dense>
                        {modes &&
                          Object.keys(modes).map((name) => {
                            return (
                              <ListItem
                                button
                                key={name}
                                onClick={() => {
                                  setModeName(name)
                                  handleToggle()
                                }}
                              >
                                <DenseListIcon>
                                  {modes[name].icon && (
                                    <Emoji
                                      emoji={modes[name].icon!}
                                      size={16}
                                    />
                                  )}
                                  {!modes[name].icon && (
                                    <ViewCompactIcon fontSize="small" />
                                  )}
                                </DenseListIcon>
                                <ListItemText
                                  primary={
                                    <Typography variant="body2">
                                      {ucFirst(name)}
                                    </Typography>
                                  }
                                />
                                {name === modeName && (
                                  <ListItemSecondaryAction>
                                    <CheckIcon fontSize="small" />
                                  </ListItemSecondaryAction>
                                )}
                              </ListItem>
                            )
                          })}
                      </List>
                    </Grid>
                  </Grid>
                </Grid>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  )
}

export default ModeSelector
