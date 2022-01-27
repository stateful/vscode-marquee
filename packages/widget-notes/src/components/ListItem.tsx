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
import NoteIcon from "@material-ui/icons/Note";
import copy from "copy-to-clipboard";
import { stripHtml } from "string-strip-html";
import { unescape } from "html-escaper";

import { GlobalContext, getEventListener, MarqueeEvents } from "@vscode-marquee/utils";

import NoteContext from "../Context";
import type { Note } from '../types';

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

interface NoteListItemProps {
  note: Note
  index: number
  keyVal: React.Key
  style: object
  selected: string
  click: (e: any, index: number) => void
}

let NoteListItem = ({ note, index, keyVal, style, selected, click }: NoteListItemProps) => {
  const eventListener = getEventListener<MarqueeEvents>();
  const classes = useStyles();
  const { _removeNote, _updateNote, setShowEditDialog } = useContext(NoteContext);
  const { activeWorkspace } = useContext(GlobalContext);

  const [anchorEl, setAnchorEl] = useState(null);

  const matchingWorkspace = useMemo(() => {
    let found = false;
    if (!activeWorkspace) {
      found = true;
    }
    if (activeWorkspace && activeWorkspace.id) {
      if (note && note.workspaceId) {
        if (activeWorkspace.id === note.workspaceId) {
          found = true;
        }
      }
    }
    return found;
  }, [activeWorkspace, note]);

  const moveToCurrentWorkspace = useCallback(() => {
    if (!activeWorkspace || !activeWorkspace.id) {
      return;
    }

    let updatedNote = note;
    updatedNote.workspaceId = activeWorkspace.id;
    _updateNote(updatedNote);
    setAnchorEl(null);
  }, [note, activeWorkspace]);

  const handleRightClick = useCallback((e) => {
    setAnchorEl(e.currentTarget);
  }, []);

  const handleClose = useCallback((e) => {
    setAnchorEl(null);
    e.preventDefault();
    e.stopPropagation();
  }, []);

  let deleteNote = useCallback(
    () => {
      _removeNote(note.id);
    },
    [note]
  );

  const open = Boolean(anchorEl);
  const id = open ? "note-item-popover" : undefined;

  if (!note) {
    return <></>;
  }
  return (
    <ListItem
      selected={note.id === selected}
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
                  setShowEditDialog(note.id);
                  handleClose(e);
                }}
              >
                <ListItemText
                  primary={<Typography variant="body2">Edit</Typography>}
                />
              </ListItem>
              <ListItem
                button
                onClick={(e) => {
                  copy(note.body);
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
                  onClick={() => moveToCurrentWorkspace() }
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

              <ListItem
                button
                onClick={(e) => {
                  let newSnippet = note;
                  if (typeof note.text === 'string' && note.text.length > 0) {
                    newSnippet.body = unescape(note.text);
                  } else {
                    newSnippet.body = stripHtml(note.body).result;
                  }

                  eventListener.emit('addSnippet', newSnippet);
                  deleteNote();
                  handleClose(e);
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2">Move to snippets</Typography>
                  }
                />
              </ListItem>
              <ListItem
                button
                onClick={(e) => {
                  deleteNote();
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
              justifyContent="flex-start"
              alignItems="stretch"
              direction="row"
              style={{ paddingTop: "4px" }}
            >
              <Grid item>
                <NoteIcon fontSize="small" />
              </Grid>
              <Grid item>
                <Tooltip title={note.title} placement="top" arrow>
                  <Typography variant="body2" noWrap>
                    {note.title}
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

export default React.memo(NoteListItem);
