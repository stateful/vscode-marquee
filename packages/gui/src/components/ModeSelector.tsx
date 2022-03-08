import React, { useContext, MouseEvent, useState, useRef } from "react";

import SettingsIcon from "@mui/icons-material/Settings";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckIcon from "@mui/icons-material/Check";
import { IconButton } from "@mui/material";
import { Emoji } from "emoji-mart";
import {
  Popper,
  Grow,
  Paper,
  Button,
  Grid,
  ButtonGroup,
  ListItemIcon,
  Typography,
  ListItem,
  ListItemText,
  List,
  ListItemSecondaryAction,
  Divider,
  ClickAwayListener,
} from "@mui/material";

import ModeContext from "../contexts/ModeContext";
import ModeDialog from "../dialogs/ModeDialog";
import { ucFirst } from "../utils";

const DenseListIcon = ({ children }: { children: React.ElementRef<any>[] }) => {
  return (
    <ListItemIcon style={{ minWidth: "36px", margin: "0px" }}>
      {children}
    </ListItemIcon>
  );
};

const ModeSelector = () => {
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [showModeDialog, setShowModeDialog] = useState(false);
  const { modeName, _setModeName, prevMode, modes } = useContext(ModeContext);
  const anchorRef = useRef(null);
  const mode = modes[modeName];

  const setModeName = (newMode: string) => {
    /**
     * switching modes is a very costly operation, let's ensure we
     * debounce this operation to avoid running into signal loops
     */
    setDisabled(true);
    setTimeout(() => setDisabled(false), 1000);
    _setModeName(newMode);
  };

  const handleClick = () => {
    setDisabled(true);
    setTimeout(() => setDisabled(false), 1000);

    //if there was a previous mode, switch to that
    if (prevMode) {
      setModeName(prevMode);
      return;
    }

    //if there was no previous mode
    //find the next mode and go there
    //if that doesn't exist, goto default 0
    let modesArr = Object.keys(modes);
    let currModeIndex = modesArr.indexOf(modeName);
    return modesArr[currModeIndex + 1]
      ? setModeName(modesArr[currModeIndex + 1])
      : setModeName(modesArr[0]);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  return (
    <div>
      {showModeDialog && <ModeDialog close={() => setShowModeDialog(false)} />}
      <ButtonGroup variant="text" ref={anchorRef} aria-label="split button">
        <Button
          aria-label="Set Mode"
          onClick={handleClick}
          size="small"
          disabled={disabled}
        >
          {!mode.icon && (
            <ViewCompactIcon fontSize="small" className="modeIcon" />
          )}
          {mode.icon && <Emoji emoji={mode.icon} size={16} />}
        </Button>
        <Button
          disabled={disabled}
          size="small"
          aria-controls={open ? "split-button-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener
                onClickAway={(event) => {
                  const targetClassList =
                    // @ts-expect-error parentNode not defined
                    event.target.parentNode.classList.value;
                  if (
                    (anchorRef.current &&
                      // @ts-expect-error parentNode not defined
                      anchorRef.current.contains(event.target)) ||
                    targetClassList.indexOf("modeIcon") !== -1 ||
                    targetClassList.indexOf("emoji-mart-emoji") !== -1
                  ) {
                    return;
                  }

                  setOpen(false);
                }}
              >
                <Grid
                  container
                  style={{ padding: "8px", minWidth: "200px" }}
                  direction="column"
                >
                  <Grid item>
                    <Grid
                      container
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid item>Modes</Grid>
                      <Grid item>
                        <IconButton
                          aria-label="Open Mode Dialog"
                          size="small"
                          onClick={() => setShowModeDialog(true)}
                        >
                          <SettingsIcon fontSize="small" />
                        </IconButton>
                      </Grid>
                    </Grid>
                    <Grid item style={{ paddingTop: "4px" }}>
                      <Divider />
                    </Grid>
                    <Grid item>
                      <List component="nav" dense>
                        {modes &&
                          Object.keys(modes).map((name) => {
                            return (
                              <ListItem
                                button
                                key={name}
                                onClick={() => {
                                  setModeName(name);
                                  handleToggle();
                                }}
                              >
                                <DenseListIcon>
                                  {modes[name].icon && (
                                    <Emoji
                                      emoji={modes[name].icon!}
                                      size={16}
                                    />
                                  )}
                                  {!modes[name].icon && (
                                    <ViewCompactIcon fontSize="small" />
                                  )}
                                </DenseListIcon>
                                <ListItemText
                                  primary={
                                    <Typography variant="body2">
                                      {ucFirst(name)}
                                    </Typography>
                                  }
                                />
                                {name === modeName && (
                                  <ListItemSecondaryAction>
                                    <CheckIcon fontSize="small" />
                                  </ListItemSecondaryAction>
                                )}
                              </ListItem>
                            );
                          })}
                      </List>
                    </Grid>
                  </Grid>
                </Grid>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  );
};

export default ModeSelector;
