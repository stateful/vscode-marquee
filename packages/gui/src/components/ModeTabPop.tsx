import React, { useState, useCallback } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Typography, ListItem, ListItemText, Popover } from "@material-ui/core";

import { ModeEditDialog } from "../dialogs/ModeEditDialog";
import { presetModes } from '../constants';
import { removeMode } from '../redux/actions';

interface ModeTabPopProps {
  name: string
  children: React.ReactElement
}

const mapStateToProps = (state: never, ownProps: ModeTabPopProps) => ownProps;
const mapDispatchToProps = { removeMode };
const connector = connect(mapStateToProps, mapDispatchToProps);

const ModeTabPop = ({ name, children, removeMode }: ConnectedProps<typeof connector>) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showModeTab, SetShowModeTab] = useState(false);

  const handleRightClick = useCallback((e) => {
    //if this isn't one of the preset modes
    if (!presetModes.includes(name)) {
      setAnchorEl(e.currentTarget);
    }
  }, [name]);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleDelete = useCallback(
    () => removeMode(name),
    [name]
  );

  const open = Boolean(anchorEl);
  const id = open ? "project-item-popover" : undefined;

  return (
    <>
      {showModeTab && (
        <ModeEditDialog name={name} />
      )}
      <div style={{ width: "100%" }} onContextMenu={handleRightClick}>
        {children}
      </div>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <ListItem
          button
          onClick={() => {
            SetShowModeTab(true);
            handleClose();
          }}
        >
          <ListItemText
            primary={<Typography variant="body2">Copy to new</Typography>}
          />
        </ListItem>
        <ListItem
          button
          onClick={() => {
            handleDelete();
            handleClose();
          }}
        >
          <ListItemText
            primary={<Typography variant="body2">Delete</Typography>}
          />
        </ListItem>
      </Popover>
    </>
  );
};

export default connector(React.memo(ModeTabPop));
