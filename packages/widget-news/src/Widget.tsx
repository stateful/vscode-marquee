import React, { useContext } from 'react'
import {
  Box,
  Grid,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import type { Item } from 'rss-parser'

import wrapper, { Dragger, HeaderWrapper } from '@vscode-marquee/widget'
import { NetworkError } from '@vscode-marquee/utils'
import type { MarqueeWidgetProps } from '@vscode-marquee/widget'

import PopMenu from './components/Pop'
import NewsContext, { NewsProvider } from './Context'

TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US')

let News = ({ ToggleFullScreen }: MarqueeWidgetProps) => {
  const { news, error, isFetching, feeds, channel } = useContext(NewsContext)
  return (
    <>
      <HeaderWrapper>
        <Grid item>
          <Typography variant="subtitle1">News ({channel} RSS Feeds)</Typography>
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
            {!isFetching && (news && news.length === 0) && (
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
            {!isFetching && (news && news.length !== 0) && (
              <List dense={true}>
                {news.map((entry: Item, i) => (
                  <ListItem dense key={i} style={{ paddingLeft: 0, paddingRight: 8 }}>
                    <ListItemAvatar>
                      <Grid container justifyContent="center" alignItems="center">
                        <Grid item>
                          <Box
                            component={'img'}
                            src={`${(new URL(feeds[channel]).origin)}/favicon.ico`}
                            style={{
                              width: 20,
                              filter: 'grayscale(1) invert(1)'
                            }}
                          />
                        </Grid>
                      </Grid>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <>
                          <Link
                            component="a"
                            href={entry.link}
                            target="_blank"
                            underline="hover">
                            {entry.title}
                          </Link>
                        </>
                      }
                      secondary={
                        <Typography style={{ fontSize: '10px' }}>
                          {entry.creator ? (<>by {entry.creator} &nbsp;</>) : ''}
                          {timeAgo.format(entry.pubDate ? (new Date(entry.pubDate).getTime()) : Date.now())}
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
