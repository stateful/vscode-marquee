import React, { useState, useEffect } from "react";
import {
  Grid,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHackerNews } from "@fortawesome/free-brands-svg-icons/faHackerNews";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";

import wrapper, { Dragger } from "@vscode-marquee/widget";
import { NetworkError } from "@vscode-marquee/utils";

import PopMenu from "./components/Pop";
import { fetchNews } from './utils';
import { DEFAULT_STATE } from "./constants";
import type { WidgetState } from "./types";

const useStyles = makeStyles(() => ({
  widgetTitle: {
    borderBottom: "1px solid var(--vscode-foreground)",
    padding: "8px",
  },
}));

let News = () => {
  const classes = useStyles();
  const [data, setData] = useState(DEFAULT_STATE);
  useEffect(() => {
    let _setData = (data: WidgetState) => setData(data);
    setData({ ...data, isFetching: true });
    fetchNews(data).then((data) => _setData(data));
    return () => { _setData = () => {}; };
  }, [data.channel]);

  return (
    <>
      <Grid item xs={1} style={{ maxWidth: "100%" }}>
        <div className={classes.widgetTitle}>
          <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item>
              <Typography variant="subtitle1">News</Typography>
            </Grid>
            <Grid item>
              <Grid container direction="row" spacing={1}>
                <Grid item>
                  <PopMenu value={data.channel} onChannelChange={(channel) => setData({ ...data, channel })} />
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
            {data.error && (
              <Grid
                item
                xs
                style={{
                  overflow: "auto",
                  height: "100%",
                  width: "100%",
                  padding: "24px",
                }}
              >
                <NetworkError message={data.error.message} />
              </Grid>
            )}
            {data.isFetching && (
              <Grid
                container
                style={{ height: "100%" }}
                alignItems="center"
                justifyContent="center"
                direction="column"
              >
                <Grid item>
                  <CircularProgress color="secondary" />
                </Grid>
              </Grid>
            )}
            {!data.isFetching && data.news.length === 0 && (
              <Grid
                container
                style={{ height: "100%" }}
                alignItems="center"
                justifyContent="center"
                direction="column"
              >
                <Grid item>
                  No news available at the moment!
                </Grid>
              </Grid>
            )}
            {!data.isFetching && data.news.length !== 0 && (
              <List dense={true}>
                {data.news.map((entry) => (
                  <ListItem dense key={entry.id}>
                    <ListItemAvatar>
                      <Grid container justifyContent="center" alignItems="center">
                        <Grid item>
                          <FontAwesomeIcon icon={faHackerNews} />
                        </Grid>
                      </Grid>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <>
                          <Link
                            component="a"
                            href={`https://news.ycombinator.com/item?id=${entry.id}`}
                            target="_blank"
                          >
                            {entry.title}
                          </Link>
                          {entry.domain && (
                            <Typography variant="caption">
                              &nbsp;(
                              <Link
                                component="a"
                                href={`${entry.url}`}
                                target="_blank"
                              >
                                {entry.domain}
                              </Link>
                              )
                            </Typography>
                          )}
                        </>
                      }
                      secondary={
                        <Typography style={{ fontSize: "10px" }}>
                          {entry.points} points by {entry.user} &nbsp;
                          {entry.time_ago}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default wrapper(News, 'news');
