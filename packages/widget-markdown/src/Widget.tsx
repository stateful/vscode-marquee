import React, { useState } from 'react'
import {
  Box,
  Grid,
  IconButton,
  ListItem,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'

import { faCopy } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons/faMarkdown'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import SplitterLayout from 'react-splitter-layout'
import ClearIcon from '@mui/icons-material/Clear'
import { AutoSizer, List } from 'react-virtualized'
import ReactMarkdown from 'react-markdown'
import { MarkdownProvider, useMarkdownContext } from './Context'
import PopupState from 'material-ui-popup-state'

import wrapper, { Dragger, HeaderWrapper, HidePop, NavIconDropdown } from '@vscode-marquee/widget'
import type { MarqueeWidgetProps } from '@vscode-marquee/widget'

const Markdown = ({ ToggleFullScreen, minimizeNavIcon, fullscreenMode } : MarqueeWidgetProps) => {
  const [splitterSize, setSplitterSize] = useState(80)
  const [filter, setFilter] = useState('')
  const [copied, setCopied] = useState(false)

  const {
    markdownDocuments,
    markdownDocumentSelected,
    selectedMarkdownContent,
    setMarkdownDocumentSelected,
  } = useMarkdownContext()

  const markdownDocumentsToDisplay = filter
    ? markdownDocuments.filter((md) =>
      md.name.toLowerCase().includes(filter.toLowerCase())
    )
    : markdownDocuments

  const CopyToClipboardButton = () => {
    if (!selectedMarkdownContent){
      return <></>
    }

    return (
      <CopyToClipboard text={selectedMarkdownContent} onCopy={() => setCopied(true)}>
        <Grid item>
          <Tooltip arrow title='Copied' open={copied} leaveDelay={800}
            onClose={() => setCopied(false)} disableTouchListener
          >
            <IconButton sx={{ display: 'flex', alignItems: 'center',
              justifyContent: 'center', direction: 'column'}}
            >
              <FontAwesomeIcon
                fontSize="small"
                icon={faCopy}
              />
            </IconButton>
          </Tooltip>
        </Grid>
      </CopyToClipboard>
    )
  }
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
        <CopyToClipboardButton />
        <Grid item>
          <HidePop name="markdown" />
        </Grid>
        <Grid item>
          <ToggleFullScreen />
        </Grid>
        {!fullscreenMode &&
          <Grid item>
            <Dragger />
          </Grid>
        }
      </Grid>
    </Grid>
  )

  return (
    <>
      <HeaderWrapper>
        <Grid item>
          <Typography variant="subtitle1">Markdown</Typography>
        </Grid>
        {minimizeNavIcon ?
          <PopupState variant='popper' popupId='widget-markdown'>
            {(popupState) => {
              return (
                <NavIconDropdown popupState={popupState}>
                  <NavButtons />
                </NavIconDropdown>
              )}}
          </PopupState>
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
          <Grid item xs style={{ overflow: 'hidden' }}>
            <SplitterLayout
              percentage={true}
              primaryIndex={0}
              secondaryMinSize={10}
              primaryMinSize={10}
              secondaryInitialSize={splitterSize}
              onSecondaryPaneSizeChange={setSplitterSize}
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
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <ClearIcon
                            fontSize="small"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setFilter('')}
                          />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs style={{ maxWidth: '100%' }}>
                    <AutoSizer>
                      {({
                        height,
                        width,
                      }: {
                        width: number;
                        height: number;
                      }) => (
                        <List
                          aria-label='Markdown Item List'
                          width={width}
                          height={height}
                          rowCount={markdownDocumentsToDisplay.length}
                          rowHeight={30}
                          rowRenderer={({ index, key, style }) => (
                            <ListItem
                              selected={
                                markdownDocumentsToDisplay[index].id ===
                                markdownDocumentSelected
                              }
                              button
                              disableRipple
                              disableTouchRipple
                              sx={{
                                color: 'var(--vscode-foreground)',

                                '&.Mui-selected': {
                                  backgroundColor:
                                    'var(--vscode-dropdown-background)',
                                  color: 'var(--vscode-foreground)',
                                },
                                '&.Mui-selected:hover': {
                                  backgroundColor:
                                    'var(--vscode-dropdown-background)',
                                  color: 'var(--vscode-foreground)',
                                },
                                '&.MuiListItem-button:hover': {
                                  backgroundColor:
                                    'var(--vscode-dropdown-background)',
                                  color: 'var(--vscode-foreground)',
                                },
                              }}
                              style={style}
                              key={key}
                              onClick={(e: any) => {
                                e.preventDefault()
                                setMarkdownDocumentSelected(
                                  markdownDocumentsToDisplay[index].id
                                )
                              }}
                              component="div"
                              ContainerComponent="div"
                            >
                              <ListItemText
                                primary={
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <FontAwesomeIcon
                                      style={{ paddingRight: '8px' }}
                                      fontSize="small"
                                      icon={faMarkdown}
                                    />
                                    <Typography variant="body2" noWrap>
                                      {markdownDocumentsToDisplay[index].name}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          )}
                        />
                      )}
                    </AutoSizer>
                  </Grid>
                </Grid>
              </div>
              <div aria-label="content" style={{ height: '100%', padding: '16px' }}>
                <ReactMarkdown>
                  {selectedMarkdownContent ?? 'No document selected'}
                </ReactMarkdown>
                <div
                  // hack to get some padding under the markdown
                  style={{ height: '16px' }}
                />
              </div>
            </SplitterLayout>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default wrapper((props: any) => (
  <MarkdownProvider>
    <Markdown {...props} />
  </MarkdownProvider>
), 'markdown')
