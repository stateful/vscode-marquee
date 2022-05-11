import React, { useState } from 'react'
import {
  Box,
  Grid,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material'

import wrapper, { Dragger, HidePop } from '@vscode-marquee/widget'
import SplitterLayout from 'react-splitter-layout'
import ClearIcon from '@mui/icons-material/Clear'
import { AutoSizer, List } from 'react-virtualized'
import ReactMarkdown from 'react-markdown'
import { MarkdownProvider, useMarkdownContext } from './Context'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons/faMarkdown'

const Markdown = () => {
  const [splitterSize, setSplitterSize] = useState(80)
  const [filter, setFilter] = useState('')

  const {
    markdownDocuments,
    markdownDocumentSelected,
    setMarkdownDocumentSelected,
  } = useMarkdownContext()

  const markdownDocumentsToDisplay = filter
    ? markdownDocuments.filter((md) =>
      md.name.toLowerCase().includes(filter.toLowerCase())
    )
    : markdownDocuments

  const selectedDocument = markdownDocuments.find(
    (md) => md.id === markdownDocumentSelected
  )

  return (
    <>
      <Grid item style={{ maxWidth: '100%' }}>
        <Box
          sx={{
            borderBottom: '1px solid var(--vscode-foreground)',
            padding: '8px',
          }}
        >
          <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item>
              <Grid container direction="row" spacing={1} alignItems="center">
                <Grid item>
                  <Typography variant="subtitle1">Markdown</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container direction="row" spacing={1} alignItems="center">
                <Grid item>
                  <HidePop name="markdown" />
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
              <div style={{ height: '100%', padding: '16px' }}>
                <ReactMarkdown>
                  {selectedDocument?.content ?? 'No document selected'}
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

export default wrapper(
  () => (
    <MarkdownProvider>
      <Markdown />
    </MarkdownProvider>
  ),
  'markdown'
)
