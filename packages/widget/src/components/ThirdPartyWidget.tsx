import React from "react";
import { Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import wrapper from './WidgetWrapper';
import HidePop from './HidePop';
import Dragger from './Dragger';

interface Props {
  name: string;
  label: string;
}

const useStyles = makeStyles(() => ({
  widgetTitle: {
    borderBottom: "1px solid var(--vscode-foreground)",
    padding: "8px",
  }
}));

let ThirdPartyWidget = ({ name, label }: Props) => {
  const classes = useStyles();
  const WidgetTag = name;

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
              <Typography variant="subtitle1">{label}</Typography>
            </Grid>
            <Grid item>
              <Grid container direction="row" spacing={1}>
                <Grid item>
                  <HidePop name={name} />
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
            <WidgetTag />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default wrapper(ThirdPartyWidget);
