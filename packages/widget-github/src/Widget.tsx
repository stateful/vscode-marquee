import React, { useContext, useMemo } from 'react'
import { Grid, Link, Typography, Chip, Avatar, CircularProgress, IconButton, Popover } from '@mui/material'
import AvatarGroup from '@mui/material/AvatarGroup'
import StarIcon from '@mui/icons-material/Star'
import StarHalfIcon from '@mui/icons-material/StarHalf'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons/faCodeBranch'

import wrapper, { Dragger, HeaderWrapper, HidePop } from '@vscode-marquee/widget'
import { NetworkError } from '@vscode-marquee/utils'
import type { MarqueeWidgetProps } from '@vscode-marquee/widget'

import TrendContext, { TrendProvider } from './Context'
import TrendingDialogLauncher from './components/TrendingDialog'
import Filter from './components/Filter'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'

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

let Github = ({
  ToggleFullScreen,
  minimizeNavIcon,
  open,
  anchorEl,
  id,
  handleClose,
  handleClick }: MarqueeWidgetProps) => {
  const { trends, isFetching, error, trendFilter } = useContext(TrendContext)
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

  const NavButtons = () => {
    return (
      <Grid item>
        <Grid container justifyContent="right" direction={minimizeNavIcon ? 'column-reverse' : 'row'} spacing={1}>
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
            <ToggleFullScreen />
          </Grid>
          <Grid item>
            <Dragger />
          </Grid>
        </Grid>
      </Grid>
    )
  }


  return (
    <>
      <HeaderWrapper>
        <Grid item>
          <Typography variant="subtitle1">Trending on Github</Typography>
        </Grid>
        {minimizeNavIcon ?
          <Grid item xs={1}>
            <IconButton onClick={handleClick}>
              <FontAwesomeIcon icon={faEllipsisV} fontSize={'small'} />
            </IconButton>
            <Popover
              open={open}
              id={id}
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
    </>
  )
}

const Widget = (props: any) => (
  <TrendProvider>
    <Github {...props} />
  </TrendProvider>
)
export default wrapper(Widget, 'github')
