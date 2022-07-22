import React, { useContext, useRef, useEffect, useState } from 'react'
import { Grid, Typography, CircularProgress, Button, IconButton, Popover } from '@mui/material'
import styled from '@emotion/styled'
import 'react-vis/dist/style.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'

import wrapper, { Dragger, HeaderWrapper } from '@vscode-marquee/widget'
import { NetworkError, MarqueeWindow } from '@vscode-marquee/utils'
import type { MarqueeWidgetProps } from '@vscode-marquee/widget'

import PopMenu from './components/Pop'
import NPMGraph from './components/Graph'
import NPMStatsContext, { NPMStatsProvider } from './Context'
import { TEXT_COLOR, MIN_HEIGHT, LEGEND_HEIGHT } from './constants'

declare const window: MarqueeWindow

const CENTER_STYLES = {
  overflow: 'auto',
  height: '100%',
  width: '100%',
  padding: '24px',
}

const Root = styled(Grid)(() => ({
  ['.rv-discrete-color-legend-item__title']: {
    color: TEXT_COLOR
  },
  ['.rv-discrete-color-legend.horizontal']: {
    textAlign: 'center'
  },
  b: {
    fontWeight: 'bold'
  }
}))

const WidgetBody = () => {
  const ref = useRef<HTMLDivElement>(null)
  const { error, isLoading, stats } = useContext(NPMStatsContext)
  const [ graphHeight, setGraphHeight ] = useState<number>(MIN_HEIGHT)
  const hasStats = Object.keys(stats).length !== 0

  useEffect(() => {
    setGraphHeight(ref.current
      ? ref.current.clientHeight - LEGEND_HEIGHT
      : MIN_HEIGHT
    )
  }, [ref.current?.clientHeight])

  return (
    <Grid item xs ref={ref}>
      <Grid
        container
        wrap="nowrap"
        direction="column"
        style={{ height: '100%' }}
      >
        {isLoading && (
          <Grid
            container
            style={{ height: '100%' }}
            alignItems="center"
            justifyContent="center"
            direction="column"
            data-testid="loading"
          >
            <Grid item>
              <CircularProgress color="secondary" />
            </Grid>
          </Grid>
        )}
        {error && !isLoading && (
          <Grid item xs style={CENTER_STYLES} data-testid="error">
            <NetworkError message={error.message} />
          </Grid>
        )}
        {!error && !isLoading && !hasStats && (
          <Grid item xs style={{ ...CENTER_STYLES, textAlign: 'center' }} data-testid="no-stats">
            No packages defined in your Marquee configuration!<br />
            <Button style={{ marginTop: 10 }} onClick={() => window.vscode.postMessage({
              west: { execCommands: [{
                command: 'workbench.action.openSettings',
                args: ['@ext:stateful.marquee Npm-stats Package Names']
              }]},
            })}>
              Add NPM Packages Now!
            </Button>
          </Grid>
        )}
        {!error && !isLoading && hasStats && (
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
              <Root item xs={1} style={{ maxWidth: '100%' }}>
                <NPMGraph height={graphHeight} stats={stats} />
              </Root>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Grid>
  )
}



let NPMStats = ({ 
  ToggleFullScreen, 
  open, 
  anchorEl, 
  minimizeNavIcon, 
  handleClick, 
  handleClose }: MarqueeWidgetProps) => {

  const NavButtons = () => (
    <Grid item>
      <Grid container justifyContent="right" direction={minimizeNavIcon ? 'column-reverse' : 'row'} spacing={1}>
        <Grid item>
          <PopMenu />
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
  return (
    <>
      <HeaderWrapper>
        <Grid item>
          <Typography variant="subtitle1">NPM Statistics</Typography>
        </Grid>
        {minimizeNavIcon ?
          <Grid item xs={1}>
            <IconButton onClick={handleClick}>
              <FontAwesomeIcon icon={faEllipsisV} fontSize={'small'} />
            </IconButton>
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'top', horizontal: 'left' }}>
              <NavButtons />
            </Popover>
          </Grid>
          :
          <Grid item xs={8}>
            <NavButtons />
          </Grid>
        }
      </HeaderWrapper>
      <WidgetBody />
    </>
  )
}

const Widget = (props: any) => (
  <NPMStatsProvider>
    <NPMStats {...props} />
  </NPMStatsProvider>
)
export default wrapper(Widget, 'welcome')
