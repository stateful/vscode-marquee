import React, { useState, useCallback, useContext } from "react";
import Popover from "@material-ui/core/Popover";
import { IconButton, Grid, Divider, Button } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { HideWidgetContent } from "@vscode-marquee/widget";

import TrickContext from '../Context';

const PopMenu = () => {
  const { read, _resetRead } = useContext(TrickContext);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? "hide-popover" : undefined;

  return (
    <div>
      <IconButton size="small" onClick={handleClick}>
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Grid container direction="column" style={{ minHeight: "80px", padding: "16px" }}>
          {read.length !== 0 ? (
            <>
              <Grid item>
                <Grid
                  container
                  direction="row"
                  spacing={2}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Grid item>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        _resetRead();
                        handleClose();
                      }}
                    >
                      Reset Read Notifications
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>&nbsp;</Grid>
              <Grid item>
                <Divider />
              </Grid>
              <Grid item>&nbsp;</Grid>
            </>
          ) : <></>}
          <Grid item>
            <HideWidgetContent name="welcome" />
          </Grid>
        </Grid>
      </Popover>
    </div>
  );
};

export default React.memo(PopMenu);
