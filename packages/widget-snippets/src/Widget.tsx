import React, { useContext, useEffect, useMemo, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Grid,
  IconButton,
  Typography,
  TextField,
  Button,
} from "@material-ui/core";

import { AddCircle, Clear } from "@material-ui/icons";
import LinkIcon from "@material-ui/icons/Link";
import wrapper, { Dragger, HidePop } from "@vscode-marquee/widget";
import { GlobalContext, jumpTo, DoubleClickHelper, MarqueeWindow } from "@vscode-marquee/utils";

import SplitterLayout from "react-splitter-layout";
import { List, AutoSizer } from "react-virtualized";
import "react-virtualized/styles.css";
import "../css/react-splitter-layout.css";

import SnippetContext, { SnippetProvider } from "./Context";

import SnippetEditor from "./components/Editor";
import SnippetListItem from "./components/ListItem";

declare const window: MarqueeWindow;

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

let Snippets = () => {
  const classes = useStyles();
  const { globalScope } = useContext(GlobalContext);

  const {
    _updateSnippet,
    setSnippetFilter,
    setSnippetSelected,
    setSnippetSplitter,
    snippets,
    snippetFilter,
    snippetSelected,
    snippetSplitter,

    setShowAddDialog,
    setShowEditDialog
  } = useContext(SnippetContext);

  const snippet = useMemo(() => {
    return snippets.find((snippet) => snippet.id === snippetSelected);
  }, [snippetSelected, snippets]);

  const snippetLinkFileName = useMemo(() => {
    if (
      snippet && snippet.path && snippet.exists && snippet.hasOwnProperty("path") &&
      snippet.path.indexOf("/") !== -1
    ) {
      return snippet.path.split("/").reverse()[0].toUpperCase();
    }

    return '';
  }, [snippet]);

  const snippetsArr = useMemo(() => {
    let filteredItems = snippets;

    if (!globalScope) {
      filteredItems = filteredItems.filter((item) => (
        item.workspaceId && item.workspaceId === window.activeWorkspace?.id
      ));
    }

    if (snippetFilter) {
      filteredItems = filteredItems.filter((item) => (
        item.title.toLowerCase().indexOf(snippetFilter.toLowerCase()) !== -1
      ));
    }

    return filteredItems;
  }, [globalScope, snippets, snippetFilter]);

  useEffect(() => {
    if (snippetsArr.length !== 0) {
      setSnippetSelected(snippetsArr[0].id);
    }
  }, [snippetFilter, globalScope]);

  const snippetItemClick = useCallback((e, index) => {
    if (e.detail === 1) {
      if (snippetsArr[index] && snippetsArr[index].id) {
        setSnippetSelected(snippetsArr[index].id);
      } else {
        console.error({
          message:
            "Trying to set selected snippet to an entry that doesn't exist in the array",
          eventObj: e,
        });
      }
    }

    if (e.detail === 2) {
      setShowEditDialog(snippetsArr[index].id);
    }
  }, [snippetsArr]);

  const rowRenderer = ({ key, index, style }: RowRendererProps) => {
    const snippetEntry = snippetsArr[index];
    return (
      <SnippetListItem
        key={key}
        keyVal={key}
        index={index}
        style={style}
        snippet={snippetEntry}
        selected={snippetSelected}
        click={snippetItemClick}
      />
    );
  };

  return (
    <>
      <Grid item style={{ maxWidth: "100%" }}>
        <div className={classes.widgetTitle}>
          <Grid container direction="row" justifyContent="space-between">
            <Grid item>
              <Grid container direction="row" spacing={1} alignItems="center">
                <Grid item>
                  <Typography variant="subtitle1">Snippets</Typography>
                </Grid>
                <Grid item>
                  {snippet &&
                    snippetLinkFileName !== "" &&
                    snippetsArr.length !== 0 && (
                      <Button
                        size="small"
                        startIcon={<LinkIcon />}
                        disableFocusRipple
                        onClick={() => jumpTo(snippet)}
                      >
                        {snippetLinkFileName}
                      </Button>
                    )}
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container direction="row" spacing={1} alignItems="center">
                <Grid item>
                  <IconButton
                    size="small"
                    onClick={() => setShowAddDialog(true)}
                  >
                    <AddCircle fontSize="small" />
                  </IconButton>
                </Grid>
                <Grid item>
                  <DoubleClickHelper content="Double-click a snippet title to edit and right-click for copy & paste" />
                </Grid>
                <Grid item>
                  <HidePop name="snippets" />
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
              secondaryInitialSize={snippetSplitter || 80}
              onSecondaryPaneSizeChange={setSnippetSplitter}
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
                      value={snippetFilter}
                      onChange={(e) => setSnippetFilter(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <Clear
                            fontSize="small"
                            style={{ cursor: "pointer" }}
                            onClick={() => setSnippetFilter("") }
                          />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs style={{ maxWidth: "100%" }}>
                    <AutoSizer>
                      {({ height, width }) => (
                        <List
                          width={width}
                          height={height}
                          rowCount={snippetsArr.length}
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
                    {snippetsArr.length === 0 && (
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
                          <Button
                            startIcon={<AddCircle />}
                            variant="outlined"
                            onClick={() => setShowAddDialog(true) }
                          >
                            Create a snippet
                          </Button>
                        </Grid>
                      </Grid>
                    )}
                    {snippetsArr.length !== 0 && snippet && (
                      <SnippetEditor
                        body={snippet.body}
                        language={snippet.language}
                        onChange={(body) => _updateSnippet({ ...snippet, body }) }
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

export default wrapper(() => (
  <SnippetProvider>
    <Snippets />
  </SnippetProvider>
), 'snippets');
