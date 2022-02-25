import React, { useContext } from "react";
import { Grid, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter } from "@fortawesome/free-brands-svg-icons/faTwitter";

import wrapper, { Dragger } from "@vscode-marquee/widget";
import { NetworkError } from '@vscode-marquee/utils';

import TrickContext, { TrickProvider } from './Context';
import TrickContent from "./components/TrickContent";
import PopMenu from "./components/Pop";

const useStyles = makeStyles(() => ({
  widgetTitle: {
    borderBottom: "1px solid var(--vscode-foreground)",
    padding: "8px",
  },
}));

let Welcome = () => {
  const { error } = useContext(TrickContext);
  const classes = useStyles();

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
              <Typography variant="subtitle1">Mailbox</Typography>
            </Grid>
            <Grid item>
              <Grid container direction="row" spacing={1}>
                <Grid item>
                  <PopMenu />
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
          {!error && (
            <Grid
              item
              xs
              style={{
                overflow: "auto",
                paddingTop: "16px",
                paddingRight: "16px",
                paddingLeft: "16px",
                paddingBottom: "8px",
              }}
            >
              <Grid
                container
                style={{
                  height: "100%",
                  width: "100%",
                }}
                direction="column"
                wrap="nowrap"
              >
                <Grid item xs={1} style={{ maxWidth: "100%" }}>
                  <Grid
                    container
                    justifyContent="flex-end"
                    alignItems="center"
                    style={{ height: "100%", padding: "8px" }}
                  >
                    <Grid item>
                      <Typography variant="caption">
                        <Link
                          component="a"
                          href={`https://twitter.com/intent/tweet?text=Check%20out%20the%20Marquee%20extension%20for%20VS%20Code!%20https://marketplace.visualstudio.com/items?itemName=stateful.marquee`}
                          target="_blank"
                        >
                          Share Marquee on &nbsp;
                          <FontAwesomeIcon icon={faTwitter} />
                        </Link>
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={11} style={{ maxWidth: "100%" }}>
                  <TrickContent />
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </>
  );
};

const Widget = () => (
  <TrickProvider>
    <Welcome />
  </TrickProvider>
);
export default wrapper(Widget, 'welcome');
