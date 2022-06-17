import React, { MouseEvent, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Grid, Typography, List, IconButton, Button, Dialog, Popover } from '@mui/material'
import AddCircle from '@mui/icons-material/AddCircleOutlined'
import PageviewIcon from '@mui/icons-material/Pageview'
import MoreVertIcon from '@mui/icons-material/MoreVert'

import wrapper, { Dragger, HeaderWrapper, ToggleFullScreen } from '@vscode-marquee/widget'
import { MarqueeWindow } from '@vscode-marquee/utils'

import ProjectsFilter from './components/Filter'
import ProjectPop from './components/Pop'
import ProjectListItem from './components/ListItem'
import WorkspaceContext, { WorkspaceProvider } from './Context'

declare const window: MarqueeWindow

let Projects = () => {
  const {
    notes, todos, snippets, workspaces, workspaceFilter,
    workspaceSortOrder, openProjectInNewWindow
  } = useContext(WorkspaceContext)
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

  const totalLen = (wspid: string) => {
    let todoCount = todos.filter(
      (todo: any) => todo.workspaceId === wspid).length
    let noteCount = notes.filter(
      (notes: any) => notes.workspaceId === wspid).length
    let snippetCount = snippets.filter(
      (snippets: any) => snippets.workspaceId === wspid).length

    return todoCount + noteCount + snippetCount
  }

  let filteredProjects = useMemo(() => {
    let filteredProjects = workspaces

    if (workspaceFilter) {
      let filteredArr = filteredProjects.filter((project) => {
        return (
          project.name.toLowerCase().indexOf(workspaceFilter.toLowerCase()) !==
          -1
        )
      })
      filteredProjects = filteredArr
    }
    if (workspaceSortOrder === 'usage') {
      return filteredProjects.sort((a, b) => totalLen(b.id) - totalLen(a.id))
    } else {
      return filteredProjects.sort((a, b) => a.name.localeCompare(b.name))
    }
  }, [workspaces, workspaceFilter, workspaceSortOrder])
  const ProjectWidgetBody = () => (
    <Grid item xs>
      <Grid
        container
        wrap="nowrap"
        direction="column"
        style={{ height: '100%' }}
      >
        <Grid item xs style={{ overflow: 'auto' }}>
          {filteredProjects.length === 0 && (
            <Grid
              container
              alignItems="center"
              justifyContent="center"
              style={{ height: '80%', width: '100%' }}
            >
              <Grid item>
                <Button
                  startIcon={<AddCircle />}
                  variant="outlined"
                  onClick={(e) => {
                    e.preventDefault()
                    window.vscode.postMessage({
                      west: {
                        execCommands: [{
                          command: 'vscode.openFolder',
                          options: { forceNewWindow: openProjectInNewWindow }
                        }],
                      },
                    })
                  }}
                >
                  Add a project
                </Button>
              </Grid>
            </Grid>
          )}
          {filteredProjects.length !== 0 && (
            <List dense={true}>
              {filteredProjects.map((workspace) => {
                return (
                  <ProjectListItem
                    key={workspace.id}
                    workspace={workspace}
                  />
                )
              })}
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
              <Typography variant="subtitle1">Projects</Typography>
            </Grid>
            {!minimizeNavIcon &&
              <Grid item>
                <Grid container direction="row" spacing={1}>
                  <Grid item>
                    <ProjectsFilter />
                  </Grid>
                  <Grid item>
                    <IconButton
                      aria-label="Open Folder"
                      size="small"
                      onClick={(e) => {
                        e.preventDefault()
                        window.vscode.postMessage({
                          west: {
                            execCommands: [{
                              command: 'vscode.openFolder',
                              options: { forceNewWindow: openProjectInNewWindow }
                            }],
                          },
                        })
                      }}
                    >
                      <AddCircle fontSize="small" />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <IconButton
                      aria-label="Open Recent"
                      size="small"
                      onClick={(e) => {
                        e.preventDefault()
                        window.vscode.postMessage({
                          west: {
                            execCommands: [
                              {
                                command: 'workbench.action.quickOpenRecent',
                              },
                            ],
                          },
                        })
                      }}
                    >
                      <PageviewIcon fontSize="small" />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <ProjectPop />
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
                            <ProjectsFilter />
                          </Grid>
                          <Grid item>
                            <IconButton
                              aria-label="Open Folder"
                              size="small"
                              onClick={(e) => {
                                e.preventDefault()
                                window.vscode.postMessage({
                                  west: {
                                    execCommands: [{
                                      command: 'vscode.openFolder',
                                      options: { forceNewWindow: openProjectInNewWindow }
                                    }],
                                  },
                                })
                              }}
                            >
                              <AddCircle fontSize="small" />
                            </IconButton>
                          </Grid>
                          <Grid item>
                            <IconButton
                              aria-label="Open Recent"
                              size="small"
                              onClick={(e) => {
                                e.preventDefault()
                                window.vscode.postMessage({
                                  west: {
                                    execCommands: [
                                      {
                                        command: 'workbench.action.quickOpenRecent',
                                      },
                                    ],
                                  },
                                })
                              }}
                            >
                              <PageviewIcon fontSize="small" />
                            </IconButton>
                          </Grid>
                          <Grid item>
                            <ProjectPop />
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
        </HeaderWrapper >
        <ProjectWidgetBody />
      </div >
    )
  }
  return (
    <Dialog fullScreen open={fullscreenMode} onClose={() => setFullscreenMode(false)}>
      <HeaderWrapper>
        <>
          <Grid item>
            <Typography variant="subtitle1">Projects</Typography>
          </Grid>
          <Grid item>
            <Grid container direction="row" spacing={1}>
              <Grid item>
                <ProjectsFilter />
              </Grid>
              <Grid item>
                <IconButton
                  aria-label="Open Folder"
                  size="small"
                  onClick={(e) => {
                    e.preventDefault()
                    window.vscode.postMessage({
                      west: {
                        execCommands: [{
                          command: 'vscode.openFolder',
                          options: { forceNewWindow: openProjectInNewWindow }
                        }],
                      },
                    })
                  }}
                >
                  <AddCircle fontSize="small" />
                </IconButton>
              </Grid>
              <Grid item>
                <IconButton
                  aria-label="Open Recent"
                  size="small"
                  onClick={(e) => {
                    e.preventDefault()
                    window.vscode.postMessage({
                      west: {
                        execCommands: [
                          {
                            command: 'workbench.action.quickOpenRecent',
                          },
                        ],
                      },
                    })
                  }}
                >
                  <PageviewIcon fontSize="small" />
                </IconButton>
              </Grid>
              <Grid item>
                <ProjectPop />
              </Grid>
              <Grid item>
                <ToggleFullScreen toggleFullScreen={handleToggleFullScreen} isFullScreenMode={fullscreenMode} />
              </Grid>
            </Grid>
          </Grid>
        </>
      </HeaderWrapper>
      <ProjectWidgetBody />
    </Dialog>
  )
}

const Widget = () => (
  <WorkspaceProvider>
    <Projects />
  </WorkspaceProvider>
)
export default wrapper(Widget, 'projects')
