import React, { useContext } from 'react'
import { Box, Grid, Link, Typography } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTwitter } from '@fortawesome/free-brands-svg-icons/faTwitter'

import wrapper, { Dragger } from '@vscode-marquee/widget'
import { NetworkError } from '@vscode-marquee/utils'

import TrickContext, { TrickProvider } from './Context'
import TrickContent from './components/TrickContent'
import PopMenu from './components/Pop'

let Welcome = () => {
  const { error } = useContext(TrickContext)

  const tweetLink = 'https://marketplace.visualstudio.com/items?itemName=stateful.marquee'
  const linkParams = new URLSearchParams({
    text: `Check out the Marquee extension for VS Code! ${tweetLink}`
  })
  const link = `https://twitter.com/intent/tweet?${linkParams.toString()}`

  return (
    <>
      <Grid item xs={1} style={{ maxWidth: '100%' }}>
        <Box sx={{
          borderBottom: '1px solid var(--vscode-foreground)',
          padding: '8px',
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
                  <Dragger />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Grid>
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
                          Share Marquee on &nbsp;
                          <FontAwesomeIcon icon={faTwitter} />
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
    </>
  )
}

const Widget = () => (
  <TrickProvider>
    <Welcome />
  </TrickProvider>
)
export default wrapper(Widget, 'welcome')
