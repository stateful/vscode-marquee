import React, { useContext, useMemo } from 'react'
import { Grid, Typography, List, IconButton, Button, Popover } from '@mui/material'
import AddCircle from '@mui/icons-material/AddCircleOutlined'
import PageviewIcon from '@mui/icons-material/Pageview'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'

import wrapper, { Dragger, HeaderWrapper } from '@vscode-marquee/widget'
import { MarqueeWindow } from '@vscode-marquee/utils'
import type { MarqueeWidgetProps } from '@vscode-marquee/widget'

import ProjectsFilter from './components/Filter'
import ProjectPop from './components/Pop'
import ProjectListItem from './components/ListItem'
import WorkspaceContext, { WorkspaceProvider } from './Context'


declare const window: MarqueeWindow

let Projects = ({ 
  ToggleFullScreen,
  minimizeNavIcon,
  open,
  anchorEl,
  handleClick,
  handleClose }: MarqueeWidgetProps) => {
  const {
    notes, todos, snippets, workspaces, workspaceFilter,
    workspaceSortOrder, openProjectInNewWindow, visitCount,
    lastVisited
  } = useContext(WorkspaceContext)

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
    } else if (workspaceSortOrder === 'visits') {
      return filteredProjects.sort((a, b) => (visitCount[b.id] || 0) - (visitCount[a.id] || 0))
    } else if (workspaceSortOrder === 'recent') {
      return filteredProjects.sort((a, b) => (lastVisited[b.id] || 0) - (lastVisited[a.id] || 0))
    } else {
      return filteredProjects.sort((a, b) => a.name.localeCompare(b.name))
    }
  }, [workspaces, workspaceFilter, workspaceSortOrder, visitCount])

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
          <ToggleFullScreen />
        </Grid>
        <Grid item>
          <Dragger />
        </Grid>
      </Grid>
    </Grid >
  )

  return (
    <>
      <HeaderWrapper>
        <Grid item>
          <Typography variant="subtitle1">Projects</Typography>
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
      </HeaderWrapper >
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
    </>
  )
}

const Widget = (props: any) => (
  <WorkspaceProvider>
    <Projects {...props} />
  </WorkspaceProvider>
)
export default wrapper(Widget, 'projects')
