import React, { useState, useCallback, useContext } from "react";
import Popover from "@material-ui/core/Popover";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { IconButton, ListItem, ListItemText, Typography } from "@material-ui/core";
import { MarqueeWindow } from '@vscode-marquee/utils';
import type { Workspace } from '@vscode-marquee/utils';

import WorkspaceContext from '../Context';

declare const window: MarqueeWindow;

let TodoItemPop = ({ workspace }: { workspace: Workspace }) => {
  const { openProjectInNewWindow, _removeWorkspace } = useContext(WorkspaceContext);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = useCallback((event) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? "todo-item-popover" : undefined;

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
        <ListItem
          button
          onClick={(e) => {
            e.preventDefault();
            _removeWorkspace(workspace.id);
            handleClose();
          }}
        >
          <ListItemText
            primary={<Typography variant="body2">Remove from List</Typography>}
          />
        </ListItem>
        <ListItem button onClick={(e) => {
          e.preventDefault();
          window.vscode.postMessage({
            west: { execCommands: [{
              command: "vscode.openFolder",
              args: [workspace.path],
              options: { forceNewWindow: openProjectInNewWindow }
            }],
          }});
        }}>
          <ListItemText
            primary={
              <Typography variant="body2">
                {`Open Workspace ${openProjectInNewWindow ? ' (in new Window)' : ''}`}
              </Typography>
            }
          />
        </ListItem>
      </Popover>
    </div>
  );
};

export default React.memo(TodoItemPop);
