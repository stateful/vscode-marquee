import React, { MouseEvent, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Grid, Link, Typography, Chip, Avatar, CircularProgress, Dialog, IconButton, Popover } from '@mui/material'
import AvatarGroup from '@mui/material/AvatarGroup'
import wrapper, { Dragger, HeaderWrapper, HidePop, ToggleFullScreen } from '@vscode-marquee/widget'
import StarIcon from '@mui/icons-material/Star'
import StarHalfIcon from '@mui/icons-material/StarHalf'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import MoreVertIcon from '@mui/icons-material/MoreVert'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons/faCodeBranch'

import { NetworkError } from '@vscode-marquee/utils'

import TrendContext, { TrendProvider } from './Context'
import TrendingDialogLauncher from './components/TrendingDialog'
import Filter from './components/Filter'

let GChip = ({ ...rest }) => {
  return (
    <Chip
      variant="outlined"
      style={{ fontSize: '12px', border: 0 }}
      size="small"
      {...rest}
    />
  )
}

let Github = () => {
  const { trends, isFetching, error, trendFilter } = useContext(TrendContext)
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

  const filteredTrends = useMemo(() => {
    let filteredTrends = trends

    if (trendFilter) {
      let filteredArr = filteredTrends.filter((entry) => {
        return (
          entry.description.toLowerCase().indexOf(trendFilter.toLowerCase()) !==
          -1
        )
      })
      filteredTrends = filteredArr
    }

    return filteredTrends
  }, [trends, trendFilter])

  const WidgetBody = () => (
    <Grid item xs>
      <Grid
        container
        wrap="nowrap"
        direction="column"
        style={{ height: '100%' }}
      >
        <Grid item xs style={{ overflow: 'auto' }}>
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
          {isFetching && (
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
          {!isFetching && !error && filteredTrends.length === 0 && (
            <Grid
              container
              style={{ height: '100%' }}
              alignItems="center"
              justifyContent="center"
              direction="column"
            >
              <Grid item>
                <Typography variant="body2">
                  There are no matches for your search criteria.
                </Typography>
              </Grid>
            </Grid>
          )}
          {!isFetching && !error && filteredTrends.length !== 0 &&
            filteredTrends.map((entry) => {
              return (
                <Grid
                  aria-labelledby="trend-entry"
                  key={entry.url}
                  container
                  direction="column"
                  sx={{
                    marginTop: '4px',
                    marginBottom: '4px',
                    padding: '16px',
                    borderBottom: '1px solid var(--vscode-editorGroup-border)',
                  }}
                >
                  <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Grid item>
                      <Link
                        component="a"
                        href={entry.url}
                        target="_blank"
                        underline="hover"
                      >
                        <Typography variant="body2">
                          {entry.author}/{entry.name}
                        </Typography>
                      </Link>
                    </Grid>
                    <Grid item>
                      <GChip
                        label={entry.currentPeriodStars.toLocaleString()}
                        icon={<StarHalfIcon />}
                      />
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Grid item>
                      <Typography variant="caption">
                        {entry.description}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid container>
                    <Grid item>&nbsp;</Grid>
                  </Grid>
                  <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-end"
                  >
                    <Grid item>
                      <Grid container spacing={1}>
                        {entry.language && (
                          <Grid aria-label="language" item>
                            <GChip
                              label={entry.language}
                              icon={
                                <FiberManualRecordIcon
                                  style={{
                                    fill: `${entry.languageColor}`,
                                  }}
                                />
                              }
                            />
                          </Grid>
                        )}
                        <Grid aria-label="forks" item>
                          <GChip
                            label={entry.forks.toLocaleString()}
                            icon={<FontAwesomeIcon icon={faCodeBranch} />}
                          />
                        </Grid>
                        <Grid aria-label="stars" item>
                          <GChip
                            label={entry.stars.toLocaleString()}
                            icon={<StarIcon />}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item>
                      <AvatarGroup>
                        {entry.builtBy.map((contributor) => {
                          return (
                            <Avatar
                              key={contributor.username}
                              style={{
                                height: '22px',
                                width: '22px',
                                border: 0,
                              }}
                              src={contributor.avatar}
                              alt={contributor.username}
                            />
                          )
                        })}
                      </AvatarGroup>
                    </Grid>
                  </Grid>
                </Grid>
              )
            })}
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
              <Typography variant="subtitle1">Trending on Github</Typography>
            </Grid>
            {!minimizeNavIcon &&
              <Grid item>
                <Grid container direction="row" spacing={1}>
                  <Grid item>
                    <Filter />
                  </Grid>
                  <Grid item>
                    <TrendingDialogLauncher />
                  </Grid>
                  <Grid item>
                    <HidePop name="github" />
                  </Grid>
                  <Grid item>
                    <ToggleFullScreen toggleFullScreen={handleToggleFullScreen} isFullScreenMode={fullscreenMode} />
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
                            <Filter />
                          </Grid>
                          <Grid item>
                            <TrendingDialogLauncher />
                          </Grid>
                          <Grid item>
                            <HidePop name="github" />
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
            <Typography variant="subtitle1">Trending on Github</Typography>
          </Grid>
          <Grid item>
            <Grid container direction="row" spacing={1}>
              <Grid item>
                <Filter />
              </Grid>
              <Grid item>
                <TrendingDialogLauncher />
              </Grid>
              <Grid item>
                <HidePop name="github" />
              </Grid>
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

const Widget = () => (
  <TrendProvider>
    <Github />
  </TrendProvider>
)
export default wrapper(Widget, 'github')
