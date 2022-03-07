import React, { useState, useContext, useCallback } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ModeContext from "../contexts/ModeContext";
import {
  Typography,
  ListItem,
  ListItemText,
  Popover,
  IconButton,
} from "@mui/material";

const ModeMorePop = () => {
  const { _resetModes } = useContext(ModeContext);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleReset = () => {
    _resetModes();
  };

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
            handleReset();
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
};

export default ModeMorePop;
