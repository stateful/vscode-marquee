import React, { useContext } from 'react'
import { Grid, Link, Typography } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord } from '@fortawesome/free-brands-svg-icons/faDiscord'

import wrapper, { Dragger, HeaderWrapper } from '@vscode-marquee/widget'
import { NetworkError } from '@vscode-marquee/utils'
import type { MarqueeWidgetProps } from '@vscode-marquee/widget'

import TrickContext, { TrickProvider } from './Context'
import TrickContent from './components/TrickContent'
import PopMenu from './components/Pop'

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

let Welcome = ({ ToggleFullScreen }: MarqueeWidgetProps) => {
  return (
    <>
      <HeaderWrapper>
        <Grid item>
          <Typography variant="subtitle1">Mailbox</Typography>
        </Grid>
        <Grid item>
          <Grid container direction="row" spacing={1}>
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
      </HeaderWrapper>
      <WidgetBody />
    </>
  )
}

const Widget = (props: any) => (
  <TrickProvider>
    <Welcome {...props} />
  </TrickProvider>
)
export default wrapper(Widget, 'welcome')
