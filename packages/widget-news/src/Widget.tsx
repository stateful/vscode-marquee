import React, { useState, useEffect } from 'react'
import {
  Grid,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Popover
} from '@mui/material'
import Typography from '@mui/material/Typography'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHackerNews } from '@fortawesome/free-brands-svg-icons/faHackerNews'
import CircularProgress from '@mui/material/CircularProgress'

import wrapper, { Dragger, HeaderWrapper } from '@vscode-marquee/widget'
import { NetworkError } from '@vscode-marquee/utils'
import type { MarqueeWidgetProps } from '@vscode-marquee/widget'

import PopMenu from './components/Pop'

import { fetchNews } from './utils'
import { DEFAULT_STATE } from './constants'
import type { WidgetState } from './types'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'

let News = ({
  ToggleFullScreen,
  minimizeNavIcon,
  open,
  anchorEl,
  handleClose,
  handleClick }: MarqueeWidgetProps) => {
  const [data, setData] = useState(DEFAULT_STATE)

  useEffect(() => {
    let _setData = (data: WidgetState) => setData(data)
    setData({ ...data, isFetching: true })
    fetchNews(data).then((data) => _setData(data))
    return () => { _setData = () => { } }
  }, [data.channel])
  const NavButtons = () => (
    <Grid item>
      <Grid container
        justifyContent="right"
        direction={minimizeNavIcon ? 'column-reverse' : 'row'}
        spacing={1}
        alignItems="center"
        padding={minimizeNavIcon ? 0.5 : 0}
      >
        <Grid item>
          <PopMenu value={data.channel} onChannelChange={(channel) => setData({ ...data, channel })} />
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
          <Typography variant="subtitle1">News</Typography>
        </Grid>
        {minimizeNavIcon ?
          <Grid item xs={1}>
            <IconButton onClick={handleClick}>
              <FontAwesomeIcon icon={faEllipsisV} fontSize={'small'} />
            </IconButton>
            <Popover
              open={open}
              id={'widget-news-nav-popover'}
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
      <Grid item xs>
        <Grid
          container
          wrap="nowrap"
          direction="column"
          style={{ height: '100%' }}
        >
          <Grid item xs style={{ overflow: 'auto' }}>
            {data.error && (
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
                <NetworkError message={data.error.message} />
              </Grid>
            )}
            {data.isFetching && (
              <Grid
                container
                style={{ height: '100%' }}
                alignItems="center"
                justifyContent="center"
                direction="column"
              >
                <Grid item>
                  <CircularProgress color="secondary" />
                </Grid>
              </Grid>
            )}
            {!data.isFetching && data.news.length === 0 && (
              <Grid
                container
                style={{ height: '100%' }}
                alignItems="center"
                justifyContent="center"
                direction="column"
              >
                <Grid item>
                  No news available at the moment!
                </Grid>
              </Grid>
            )}
            {!data.isFetching && data.news.length !== 0 && (
              <List dense={true}>
                {data.news.map((entry) => (
                  <ListItem dense key={entry.id}>
                    <ListItemAvatar>
                      <Grid container justifyContent="center" alignItems="center">
                        <Grid item>
                          <FontAwesomeIcon icon={faHackerNews} />
                        </Grid>
                      </Grid>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <>
                          <Link
                            component="a"
                            href={`https://news.ycombinator.com/item?id=${entry.id}`}
                            target="_blank"
                            underline="hover">
                            {entry.title}
                          </Link>
                          {entry.domain && (
                            <Typography variant="caption">
                              &nbsp;(
                              <Link
                                component="a"
                                href={entry.url}
                                target="_blank"
                                underline="hover"
                              >
                                {entry.domain}
                              </Link>
                              )
                            </Typography>
                          )}
                        </>
                      }
                      secondary={
                        <Typography style={{ fontSize: '10px' }}>
                          {entry.points} points by {entry.user} &nbsp;
                          {entry.time_ago}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default wrapper(News, 'news')
