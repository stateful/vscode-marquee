import React, { useContext, useState, useCallback } from "react";

import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import Popover from "@mui/material/Popover";
import { IconButton, Grid, TextField, Badge } from "@mui/material";
import { DebounceInput } from "react-debounce-input";

import TodoContext from "../Context";

let TodoFilterBox = () => {
  const { setTodoFilter, todoFilter } = useContext(TodoContext);
  let filterInput: HTMLInputElement | null = null;

  return (
    <DebounceInput
      autoFocus
      inputProps={{ ref: (input: HTMLInputElement) => (filterInput = input) }}
      element={TextField}
      minLength={2}
      debounceTimeout={500}
      InputLabelProps={{
        shrink: true,
      }}
      label={"Filter"}
      variant="filled"
      placeholder="Type here..."
      onChange={(e) => setTodoFilter(e.target.value)}
      // margin="none"
      size="small"
      aria-label="todo-filter"
      name="todo-filter"
      value={todoFilter}
      InputProps={{
        endAdornment: (
          <ClearIcon
            fontSize="small"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setTodoFilter("");
              filterInput!.focus();
            }}
          />
        ),
      }}
    />
  );
};

let TodoFilter = () => {
  const { todoFilter } = useContext(TodoContext);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? "todo-filter-popover" : undefined;

  return (
    <div>
      <IconButton aria-label="todo-filter" size="small" onClick={handleClick}>
        <Badge
          color="secondary"
          variant="dot"
          overlap="circular"
          badgeContent={Boolean(todoFilter?.length)}
        >
          <SearchIcon fontSize="small" />
        </Badge>
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
        <Grid container>
          <Grid item>
            <TodoFilterBox />
          </Grid>
        </Grid>
      </Popover>
    </div>
  );
};

export default React.memo(TodoFilter);
