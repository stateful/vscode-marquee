import React, { useContext, useCallback, useMemo } from "react";
import {
  Grid,
  Typography,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import LayersIcon from "@material-ui/icons/Layers";
import FolderIcon from "@material-ui/icons/Folder";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import CodeIcon from "@material-ui/icons/Code";
import NoteIcon from "@material-ui/icons/Note";

import { PrefContext } from "@vscode-marquee/utils";
import { TodoContext } from '@vscode-marquee/widget-todo';
import { NoteContext } from '@vscode-marquee/widget-notes';
import { SnippetContext } from "@vscode-marquee/widget-snippets";
import type { Workspace, MarqueeWindow } from '@vscode-marquee/utils';

import ProjectItemPop from "./ItemPop";
import WorkspaceContext from '../Context';

declare const window: MarqueeWindow;

interface StyleProps {
  background: string
}

const useStyles = makeStyles(() => ({
  badge: (props: StyleProps) => ({
    minHeight: "16px",
    minWidth: "16px",
    height: "16px",
    width: "16px",
    background: props.background,
  }),
}));

interface ProjectListItemProps {
  activeWorkspace: Workspace
  workspace: Workspace
}

let ProjectListItem = ({ activeWorkspace, workspace }: ProjectListItemProps) => {
  const { themeColor } = useContext(PrefContext);
  const classes = useStyles({
    background: `rgba(${themeColor.r}, ${themeColor.g}, ${themeColor.b}, ${themeColor.a})`,
  });

  const { openProjectInNewWindow } = useContext(WorkspaceContext);
  const { todos } = useContext(TodoContext);
  const { notes } = useContext(NoteContext);
  const { snippets } = useContext(SnippetContext);

  let todoCount = useMemo(() => {
    return todos.filter((todo) => todo.workspaceId === workspace.id);
  }, [activeWorkspace, workspace, todos]);

  let noteCount = useMemo(() => {
    return notes.filter((notes) => notes.workspaceId === workspace.id);
  }, [activeWorkspace, workspace, notes]);

  let snippetCount = useMemo(() => {
    return snippets.filter((snippets) => snippets.workspaceId === workspace.id);
  }, [activeWorkspace, workspace, snippets]);

  const handleOpen = useCallback((ev) => {
    let target = ev.target;

    /**
     * don't trigger open if "More" icon was clicked
     */
    if (['svg', 'path'].includes(target.tagName.toLowerCase())) {
      while (target.parentElement) {
        target = target.parentElement;
        if (target.tagName.toLowerCase() === 'button') {
          return;
        }
      }
    }

    /**
     * or if we onfocus the opened more popup
     */
    if (
      target.tagName.toLowerCase() === 'div' &&
      target.parentElement &&
      target.parentElement.getAttribute('role') === 'presentation'
    ) {
      return;
    }

    window.vscode.postMessage({
      west: {
        execCommands: [
          {
            command: "vscode.openFolder",
            args: [workspace.path],
            options: { forceNewWindow: openProjectInNewWindow }
          },
        ],
      },
    });
  }, [workspace, openProjectInNewWindow]);

  return (
    <>
      <ListItem
        selected={
          Boolean(
            activeWorkspace &&
            activeWorkspace.id &&
            workspace.id === activeWorkspace.id
          )
        }
        dense
        button
        disableRipple
        disableTouchRipple
        key={workspace.id}
        style={{ width: "100%" }}
        onClick={handleOpen}
      >
        <ListItemAvatar style={{ minWidth: "40px" }}>
          <>
            {workspace.type === "workspace" && <LayersIcon />}
            {workspace.type === "folder" && <FolderIcon />}
          </>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Grid
              container
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              wrap="nowrap"
            >
              <Grid item>
                <Typography variant="body2">{workspace.name}</Typography>
              </Grid>
              <Grid item>
                <Grid
                  container
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  wrap="nowrap"
                >
                  <Grid item>
                    <Badge
                      classes={{ badge: classes.badge }}
                      badgeContent={todoCount.length}
                      showZero
                    >
                      <CheckBoxIcon fontSize="small" />
                    </Badge>
                  </Grid>

                  <Grid item>
                    <Badge
                      classes={{ badge: classes.badge }}
                      badgeContent={noteCount.length}
                      showZero
                    >
                      <NoteIcon fontSize="small" />
                    </Badge>
                  </Grid>
                  <Grid item>
                    <Badge
                      classes={{ badge: classes.badge }}
                      badgeContent={snippetCount.length}
                      showZero
                    >
                      <CodeIcon fontSize="small" />
                    </Badge>
                  </Grid>
                  <Grid item>
                    <ProjectItemPop workspace={workspace} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          }
          secondary={
            <Typography variant="caption" noWrap style={{ display: "block" }}>
              {workspace.path}
            </Typography>
          }
        />
      </ListItem>
    </>
  );
};

export default React.memo(ProjectListItem);
