import React, { useContext, useEffect, useMemo, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography, TextField, IconButton, Button } from "@material-ui/core";
import { Clear, AddCircle } from "@material-ui/icons";

import SplitterLayout from "react-splitter-layout";
import { List, AutoSizer } from "react-virtualized";

import { GlobalContext, DoubleClickHelper } from '@vscode-marquee/utils';
import wrapper, { Dragger, HidePop } from "@vscode-marquee/widget";

import NoteContext from "./Context";

import "react-virtualized/styles.css";
import "../css/react-splitter-layout.css";

import NoteEditor from "./components/Editor";
import NoteListItem from "./components/ListItem";

const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
    height: "100%",
    maxWidth: "100%",
  },
  widgetTitle: {
    borderBottom: "1px solid var(--vscode-foreground)",
    padding: "8px",
  },
}));

interface RowRendererProps {
  key: React.Key
  index: number
  style: object
}

let Notes = () => {
  const classes = useStyles();
  const { globalScope, activeWorkspace } = useContext(GlobalContext);

  const {
    _updateNote,
    _updateNoteFilter,
    _updateNoteSelected,
    _updateNoteSplitter,
    notes,
    noteFilter,
    noteSelected,
    noteSplitter,

    setShowEditDialog,
    setShowAddDialog
  } = useContext(NoteContext);

  let note = useMemo(() => {
    return notes.find((note) => note.id === noteSelected);
  }, [noteSelected, notes]);

  let notesArr = useMemo(() => {
    let filteredItems = notes;

    if (!globalScope) {
      let filteredArr = filteredItems.filter((item) => {
        if (item.workspaceId && activeWorkspace && activeWorkspace.id) {
          if (item.workspaceId === activeWorkspace.id) {
            return true;
          }
        }
      });
      filteredItems = filteredArr;
    }

    if (noteFilter) {
      let filteredArr = filteredItems.filter((item) => {
        return (
          item.title.toLowerCase().indexOf(noteFilter.toLowerCase()) !== -1
        );
      });
      filteredItems = filteredArr;
    }

    return filteredItems;
  }, [activeWorkspace, notes, globalScope, noteFilter]);

  useEffect(() => {
    if (notesArr.length !== 0) {
      _updateNoteSelected(notesArr[0].id);
    }
  }, [noteFilter, globalScope]);

  useEffect(() => {
    let exists = notesArr.find((entry) => entry.id === noteSelected);
    if (!exists && notesArr.length !== 0) {
      _updateNoteSelected(notesArr[0].id);
    }
  }, [notes]);

  const noteItemClick = useCallback(
    (e, index) => {
      if (e.detail === 1) {
        let noteId = notesArr[index].id;
        _updateNoteSelected(noteId);
      }

      if (e.detail === 2) {
        setShowEditDialog(notesArr[index].id);
      }
    },
    [notesArr]
  );

  let rowRenderer = ({ key, index, style }: RowRendererProps) => {
    let noteEntry = notesArr[index];

    return (
      <NoteListItem
        key={key}
        keyVal={key}
        index={index}
        style={style}
        note={noteEntry}
        selected={noteSelected}
        click={noteItemClick}
      />
    );
  };

  return (
    <>
      <Grid item style={{ maxWidth: "100%" }}>
        <div className={classes.widgetTitle}>
          <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item>
              <Typography variant="subtitle1">Notes</Typography>
            </Grid>
            <Grid item>
              <Grid container direction="row" spacing={1} alignItems="center">
                <Grid item>
                  <IconButton size="small" onClick={() => setShowAddDialog(true)}>
                    <AddCircle fontSize="small" />
                  </IconButton>
                </Grid>
                <Grid item>
                  <DoubleClickHelper content="Double-click a note title to edit and right-click for copy & paste" />
                </Grid>
                <Grid item>
                  <HidePop name="notes" />
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
          <Grid item xs style={{ overflow: "hidden" }}>
            <SplitterLayout
              percentage={true}
              primaryIndex={0}
              secondaryMinSize={10}
              primaryMinSize={10}
              secondaryInitialSize={noteSplitter}
              onSecondaryPaneSizeChange={_updateNoteSplitter}
            >
              <div
                style={{
                  height: "100%",
                  overflow: "hidden",
                }}
              >
                <Grid
                  container
                  wrap="nowrap"
                  direction="column"
                  style={{
                    height: "100%",
                    overflow: "hidden",
                  }}
                >
                  <Grid item style={{ maxWidth: "100%", padding: "8px" }}>
                    <TextField
                      margin="dense"
                      placeholder="Filter..."
                      fullWidth
                      size="small"
                      value={noteFilter}
                      onChange={(e) => {
                        _updateNoteFilter(e.target.value);
                      }}
                      InputProps={{
                        endAdornment: (
                          <Clear
                            fontSize="small"
                            style={{ cursor: "pointer" }}
                            onClick={() => _updateNoteFilter("") }
                          />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs style={{ maxWidth: "100%" }}>
                    <AutoSizer>
                      {({ height, width }: { width: number, height: number }) => (
                        <List
                          width={width}
                          height={height}
                          rowCount={notesArr.length}
                          rowHeight={30}
                          rowRenderer={rowRenderer}
                        />
                      )}
                    </AutoSizer>
                  </Grid>
                </Grid>
              </div>
              <div style={{ height: "100%" }}>
                <Grid container style={{ width: "100%", height: "100%" }}>
                  <Grid
                    item
                    style={{
                      height: "100%",
                      width: "100%",
                      overflow: "auto",
                    }}
                  >
                    {notesArr.length === 0 && (
                      <Grid
                        container
                        style={{ height: "100%" }}
                        alignItems="center"
                        justifyContent="center"
                        direction="column"
                      >
                        <Grid item>
                          <Typography>Nothing here yet.</Typography>
                        </Grid>
                        <Grid item>&nbsp;</Grid>
                        <Grid item>
                          <Button startIcon={<AddCircle />} variant="outlined" onClick={() => setShowAddDialog(true)}>
                            Create a note
                          </Button>
                        </Grid>
                      </Grid>
                    )}
                    {notesArr.length !== 0 && note && (
                      <NoteEditor
                        name="widget"
                        body={note.body}
                        text={note.text || ""}
                        _change={(newBody, newText) => {
                          _updateNote({
                            ...note!,
                            body: newBody,
                            text: newText,
                          });
                        }}
                      />
                    )}
                  </Grid>
                </Grid>
              </div>
            </SplitterLayout>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default wrapper(Notes, 'notes');
