import React, { useContext, MouseEvent, useState, useEffect } from 'react'
import makeStyles from '@mui/styles/makeStyles'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'

import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'

import Tooltip from '@mui/material/Tooltip'
import { Grid, Typography, IconButton, Chip, Badge, Box } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import InfoIcon from '@mui/icons-material/Info'
import MoreIcon from '@mui/icons-material/MoreVert'
import SettingsIcon from '@mui/icons-material/Settings'
import FilterListIcon from '@mui/icons-material/FilterList'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import styled from '@emotion/styled'
import EdiText from 'react-editext'

import { GlobalContext, MarqueeWindow } from '@vscode-marquee/utils'
import { NavPop } from '@vscode-marquee/widget-welcome'

import ModeSelector from './ModeSelector'
import FeedbackDialog from '../dialogs/FeedbackDialog'
import ThemeDialog from '../dialogs/ThemeDialog'
import InfoDialog from '../dialogs/InfoDialog'
import SettingsDialog from '../dialogs/SettingsDialog'

declare const window: MarqueeWindow

const useStyles = makeStyles((theme) => ({
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  editInput: {
    fontSize: 16,
    backgroundColor: 'var(--vscode-editor-background)',
    border: '0px solid black',
    color: 'var(--vscode-editor-foreground)',
    minWidth: '100px',
    padding: '8px',
  },
}))

const StyledEdiText = styled(EdiText)`
  button {
    color: var(--vscode-button-secondaryForeground);
    background-color: var(--vscode-button-secondaryBackground);
  }
  button[editext="edit-button"] {
    &:hover {
      background-color: var(--vscode-button-secondaryHoverBackground);
    }
  }
  button[editext="save-button"] {
    &:hover {
      background-color: var(--vscode-button-secondaryHoverBackground);
    }
  }
  button[editext="cancel-button"] {
    &:hover {
      background-color: var(--vscode-button-secondaryHoverBackground);
    }
  }
`

