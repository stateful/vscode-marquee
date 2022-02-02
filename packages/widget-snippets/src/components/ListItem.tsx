import React, { useState, useContext, useCallback, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Typography,
  ListItem,
  ListItemText,
  Popover,
  Grid,
  Tooltip,
} from "@material-ui/core";
import CodeIcon from "@material-ui/icons/Code";

import copy from "copy-to-clipboard";
import { stringify } from "javascript-stringify";
import { escape } from "html-escaper";

import { GlobalContext, MarqueeWindow, jumpTo } from "@vscode-marquee/utils";

import SnippetContext from "../Context";
import type { Snippet } from "../types";

declare const window: MarqueeWindow;

const useStyles = makeStyles(() => ({
  selected: {
    color: "var(--vscode-foreground)",

    "&.Mui-selected": {
      backgroundColor: "var(--vscode-dropdown-background)",
      color: "var(--vscode-foreground)",
    },
    "&.Mui-selected:hover": {
      backgroundColor: "var(--vscode-dropdown-background)",
      color: "var(--vscode-foreground)",
    },
    "&.MuiListItem-button:hover": {
      backgroundColor: "var(--vscode-dropdown-background)",
      color: "var(--vscode-foreground)",
    },
  },
}));

interface SnippetListItemProps {
  snippet: Snippet | null
  index: number
  keyVal: React.Key
  style: object
  selected: string
  click: (e: any, index: number) => void
}

let SnippetListItem = ({
  snippet = null,
  index,
  keyVal,
  style,
  selected,
  click,
}: SnippetListItemProps) => {
  const classes = useStyles();
  const { _removeSnippet, _updateSnippet, setShowEditDialog } = useContext(SnippetContext);
  // ToDo(Christian): make adding notes availble hre
  const { _addNote } = { _addNote: (note: any) => note }; // useContext(NoteContext);
  const { activeWorkspace } = useContext(GlobalContext);

  const [anchorEl, setAnchorEl] = useState(null);

  const matchingWorkspace = useMemo(() => {
    let found = false;
    if (!activeWorkspace) {
      found = true;
    }
    if (activeWorkspace && activeWorkspace.id) {
      if (snippet && snippet.workspaceId) {
        if (activeWorkspace.id === snippet.workspaceId) {
          found = true;
        }
      }
    }
    return found;
  }, [activeWorkspace, snippet]);

  const moveToCurrentWorkspace = useCallback(() => {
    if (!activeWorkspace || !activeWorkspace.id) {
      return;
    }

    let updatedSnippet = snippet;
    updatedSnippet!.workspaceId = activeWorkspace.id;
    _updateSnippet(updatedSnippet);
    setAnchorEl(null);
  }, [snippet, activeWorkspace]);

  const handleRightClick = useCallback((e) => {
    setAnchorEl(e.currentTarget);
  }, []);

  const handleClose = useCallback((e) => {
    setAnchorEl(null);
    e.preventDefault();
    e.stopPropagation();
  }, []);

  let deleteSnippet = useCallback(
    () => {
      _removeSnippet(snippet!.id);
    },
    [snippet]
  );

  const open = Boolean(anchorEl);
  const id = open ? "snippet-item-popover" : undefined;

  if (!snippet) {
    return <></>;
  }
  return (
    <ListItem
      selected={snippet.id === selected}
      button
      disableRipple
      disableTouchRipple
      className={classes.selected}
      style={style}
      key={keyVal}
      onClick={(e: any) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target.innerHTML !== "Copy to clipboard") {
          click(e, index);
        }
      }}
      onContextMenu={handleRightClick}
      component="div"
      ContainerComponent="div"
    >
      <ListItemText
        primary={
          <>
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "center",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              <ListItem
                button
                onClick={(e) => {
                  setShowEditDialog(snippet.id);
                  handleClose(e);
                }}
              >
                <ListItemText
                  primary={<Typography variant="body2">Edit</Typography>}
                />
              </ListItem>

              {snippet && snippet.exists && (
                <ListItem
                  button
                  onClick={(e) => {
                    jumpTo(snippet);
                    handleClose(e);
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2">Jump to origin</Typography>
                    }
                  />
                </ListItem>
              )}
              <ListItem
                button
                onClick={(e) => {
                  copy(snippet.body);
                  handleClose(e);
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2">Copy to clipboard</Typography>
                  }
                />
              </ListItem>
              {!matchingWorkspace && (
                <ListItem
                  button
                  onClick={() => {
                    moveToCurrentWorkspace();
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        Move to current workspace
                      </Typography>
                    }
                  />
                </ListItem>
              )}
              {snippet.language && snippet.language.name === "json" && (
                <ListItem
                  button
                  onClick={(e) => {
                    try {
                      var literal = stringify(
                        JSON.parse(snippet.body),
                        null,
                        2
                      ) || '';
                      copy(literal);
                    } catch (err) {
                      window.vscode.postMessage({
                        west: {
                          notify: {
                            type: "error",
                            message:
                              "An error occured parsing the provided JSON.",
                          },
                        },
                      });
                    }

                    handleClose(e);
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        Copy as object literal
                      </Typography>
                    }
                  />
                </ListItem>
              )}
              <ListItem
                button
                onClick={(e) => {
                  let newNote = { ...snippet };
                  let newBody = escape(snippet.body);
                  newBody = newBody.replace(/ /g, "\u00a0");
                  newBody = newBody.replace(/(?:\r\n|\r|\n)/g, "<br>");
                  newNote.body = newBody;
                  _addNote(newNote as any);
                  deleteSnippet();
                  handleClose(e);
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2">Move to notes</Typography>
                  }
                />
              </ListItem>
              <ListItem
                button
                onClick={(e) => {
                  deleteSnippet();
                  handleClose(e);
                }}
              >
                <ListItemText
                  primary={<Typography variant="body2">Delete</Typography>}
                />
              </ListItem>
            </Popover>

            <Grid
              container
              wrap="nowrap"
              spacing={1}
              style={{ paddingTop: "4px" }}
            >
              <Grid item>
                <CodeIcon fontSize="small" />
              </Grid>
              <Grid item>
                <Tooltip title={snippet.title} placement="top" arrow>
                  <Typography
                    variant="body1"
                    noWrap
                    style={{ fontFamily: "monospace" }}
                  >
                    {snippet.title}
                  </Typography>
                </Tooltip>
              </Grid>
            </Grid>
          </>
        }
      />
    </ListItem>
  );
};

export default React.memo(SnippetListItem);
