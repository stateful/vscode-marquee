import React, { useState, useEffect, MouseEvent, useRef } from 'react'
import {
  Grid,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Dialog,
  IconButton,
  Popover,
} from '@mui/material'
import Typography from '@mui/material/Typography'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHackerNews } from '@fortawesome/free-brands-svg-icons/faHackerNews'
import CircularProgress from '@mui/material/CircularProgress'

import wrapper, { Dragger, HeaderWrapper, HidePop, ToggleFullScreen } from '@vscode-marquee/widget'
import { NetworkError } from '@vscode-marquee/utils'
import MoreVertIcon from '@mui/icons-material/MoreVert'

// import PopMenu from './components/Pop'
import { fetchNews } from './utils'
import { DEFAULT_STATE } from './constants'
import type { WidgetState } from './types'

let News = () => {
  const [data, setData] = useState(DEFAULT_STATE)
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

  useEffect(() => {
    let _setData = (data: WidgetState) => setData(data)
    setData({ ...data, isFetching: true })
    fetchNews(data).then((data) => _setData(data))
    return () => { _setData = () => { } }
  }, [data.channel])

  const WidgetBody = () => (
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
  )
  if (!fullscreenMode) {
    return (
      <div ref={ref} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <HeaderWrapper>
          <>
            <Grid item>
              <Typography variant="subtitle1">News</Typography>
            </Grid>
            <Grid item>
              <Grid container direction="row" spacing={1}>

                {!minimizeNavIcon &&
                  <Grid item>
                    <Grid container direction="row" spacing={1}>
                      <Grid item>
                        <HidePop name="news" />
                      </Grid>
                      {/* <Grid item>
                        <PopMenu value={data.channel} onChannelChange={(channel) => setData({ ...data, channel })} />
                      </Grid> */}
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
                                {/* <PopMenu
                                  value={data.channel}
                                  onChannelChange={(channel) => setData({ ...data, channel })}
                                /> */}
                                <Grid item>
                                  <HidePop name="news" />
                                </Grid>
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
            </Grid>
          </>
        </HeaderWrapper>
        <WidgetBody />
      </div>
    )
  }
  return (
    <Dialog fullScreen open={fullscreenMode} onClose={() => setFullscreenMode(false)}>
      <HeaderWrapper>
        <>
          <Grid item>
            <Typography variant="subtitle1">News</Typography>
          </Grid>
          <Grid item>
            <Grid container direction="row" spacing={1}>
              <Grid item>
                <HidePop name="news" />
              </Grid>
              {/* <Grid item>
                <PopMenu value={data.channel} onChannelChange={(channel) => setData({ ...data, channel })} />
              </Grid> */}
              <Grid item>
                <ToggleFullScreen toggleFullScreen={handleToggleFullScreen} isFullScreenMode={fullscreenMode} />
              </Grid>
            </Grid>
          </Grid>
        </>
      </HeaderWrapper>
      <WidgetBody />
    </Dialog>
  )
}

export default wrapper(News, 'news')
