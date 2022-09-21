import React from 'react'
import { Grid, Typography, Box, Link, Tooltip } from '@mui/material'

import wrapper, { Dragger, HidePop, HeaderWrapper, NavIconDropdown } from '@vscode-marquee/widget'
import type { MarqueeWidgetProps } from '@vscode-marquee/widget'
import PopupState from 'material-ui-popup-state'

const StatefulWidget = ({ ToggleFullScreen, fullscreenMode, minimizeNavIcon }: MarqueeWidgetProps) => {
  const NavButtons = () => (
    <Grid item>
      <Grid
        container
        justifyContent="right"
        direction={minimizeNavIcon ? 'column-reverse' : 'row'}
        spacing={1}
        alignItems="center"
        padding={minimizeNavIcon ? 0.5 : 0}
      >
        <Grid item>
          <HidePop name="markdown" />
        </Grid>
        <Grid item>
          <ToggleFullScreen />
        </Grid>
        {!fullscreenMode &&
          <Grid item>
            <Dragger />
          </Grid>
        }
      </Grid>
    </Grid>
  )

  return (
    <>
      <HeaderWrapper>
        <Grid item>
          <Typography variant="subtitle1">Stateful</Typography>
        </Grid>
        {minimizeNavIcon ?
          <PopupState variant='popper' popupId='widget-markdown'>
            {(popupState) => {
              return (
                <NavIconDropdown popupState={popupState}>
                  <NavButtons />
                </NavIconDropdown>
              )}}
          </PopupState>
          :
          <Grid item xs={8}>
            <NavButtons />
          </Grid>
        }
      </HeaderWrapper>
      <Grid item xs>
        <Grid
          container
          wrap="nowrap"
          direction="column"
          style={{ height: '100%', padding: '10px' }}
        >
          <Grid item sx={{ overflow: 'hidden' }}>
            <Grid container spacing={1} alignItems='flex-start'>
              <Grid item xs={5}>
                <Box sx={{ border:'1px solid', px: 1, py:0.5, borderRadius: '5px'}}>
                  <Typography sx={{ fontWeight: 600 }}>Activity</Typography>
                  <Grid>3h 43m</Grid>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ border:'1px solid', px: 1, py:0.5, borderRadius: '5px'}}>
                  <Typography sx={{ fontWeight: 600 }}>Score</Typography>
                  <Grid>89</Grid>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ border:'1px solid', px: 1, py:0.5, borderRadius: '5px'}}>
                  <Typography sx={{ fontWeight: 600 }}>Rating</Typography>
                  <Grid>😝⭐️</Grid>
                </Box>
              </Grid>
              <Grid item xs={8}>
                <Box sx={{ border:'1px solid', px: 1, py:0.5, borderRadius: '5px'}}>
                  <Grid display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                    <Typography sx={{ fontWeight: 600 }}>Language</Typography>
                    <Typography>1 of 5</Typography>
                  </Grid>
                  <Grid>JavaScript(3h 6m)</Grid>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ border:'1px solid', px: 1, py:0.5, borderRadius: '5px'}}>
                  <Typography sx={{ fontWeight: 600 }}>Project</Typography>
                  <Grid>app</Grid>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ border:'1px solid', px: 1, py:0.5, borderRadius: '5px'}}>
                  <Typography sx={{ fontWeight: 600 }}>Branch</Typography>
                  <Grid>projects-dash-redesign</Grid>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ border:'1px solid', px: 1, py: 0.5, borderRadius: '5px', mt: 1 }}>
              <Grid display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                <Typography>Active Hours</Typography>
                <Typography>8</Typography>
              </Grid>
              <Grid 
                container 
                alignItems='flex-end'
                sx={{ height: '40px', width: '100%', mt: 0.5, gap: '10px' }}
              >
                  
                <Grid item xs={1}>
                  <Tooltip title='7am - 8am: 20m' placement='top'>
                    <Grid sx={{ height: '10px', background:'yellow', width: '100%' }}></Grid>
                  </Tooltip>

                </Grid>
                <Grid item xs={1}>
                  <Tooltip title='8am - 9am: 25m' placement='top'>
                    <Grid sx={{ height: '20px', background:'yellow', width: '100%' }}></Grid>
                  </Tooltip>
                </Grid>
                <Grid item xs={1}>
                  <Tooltip title='9am - 10am: 50m' placement='top'>
                    <Grid sx={{ height: '40px', background:'yellow', width: '100%' }}></Grid>
                  </Tooltip>
                </Grid>
                <Grid item xs={1}>
                  <Tooltip title='10am - 11am: 50m' placement='top'>
                    <Grid sx={{ height: '40px', background:'yellow', width: '100%' }}></Grid>
                  </Tooltip>
                </Grid>
                <Grid item xs={1}>
                  <Tooltip title='11am - 12pm: 40m' placement='top'>
                    <Grid sx={{ height: '35px', background:'yellow', width: '100%' }}></Grid>
                  </Tooltip>
                </Grid>
                <Grid item xs={1}>
                  <Tooltip title='12pm - 1pm: 44m' placement='top'>
                    <Grid sx={{ height: '40px', background:'yellow', width: '100%' }}></Grid>
                  </Tooltip>
                </Grid>
                <Grid item xs={1}>
                  <Tooltip title='1pm - 2pm: 23m' placement='top'>
                    <Grid sx={{ height: '20px', background:'yellow', width: '100%' }}></Grid>
                  </Tooltip>
                </Grid>
                <Grid item xs={1}>
                  <Tooltip title='2pm - 3pm: 32m' placement='top'>
                    <Grid sx={{ height: '25px', background:'yellow', width: '100%' }}></Grid>
                  </Tooltip>
                </Grid>
              </Grid>
            </Box>
            <Grid sx={{ mt: 1 }}>
              <Link 
                sx={{ cursor: 'pointer', color: 'blue'}} 
                href={'vscode:extension/stateful.stable'}
              >
                View the full report
              </Link>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default wrapper((props: any) => (
  <StatefulWidget {...props} />
), 'stateful')