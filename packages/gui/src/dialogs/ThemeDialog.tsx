import React, { useContext } from "react";
import {
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

import { GlobalContext } from "@vscode-marquee/utils";
import { DialogContainer, DialogTitle } from "@vscode-marquee/dialog";

import backgrounds from '../utils/backgrounds';
import { themes } from "../constants";
import type { Theme } from '../types';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
  selectedButton: {
    color: "var(--vscode-foreground)",
    border: "1px solid var(--vscode-button-foreground)",
  },
  notSelectedButton: {
    color: "var(--vscode-foreground)",
    border: "1px solid var(--vscode-button-background)",
  },
}));

interface ThemeButtonProps {
  tile: Theme
}

interface TileStyle {
  minHeight: string
  borderRadius: string
  backgroundColor: string
  backgroundImage: string
  backgroundSize: string
  backgroundRepeat: string
  backgroundPositionY: string
}

let ThemeButton = React.memo(({ tile }: ThemeButtonProps) => {
  const classes = useStyles();
  const { setBackground, background } = useContext(GlobalContext);
  const selected = !isNaN(+background) && tile.id === parseInt(background, 10);

  return (
    <Button
      size="small"
      variant={"outlined"}
      onClick={() => setBackground(tile.id.toString()) }
      className={selected ? classes.selectedButton : classes.notSelectedButton}
    >
      {selected ? (
        <Typography style={{ fontWeight: "bold" }}>Selected</Typography>
      ) : (
        <Typography>Select</Typography>
      )}
    </Button>
  );
});

const ThemeDialog = React.memo(({ close }: { close: () => void }) => {
  const classes = useStyles();
  const { themeColor } = useContext(GlobalContext);

  return (
    <DialogContainer fullScreen={true}>
      <>
        <DialogTitle onClose={close}>Themes</DialogTitle>
        <DialogContent dividers={true}>
          <div className={classes.root}>
            <Grid container spacing={3}>
              {themes.map((tile) => {
                const tileStyle: Partial<TileStyle> = {
                  minHeight: "200px",
                  borderRadius: "4px",
                };
                if (!tile.background) {
                  tileStyle.backgroundColor = tile.backgroundColor;
                } else {
                  tileStyle.backgroundImage = `url("${
                    backgrounds(tile.background)
                  }")`;
                  tileStyle.backgroundSize = "100% auto";
                  tileStyle.backgroundRepeat = "no-repeat";
                  tileStyle.backgroundPositionY = "50%";
                }
                return (
                  <Grid item xs={12} sm={6} md={4} lg={4} key={tile.id}>
                    <Grid container style={tileStyle} alignContent="flex-end">
                      <Grid item style={{ width: "100%" }}>
                        <Grid
                          container
                          style={{
                            padding: "8px",
                            background: `linear-gradient(to right, rgba(${themeColor.r}, ${themeColor.g}, ${themeColor.b}, 0.9) 0%, rgba(${themeColor.r}, ${themeColor.g}, ${themeColor.b}, 0.5) 100%)`,
                          }}
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Grid item>
                            <Grid container direction="column">
                              <Grid item>
                                <Typography style={{ fontWeight: "bold" }}>
                                  {tile.title}
                                </Typography>
                              </Grid>
                              <Grid item>
                                <Typography variant="body2">
                                  {tile.description}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid item>
                            <ThemeButton tile={tile} />
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={close} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </>
    </DialogContainer>
  );
});

export default ThemeDialog;
