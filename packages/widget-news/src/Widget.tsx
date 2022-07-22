import React, { useContext, useState } from 'react'
import {
  Box,
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
import CircularProgress from '@mui/material/CircularProgress'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import type { Item } from 'rss-parser'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'

import wrapper, { Dragger, HeaderWrapper } from '@vscode-marquee/widget'
import { NetworkError } from '@vscode-marquee/utils'
import type { MarqueeWidgetProps } from '@vscode-marquee/widget'

import PopMenu from './components/Pop'
import NewsContext, { NewsProvider } from './Context'

TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US')

const MARQUEE_LOGO = 'https://marquee.stateful.com/assets/marquee-logo.png'

interface NewsItemProps {
  item: Item
  icon: string
}
const NewsItem = ({ item, icon }: NewsItemProps) => {
  const [avatar, setAvatar] = useState(icon)

  return (
    <ListItem dense style={{ paddingLeft: 0, paddingRight: 8 }}>
      <ListItemAvatar>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
        >
          <Grid item>
            <Box
              component={'img'}
              onError={() => setAvatar(item.enclosure?.url || MARQUEE_LOGO)}
              src={avatar}
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
              href={item.link}
              target="_blank"
              underline="hover">
              {item.title}
            </Link>
          </>
        }
        secondary={
          <Typography style={{ fontSize: '10px' }}>
            {item.creator ? (<>by {item.creator} &nbsp;</>) : ''}
            {timeAgo.format(item.pubDate ? (new Date(item.pubDate).getTime()) : Date.now())}
          </Typography>
        }
      />
    </ListItem>
  )
}

const News = ({ 
  ToggleFullScreen,  
  minimizeNavIcon,
  open,
  anchorEl,
  handleClose,
  handleClick }: MarqueeWidgetProps) => {
  const { news, error, isFetching, feeds, channel } = useContext(NewsContext)

  const NavButtons = () => (
    <Grid item>
      <Grid 
        container
        justifyContent="right" 
        direction={minimizeNavIcon ? 'column-reverse' : 'row'} 
        spacing={1}
        padding={minimizeNavIcon ? 0.5 : 0}
      >
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
          <Typography variant="subtitle1">News ({channel} RSS Feeds)</Typography>
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
      <Grid item xs>
        <Grid
          container
          wrap="nowrap"
          direction="column"
          style={{ height: '100%' }}
        >
          <Grid item xs style={{ overflow: 'auto' }}>
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
            {!isFetching && error && (
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
                <NetworkError message={error} />
              </Grid>
            )}
            {!isFetching && !error && (news && news.length === 0) && (
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
                {news.map((item: Item, i:number) => (
                  <NewsItem
                    key={i}
                    item={item}
                    icon={`${(new URL(feeds[channel]).origin)}/favicon.ico`}
                  />
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