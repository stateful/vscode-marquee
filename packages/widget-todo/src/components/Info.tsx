import React, { useContext, useState, useMemo, useCallback } from "react";
import Popover from "@material-ui/core/Popover";
import {
  IconButton,
  Grid,
  Divider,
  Button,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";


import TodoContext from "../Context";
import type { Todo } from '../types';

let Totals = () => {
  const { todos } = useContext(TodoContext);
  const archived = useMemo(() => {
    return todos.filter((item) => {
      return item.archived === true;
    });
  }, [todos]);

  const filterArchived = (item: Todo) => {
    return item.archived === false;
  };

  const checked = useMemo(() => {
    return todos.filter(filterArchived).filter((item) => {
      return item.checked === true;
    });
  }, [todos]);

  const unchecked = useMemo(() => {
    return todos.filter(filterArchived).filter((item) => {
      return item.checked === false;
    });
  }, [todos]);

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item>Open: {unchecked.length}</Grid>
      <Grid item>Closed: {checked.length}</Grid>
      <Grid item>Archived: {archived.length}</Grid>
      <Grid item>
        <Divider />
      </Grid>
      <Grid item>Total: {todos.length}</Grid>
    </Grid>
  );
};

let ResetBox = React.memo(() => {
  const { _resetTodos } = useContext(TodoContext);

  return (
    <Grid container direction="column" alignItems="center">
      <Grid item>
        <Button
          size="small"
          variant="contained"
          color="secondary"
          onClick={() => {
            _resetTodos();
          }}
        >
          Delete all todos
        </Button>
      </Grid>
    </Grid>
  );
});

let TodoInfo = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? "todo-info-popover" : undefined;

  return (
    <div>
      <IconButton aria-label="Open Todo Info" size="small" onClick={handleClick}>
        <ExpandMoreIcon fontSize="small" />
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
        <Grid container style={{ padding: "16px" }} direction="column">
          <Grid item>
            <Totals />
          </Grid>
          <Grid item>&nbsp;</Grid>
          <Grid item>
            <ResetBox />
          </Grid>
        </Grid>
      </Popover>
    </div>
  );
};

export default React.memo(TodoInfo);
