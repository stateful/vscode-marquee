import React, { useContext, useMemo } from 'react'
import { Grid, Typography, List, IconButton, Button, Box } from '@mui/material'
import AddCircle from '@mui/icons-material/AddCircleOutlined'
import PageviewIcon from '@mui/icons-material/Pageview'

import wrapper, { Dragger } from '@vscode-marquee/widget'
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

  return (
    <>
      <Grid item xs={1} style={{ maxWidth: '100%' }}>
        <Box sx={{
          borderBottom: '1px solid var(--vscode-foreground)',
          padding: '8px',
        }}>
          <Grid
            container
            direction="row"
            alignItems="stretch"
            alignContent="stretch"
            justifyContent="space-between"
          >
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

const Widget = () => (
  <WorkspaceProvider>
    <Projects />
  </WorkspaceProvider>
)
export default wrapper(Widget, 'projects')
