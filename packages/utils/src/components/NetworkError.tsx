import React from "react";
import { IconButton, Link, Grid, Typography } from "@material-ui/core";
import ErrorIcon from "@material-ui/icons/Error";
import type { MarqueeWindow } from '../types';

declare const window: MarqueeWindow;

export interface NetworkErrorProps {
  message?: string | JSX.Element
}

const NetworkError = ({ message }: NetworkErrorProps) => {
  const errorCaption = message || (
    <>
      Are you using a proxy? Please make sure to set it up in the {" "}
      <Link
          style={{ cursor: 'pointer' }}
          onClick={() => window.vscode.postMessage({
            west: { execCommands: [{
              command: 'workbench.action.openSettings',
              args: ['Marquee']
            }],
          }})}
      >
          Marquee settings
      </Link>.
    </>
  );

  return (
    <Grid
        container
        style={{ height: "100%" }}
        alignItems="center"
        justifyContent="center"
        direction="column"
    >
        <Grid item>
        <Typography variant="subtitle1">
            <IconButton size="small">
            <ErrorIcon fontSize="small" />
            </IconButton>
            <span>Error fetching data!</span>
        </Typography>
        <Typography variant="caption">
          {errorCaption}
        </Typography>
        </Grid>
    </Grid>
  );
};

export default React.memo(NetworkError);