const Navigation = () => {
  const classes = useStyles()
  const { name, themeColor, setName, globalScope, setGlobalScope } = useContext(GlobalContext)

  const [anchorEl, setAnchorEl] = useState(null)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [showThemeDialog, setShowThemeDialog] = useState(false)
  const [showInfoDialog, setShowInfoDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null as (HTMLButtonElement | null))
  const [, setInputName] = useState(name)

  const isMenuOpen = Boolean(anchorEl)
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl)

  useEffect(() => setInputName(name), [name])

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    handleMobileMenuClose()
  }

  const handleMobileMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setMobileMoreAnchorEl(event.currentTarget)
  }

  const menuId = 'primary-search-account-menu'
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
    </Menu>
  )

  const mobileMenuId = 'primary-search-account-menu-mobile'
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      {window.activeWorkspace && (<MenuItem onClick={() => { setGlobalScope(!globalScope) }}>
        <Grid container direction="row" alignItems="stretch" spacing={1}>
          <Grid item>
            <Badge
              color="secondary"
              variant="dot"
              overlap="circular"
              badgeContent={globalScope ? 1 : 0}
            >
              <FilterListIcon fontSize="small" />
            </Badge>
          </Grid>
          <Grid item>
            <Typography variant="body2">
              Global mode [{globalScope ? 'on' : 'off'}]
            </Typography>
          </Grid>
        </Grid>
      </MenuItem>)}
      <MenuItem onClick={handleMobileMenuClose}>
        <div onClick={() => setShowSettingsDialog(true)  }>
          <Grid container direction="row" alignItems="stretch" spacing={1}>
            <Grid item>
              <SettingsIcon fontSize="small" />
            </Grid>
            <Grid item>
              <Typography variant="body2">Settings</Typography>
            </Grid>
          </Grid>
        </div>
      </MenuItem>
      <MenuItem onClick={() => handleMobileMenuClose()}>
        <div onClick={() => setShowThemeDialog(true)}>
          <Grid container direction="row" alignItems="stretch" spacing={1}>
            <Grid item>
              <PhotoLibraryIcon fontSize="small" />
            </Grid>
            <Grid item>
              <Typography variant="body2">Theme Manager</Typography>
            </Grid>
          </Grid>
        </div>
      </MenuItem>
      <MenuItem onClick={() => handleMobileMenuClose() } >
        <div onClick={() => setShowInfoDialog(true)}>
          <Grid container direction="row" alignItems="stretch" spacing={1}>
            <Grid item>
              <InfoIcon fontSize="small" />
            </Grid>
            <Grid item>
              <Typography variant="body2">Marquee Info</Typography>
            </Grid>
          </Grid>
        </div>
      </MenuItem>
    </Menu>
  )

  return (
    <Box sx={{
      flexGrow: 1,
    }}>
      {showFeedbackDialog && <FeedbackDialog close={() => setShowFeedbackDialog(false)} />}
      {showThemeDialog && <ThemeDialog close={() => setShowThemeDialog(false)} />}
      {showInfoDialog && <InfoDialog close={() => setShowInfoDialog(false)} />}
      {showSettingsDialog && <SettingsDialog close={() => setShowSettingsDialog(false)} />}
      <AppBar
        position="static"
        elevation={0}
        style={{
          background: `rgba(${themeColor.r}, ${themeColor.g}, ${themeColor.b}, 1)`,
          color: 'var(--vscode-foreground)',
        }}
      >
        <Toolbar variant="dense">
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Grid container direction="row" spacing={1} alignItems="center">
                <Grid item>
                  <Typography style={{ fontSize: 16 }}>Hi,</Typography>
                </Grid>
                <Grid item>
                  <StyledEdiText
                    onEditingStart={() => {
                      setInputName('')
                    }}
                    onSave={(v: string) => {
                      if (v !== '') {
                        setName(v)
                        setInputName(v)
                      }
                    }}
                    submitOnEnter={true}
                    type="text"
                    value={name}
                    editOnViewClick
                    viewProps={{
                      style: {
                        fontSize: 16,
                        cursor: 'pointer',
                        fontWeight: 'bold',
                      },
                    }}
                    inputProps={{
                      placeholder: 'Type...',
                      className: classes.editInput,
                    }}
                    showButtonsOnHover
                    cancelOnEscape
                    submitOnUnfocus
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Box sx={{
            flexGrow: 1,
          }} />
          <div className={classes.sectionDesktop}>
            <Grid
              container
              direction="row"
              spacing={1}
              alignItems="center"
              wrap="nowrap"
            >
              {window.activeWorkspace && (<Grid item>
                <Tooltip
                  aria-label="toggle-scope"
                  title={`Toggle Global vs Workspace Scope (${globalScope ? 'Global' : 'Workspace'} Scope)`}
                >
                  <IconButton
                    data-testid="navigation-toggle-global-scope"
                    size="small"
                    onClick={() => setGlobalScope(!globalScope)}
                  >
                    <Badge
                      color="secondary"
                      variant="dot"
                      overlap="circular"
                      badgeContent={globalScope ? 1 : 0}
                    >
                      <FilterListIcon fontSize="small" />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </Grid>)}
              <Grid item>
                <ModeSelector />
              </Grid>
              <Grid item>
                <IconButton aria-label="Open Settings" size="small" onClick={() => setShowSettingsDialog(true) }>
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Grid>
              <Grid item>
                <IconButton aria-label="Switch Theme" size="small" onClick={() => setShowThemeDialog(true) }>
                  <PhotoLibraryIcon fontSize="small" />
                </IconButton>
              </Grid>
              <Grid item>
                <NavPop />
              </Grid>
              <Grid item>
                <IconButton aria-label="Show Info" size="small" onClick={() => setShowInfoDialog(true) }>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Grid>
              <Grid item>&nbsp;</Grid>
              <Grid item>
                <Chip
                  icon={<SendIcon aria-label="Send Feedback" fontSize="small" />}
                  style={{ borderRadius: '0px' }}
                  size="small"
                  label="Feedback"
                  color="primary"
                  clickable
                  onClick={() => setShowFeedbackDialog(true)}
                />
              </Grid>
            </Grid>
          </div>
          <div className={classes.sectionMobile}>
            <Grid
              container
              direction="row"
              spacing={1}
              alignItems="center"
              wrap="nowrap"
            >
              <Grid item>
                <IconButton
                  size="small"
                  onClick={() => setShowFeedbackDialog(true)}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </Grid>
              <Grid item>
                <ModeSelector />
              </Grid>
              <Grid item>
                <NavPop />
              </Grid>
              <Grid item>
                <IconButton
                  aria-label="show more"
                  aria-controls={mobileMenuId}
                  aria-haspopup="true"
                  onClick={handleMobileMenuOpen}
                  size="small"
                >
                  <MoreIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          </div>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
    </Box>
  )
}

export default React.memo(Navigation)
