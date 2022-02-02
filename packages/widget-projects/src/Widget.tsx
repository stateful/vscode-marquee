import React, { useContext, useMemo } from "react";
import { Grid, Typography, List, IconButton, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AddCircle from "@material-ui/icons/AddCircleOutlined";
import PageviewIcon from "@material-ui/icons/Pageview";

import wrapper, { Dragger } from "@vscode-marquee/widget";
import { MarqueeWindow, GlobalContext } from "@vscode-marquee/utils";

import { NoteContext } from "@vscode-marquee/widget-notes";
import { SnippetContext } from "@vscode-marquee/widget-snippets";

import ProjectsFilter from "./components/Filter";
import ProjectPop from "./components/Pop";
import ProjectListItem from "./components/ListItem";
import WorkspaceContext, { WorkspaceProvider } from './Context';

declare const window: MarqueeWindow;

const useStyles = makeStyles(() => ({
  widgetTitle: {
    borderBottom: "1px solid var(--vscode-foreground)",
    padding: "8px",
  },
}));

let Projects = () => {
  const classes = useStyles();
  const { activeWorkspace } = useContext(GlobalContext);
  // ToDo(Christian): make todos accessible here
  const { todos } = { todos: [] }; // useContext(TodoContext);
  const { notes } = useContext(NoteContext);
  const { snippets } = useContext(SnippetContext);
  const { workspaces, workspaceFilter, workspaceSortOrder, openProjectInNewWindow } = useContext(WorkspaceContext);

  const totalLen = (wspid: string) => {
    let todoCount = todos.filter((todo: any) => todo.workspaceId === wspid).length;
    let noteCount = notes.filter((notes) => notes.workspaceId === wspid).length;
    let snippetCount = snippets.filter(
      (snippets) => snippets.workspaceId === wspid
    ).length;

    return todoCount + noteCount + snippetCount;
  };

  let filteredProjects = useMemo(() => {
    let filteredProjects = workspaces;

    if (workspaceFilter !== "") {
      let filteredArr = filteredProjects.filter((project) => {
        return (
          project.name.toLowerCase().indexOf(workspaceFilter.toLowerCase()) !==
          -1
        );
      });
      filteredProjects = filteredArr;
    }
    if (workspaceSortOrder === "usage") {
      return filteredProjects.sort((a, b) => totalLen(b.id) - totalLen(a.id));
    } else {
      return filteredProjects.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [activeWorkspace, workspaces, workspaceFilter, workspaceSortOrder]);

  return (
    <>
      <Grid item xs={1} style={{ maxWidth: "100%" }}>
        <div className={classes.widgetTitle}>
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
                      e.preventDefault();
                      window.vscode.postMessage({
                        west: {
                          execCommands: [{
                            command: "vscode.openFolder",
                            options: { forceNewWindow: openProjectInNewWindow }
                          }],
                        },
                      });
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
                      e.preventDefault();
                      window.vscode.postMessage({
                        west: {
                          execCommands: [
                            {
                              command: "workbench.action.quickOpenRecent",
                            },
                          ],
                        },
                      });
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
        </div>
      </Grid>
      <Grid item xs>
        <Grid
          container
          wrap="nowrap"
          direction="column"
          style={{ height: "100%" }}
        >
          <Grid item xs style={{ overflow: "auto" }}>
            {filteredProjects.length === 0 && (
              <Grid
                container
                alignItems="center"
                justifyContent="center"
                style={{ height: "80%", width: "100%" }}
              >
                <Grid item>
                  <Button
                    startIcon={<AddCircle />}
                    variant="outlined"
                    onClick={(e) => {
                      e.preventDefault();
                      window.vscode.postMessage({
                        west: {
                          execCommands: [{
                            command: "vscode.openFolder",
                            options: { forceNewWindow: openProjectInNewWindow }
                          }],
                        },
                      });
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
                      activeWorkspace={activeWorkspace!}
                    />
                  );
                })}
              </List>
            )}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

const Widget = () => (
  <WorkspaceProvider>
    <Projects />
  </WorkspaceProvider>
);
export default wrapper(Widget, 'projects');
