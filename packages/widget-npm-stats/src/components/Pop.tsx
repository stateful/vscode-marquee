import React, { useState, useCallback, useContext } from 'react'
import Popover from '@mui/material/Popover'
import styled from '@emotion/styled'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { IconButton, Grid, FormControl, Divider, TextField, Button } from '@mui/material'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { HideWidgetContent } from '@vscode-marquee/widget'
import type { MarqueeWindow } from '@vscode-marquee/utils'

import { DEFAULT_CONFIGURATION } from '../constants'
import NPMStatsContext from '../Context'

declare const window: MarqueeWindow

const StyledTextField = styled(TextField)(() => ({
  ['input']: { cursor: 'pointer' }
}))

const PopMenu = () => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)
  const { setFrom, from, setUntil, until } = useContext(NPMStatsContext)

  const handleClick = useCallback((event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const handlePackageUpdate = useCallback(() => {
    window.vscode.postMessage({
      west: { execCommands: [{
        command: 'workbench.action.openSettings',
        args: ['@ext:stateful.marquee Npm-stats Package Names']
      }]},
    })
    handleClose()
  }, [])

  const renderInput = (params: any) => <StyledTextField {...params} />
  const open = Boolean(anchorEl)
  const id = open ? 'hide-popover' : undefined

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
        <Grid container direction="column" style={{ minHeight: '80px', padding: '16px' }}>
          <Grid item>
            <FormControl fullWidth>
              <Grid container direction="column">
                <Grid item>
                  <MobileDatePicker
                    label="From"
                    inputFormat="MM/dd/yyyy"
                    value={from || DEFAULT_CONFIGURATION.from }
                    onChange={(val) => {
                      if (val) {
                        console.log('setFrom', (new Date(val)).getTime())

                        setFrom((new Date(val)).getTime())
                        handleClose()
                      }
                    }}
                    renderInput={renderInput}
                  />
                </Grid>
                <Grid item style={{ marginTop: 15 }}>
                  <MobileDatePicker
                    label="Until"
                    inputFormat="MM/dd/yyyy"
                    value={until || DEFAULT_CONFIGURATION.until }
                    onChange={(val) => {
                      if (val) {
                        console.log('setUntil', (new Date(val)).getTime())

                        setUntil((new Date(val)).getTime())
                        handleClose()
                      }
                    }}
                    renderInput={renderInput}
                  />
                </Grid>
              </Grid>
            </FormControl>
          </Grid>
          <Grid item>
            <Button style={{ marginTop: 10, width: '100%' }} onClick={handlePackageUpdate}>
              Update NPM Packages
            </Button>
          </Grid>
          <Grid item>&nbsp;</Grid>
          <Grid item>
            <Divider />
          </Grid>
          <Grid item>&nbsp;</Grid>
          <Grid item>
            <HideWidgetContent name="npm-stats" />
          </Grid>
        </Grid>
      </Popover>
    </LocalizationProvider>
  )
}

export default React.memo(PopMenu)
