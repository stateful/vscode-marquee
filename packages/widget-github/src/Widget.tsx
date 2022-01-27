import React, { useContext, useMemo } from "react";
import { Grid, Link, Typography, Chip, Avatar, CircularProgress } from "@material-ui/core";
import AvatarGroup from "@material-ui/lab/AvatarGroup";
import wrapper, { Dragger, HidePop } from "@vscode-marquee/widget";
import StarIcon from "@material-ui/icons/Star";
import StarHalfIcon from "@material-ui/icons/StarHalf";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import { makeStyles } from "@material-ui/core/styles";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCodeBranch } from "@fortawesome/free-solid-svg-icons";

import { NetworkError } from "@vscode-marquee/utils";

import TrendContext, { TrendProvider } from "./Context";
import TrendingDialogLauncher from "./components/TrendingDialog";
import Filter from "./components/Filter";

const useStyles = makeStyles(() => ({
  widgetTitle: {
    borderBottom: "1px solid var(--vscode-foreground)",
    padding: "8px",
  },
  trendEntry: {
    marginTop: "4px",
    marginBottom: "4px",
    padding: "16px",
    borderBottom: "1px solid var(--vscode-foreground)",
  },
}));

let GChip = ({ ...rest }) => {
  return (
    <Chip
      variant="outlined"
      style={{ fontSize: "12px", border: 0 }}
      size="small"
      {...rest}
    />
  );
};

let Github = () => {
  const classes = useStyles();
  const { trends, isFetching, error, trendFilter } = useContext(TrendContext);

  const filteredTrends = useMemo(() => {
    let filteredTrends = trends;

    if (trendFilter) {
      let filteredArr = filteredTrends.filter((entry) => {
        return (
          entry.description.toLowerCase().indexOf(trendFilter.toLowerCase()) !==
          -1
        );
      });
      filteredTrends = filteredArr;
    }

    return filteredTrends;
  }, [trends]);

  return (
    <>
      <Grid item xs={1} style={{ maxWidth: "100%" }}>
        <div className={classes.widgetTitle}>
          <Grid
            container
            direction="row"
            wrap="nowrap"
            alignItems="stretch"
            alignContent="stretch"
            justifyContent="space-between"
          >
            <Grid item>
              <Typography variant="subtitle1">Trending on Github</Typography>
            </Grid>
            <Grid item>
              <Grid container direction="row" spacing={1}>
                <Grid item>
                  <Filter />
                </Grid>
                <Grid item>
                  <TrendingDialogLauncher />
                </Grid>
                <Grid item>
                  <HidePop name="github" />
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
            {error && (
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
                <NetworkError message={error.message} />
              </Grid>
            )}
            {isFetching && (
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
            {!isFetching && !error && filteredTrends.length === 0 && (
              <Grid
                container
                style={{ height: "100%" }}
                alignItems="center"
                justifyContent="center"
                direction="column"
              >
                <Grid item>
                  <Typography variant="body2">
                    There are no matches for your search criteria.
                  </Typography>
                </Grid>
              </Grid>
            )}
            {!isFetching && !error && filteredTrends.length !== 0 &&
              filteredTrends.map((entry) => {
                return (
                  <Grid
                    key={entry.url}
                    container
                    direction="column"
                    className={classes.trendEntry}
                  >
                    <Grid
                      container
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid item>
                        <Link
                          component="a"
                          href={`${entry.url}`}
                          target="_blank"
                        >
                          <Typography variant="body2">
                            {entry.author}/{entry.name}
                          </Typography>
                        </Link>
                      </Grid>
                      <Grid item>
                        <GChip
                          label={entry.currentPeriodStars.toLocaleString()}
                          icon={<StarHalfIcon />}
                        />
                      </Grid>
                    </Grid>
                    <Grid
                      container
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid item>
                        <Typography variant="caption">
                          {entry.description}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item>&nbsp;</Grid>
                    </Grid>
                    <Grid
                      container
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-end"
                    >
                      <Grid item>
                        <Grid container spacing={1}>
                          {entry.language && (
                            <Grid item>
                              <GChip
                                label={entry.language}
                                icon={
                                  <FiberManualRecordIcon
                                    style={{
                                      fill: `${entry.languageColor}`,
                                    }}
                                  />
                                }
                              />
                            </Grid>
                          )}
                          <Grid item>
                            <GChip
                              label={entry.forks.toLocaleString()}
                              icon={<FontAwesomeIcon icon={faCodeBranch} />}
                            />
                          </Grid>
                          <Grid item>
                            <GChip
                              label={entry.stars.toLocaleString()}
                              icon={<StarIcon />}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item>
                        <AvatarGroup>
                          {entry.builtBy.map((contributor) => {
                            return (
                              <Avatar
                                key={contributor.username}
                                style={{
                                  height: "22px",
                                  width: "22px",
                                  border: 0,
                                }}
                                src={contributor.avatar}
                                alt={contributor.username}
                              />
                            );
                          })}
                        </AvatarGroup>
                      </Grid>
                    </Grid>
                  </Grid>
                );
              })}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

const Widget = () => (
  <TrendProvider>
    <Github />
  </TrendProvider>
);
export default wrapper(Widget, 'github');
