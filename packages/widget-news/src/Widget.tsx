import React, { useContext } from 'react'
import {
  Grid,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material'
import Typography from '@mui/material/Typography'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHackerNews } from '@fortawesome/free-brands-svg-icons/faHackerNews'
import CircularProgress from '@mui/material/CircularProgress'

import wrapper, { Dragger, HeaderWrapper } from '@vscode-marquee/widget'
import { NetworkError } from '@vscode-marquee/utils'
import type { MarqueeWidgetProps } from '@vscode-marquee/widget'

import PopMenu from './components/Pop'
import NewsContext, { NewsProvider } from './Context'

let News = ({ ToggleFullScreen }: MarqueeWidgetProps) => {
  const { news, error, isFetching } = useContext(NewsContext)
  console.log(11, news, error, isFetching)

  return (
    <>
      <HeaderWrapper>
        <Grid item>
          <Typography variant="subtitle1">News</Typography>
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
            {!isFetching && news.length === 0 && (
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
            {!isFetching && news.length !== 0 && (
              <List dense={true}>
                {news.map((entry) => (
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

const Widget = (props: any) => (
  <NewsProvider>
    <News {...props} />
  </NewsProvider>
)
export default wrapper(Widget, 'news')
