import React, { useState, useCallback } from "react";
import { connect, ConnectedProps } from "react-redux";

import MoreVertIcon from "@material-ui/icons/MoreVert";
import {
  Typography,
  ListItem,
  ListItemText,
  Popover,
  IconButton,
} from "@material-ui/core";

import { resetModes } from '../redux/actions';

const mapDispatchToProps = { resetModes };
const connector = connect(null, mapDispatchToProps);

const ModeMorePop = connector(({ resetModes }: ConnectedProps<typeof connector>) => {
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
      <IconButton aria-label="More" size="small" onClick={handleClick}>
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
        <ListItem
          button
          onClick={() => {
            resetModes();
            handleClose();
          }}
        >
          <ListItemText
            primary={
              <Typography variant="body2">Reset to factory defaults</Typography>
            }
          />
        </ListItem>
      </Popover>
    </div>
  );
});

export default ModeMorePop;
