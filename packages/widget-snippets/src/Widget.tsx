import React, { useContext, useEffect, useMemo, useCallback } from 'react'
import {
  Grid,
  IconButton,
  Typography,
  TextField,
  Button,
  Popover
} from '@mui/material'

import { AddCircle, Clear } from '@mui/icons-material'
import LinkIcon from '@mui/icons-material/Link'
import { GlobalContext, jumpTo, DoubleClickHelper, MarqueeWindow, getEventListener } from '@vscode-marquee/utils'
import wrapper, { Dragger, HeaderWrapper, HidePop } from '@vscode-marquee/widget'
import type { MarqueeWidgetProps } from '@vscode-marquee/widget'

import SplitterLayout from 'react-splitter-layout'
import { List, AutoSizer } from 'react-virtualized'
import 'react-virtualized/styles.css'
import '../css/react-splitter-layout.css'

import SnippetContext, { SnippetProvider } from './Context'

import SnippetListItem from './components/ListItem'
import { WIDGET_ID } from './constants'
import type { Events } from './types'
import Snippet from './models/Snippet'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'

declare const window: MarqueeWindow

interface RowRendererProps {
  key: React.Key
  index: number
  style: object
}

const WidgetBody = ({ snippets, snippet }: { snippets: Snippet[], snippet: Snippet | undefined }) => {
  const eventListener = getEventListener<Events>(WIDGET_ID)
  const { globalScope } = useContext(GlobalContext)
  const {
    setSnippetFilter,
    setSnippetSelected,
    setSnippetSplitter,
    snippetFilter,
    snippetSelected,
    snippetSplitter,
  } = useContext(SnippetContext)

  const snippetsArr = useMemo(() => {
    let filteredItems = snippets

    if (!globalScope) {
      filteredItems = filteredItems.filter((item) => (
        item.workspaceId && item.workspaceId === window.activeWorkspace?.id
      ))
    }

    if (snippetFilter) {
      filteredItems = filteredItems.filter((item) => (
        item.title.toLowerCase().indexOf(snippetFilter.toLowerCase()) !== -1
      ))
    }

    return filteredItems
  }, [globalScope, snippets, snippetFilter])

  useEffect(() => {
    if (snippetsArr.length !== 0) {
      setSnippetSelected(snippetsArr[0].id)
    }
  }, [snippetFilter, globalScope])

  const snippetItemClick = useCallback((e: any, index: number) => {
    if (e.detail === 1) {
      if (snippetsArr[index] && snippetsArr[index].id) {
        setSnippetSelected(snippetsArr[index].id)
      } else {
        console.error({
          message:
            'Trying to set selected snippet to an entry that doesn\'t exist in the array',
          eventObj: e,
        })
      }
    }

    if (e.detail === 2) {
      let path = snippetsArr[index].path || ''
      /**
       * transform v2 snippets to make them editable in v3
       */
      if (!path.startsWith('/')) {
        path = `/${snippetsArr[index].id}/${path}`
      }

      return eventListener.emit('openSnippet', path)
    }
  }, [snippetsArr])

  const rowRenderer = ({ key, index, style }: RowRendererProps) => {
    const snippetEntry = snippetsArr[index]
    return (
      <SnippetListItem
        key={key}
        keyVal={key}
        index={index}
        style={style}
        snippet={snippetEntry}
        selected={snippetSelected}
        click={snippetItemClick}
      />
    )
  }

  return (
    <Grid item xs>
      <Grid
        container
        wrap="nowrap"
        direction="column"
        style={{ height: '100%' }}
      >
        <Grid item xs style={{ overflow: 'hidden' }}>
          <SplitterLayout
            percentage={true}
            primaryIndex={0}
            secondaryMinSize={10}
            primaryMinSize={10}
            secondaryInitialSize={snippetSplitter || 80}
            onSecondaryPaneSizeChange={setSnippetSplitter}
          >
            <div
              style={{
                height: '100%',
                overflow: 'hidden',
              }}
            >
              <Grid
                container
                wrap="nowrap"
                direction="column"
                style={{
                  height: '100%',
                  overflow: 'hidden',
                }}
              >
                <Grid item style={{ maxWidth: '100%', padding: '8px' }}>
                  <TextField
                    margin="dense"
                    placeholder="Filter..."
                    fullWidth
                    size="small"
                    value={snippetFilter}
                    onChange={(e) => setSnippetFilter(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <Clear
                          fontSize="small"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSnippetFilter('')}
                        />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs style={{ maxWidth: '100%' }}>
                  <AutoSizer>
                    {({ height, width }) => (
                      <List
                        width={width}
                        height={height}
                        rowCount={snippetsArr.length}
                        rowHeight={30}
                        rowRenderer={rowRenderer}
                      />
                    )}
                  </AutoSizer>
                </Grid>
              </Grid>
            </div>
            <div style={{ height: '100%' }}>
              <Grid container style={{ width: '100%', height: '100%' }}>
                <Grid
                  item
                  style={{
                    height: '100%',
                    width: '100%',
                    overflow: 'auto',
                  }}
                >
                  {snippetsArr.length === 0 && (
                    <Grid
                      container
                      style={{ height: '100%' }}
                      alignItems="center"
                      justifyContent="center"
                      direction="column"
                    >
                      <Grid item>
                        <Typography>Nothing here yet.</Typography>
                      </Grid>
                      <Grid item>&nbsp;</Grid>
                      <Grid item>
                        <Button
                          startIcon={<AddCircle />}
                          variant="outlined"
                          onClick={() => eventListener.emit('openSnippet', '/New Snippet')}
                        >
                          Create a snippet
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                  {snippetsArr.length !== 0 && snippet && (
                    <pre style={{ paddingLeft: 15, paddingRight: 15 }}>{snippet.body}</pre>
                  )}
                </Grid>
              </Grid>
            </div>
          </SplitterLayout>
        </Grid>
      </Grid>
    </Grid>
  )
}

let Snippets = ({
  ToggleFullScreen,
  minimizeNavIcon,
  open,
  anchorEl,
  handleClose,
  handleClick }: MarqueeWidgetProps) => {
  const eventListener = getEventListener<Events>(WIDGET_ID)
  const { snippets, snippetSelected } = useContext(SnippetContext)

  const snippet = useMemo(() => {
    return snippets.find((snippet) => snippet.id === snippetSelected)
  }, [snippetSelected, snippets])

  const snippetLinkFileName = useMemo(() => {
    if (snippet && snippet.origin) {
      return snippet.origin.split('/').reverse()[0].toUpperCase()
    }
  }, [snippet])

  const NavButtons = () => (
    <Grid item>
      <Grid
        container
        justifyContent="right"
        direction={minimizeNavIcon ? 'column-reverse' : 'row'}
        spacing={1}
        alignItems="center"
        padding={minimizeNavIcon ? 0.5 : 0}
      >
        <Grid item>
          <IconButton
            size="small"
            onClick={() => eventListener.emit('openSnippet', '/New Snippet')}
          >
            <AddCircle fontSize="small" />
          </IconButton>
        </Grid>
        <Grid item>
          <DoubleClickHelper content="Double-click a snippet title to edit and right-click for copy & paste" />
        </Grid>
        <Grid item>
          <HidePop name="snippets" />
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
          <Grid container direction="row" spacing={1} alignItems="center">
            <Grid item>
              <Typography variant="subtitle1">Snippets</Typography>
            </Grid>
            <Grid item>
              {snippet && snippetLinkFileName && (
                <Button
                  size="small"
                  startIcon={<LinkIcon />}
                  disableFocusRipple
                  style={{
                    padding: '0 5px',
                    background: 'transparent',
                    color: 'inherit'
                  }}
                  onClick={() => jumpTo(snippet)}
                >
                  {snippetLinkFileName}
                </Button>
              )}
            </Grid>
          </Grid>
        </Grid>
        {minimizeNavIcon ?
          <Grid item xs={1}>
            <IconButton onClick={handleClick}>
              <FontAwesomeIcon icon={faEllipsisV} fontSize={'small'} />
            </IconButton>
            <Popover
              open={open}
              id={'widget-snippets-nav-popover'}
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
      <WidgetBody snippet={snippet} snippets={snippets} />
    </>
  )
}

export default wrapper((props: any) => (
  <SnippetProvider>
    <Snippets {...props} />
  </SnippetProvider>
), 'snippets')
