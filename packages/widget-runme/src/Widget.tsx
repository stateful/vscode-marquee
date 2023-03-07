import React, { useContext }  from 'react'
import { Grid, Typography } from '@mui/material'
import wrapper, { Dragger, HeaderWrapper, NavIconDropdown } from '@vscode-marquee/widget'
import type { MarqueeWidgetProps } from '@vscode-marquee/widget'
import PopupState from 'material-ui-popup-state'

import InstallRunme from './components/InstallRunme'
import NotebookList from './components/NotebookList'
import RunmeContext, { DependencyProvider } from './Context'

const Runme = ({ ToggleFullScreen, fullscreenMode, minimizeNavIcon }: MarqueeWidgetProps) => {
  const { isInstalled } = useContext(RunmeContext)

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
          <Typography variant="subtitle1">Runme Markdowns</Typography>
        </Grid>
        {minimizeNavIcon ?
          <PopupState variant='popper' popupId='widget-runme'>
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
          style={{ height: '100%' }}
        >
          <Grid item xs style={{ overflow: 'auto' }}>
            {isInstalled
              ? <NotebookList />
              : <InstallRunme />
            }
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default wrapper((props: any) => (
  <DependencyProvider>
    <Runme {...props} />
  </DependencyProvider>
), 'dependencies')
