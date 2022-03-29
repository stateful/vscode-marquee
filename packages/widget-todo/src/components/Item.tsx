import React, { useContext, useState, useCallback } from "react";

import DragHandleIcon from "@material-ui/icons/DragHandle";
import Chip from "@material-ui/core/Chip";
import LinkIcon from "@material-ui/icons/Link";
import Tooltip from "@material-ui/core/Tooltip";
import {
  Grid,
  Checkbox,
  IconButton,
  Typography,
  Popover,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { jumpTo } from '@vscode-marquee/utils';
import TodoItemPop from "./ItemPop";
import TodoPopItemContent from "./PopItemContent";

import TodoContext from "../Context";
import type { Todo } from '../types';

const useStyles = makeStyles(() => ({
  customTooltip: {
    borderRadius: "4px",
  },
}));

interface TodoItemProps {
  todo: Todo
  isDragged: boolean
  dragProps: any
}

const TodoItem = ({ todo, isDragged, dragProps }: TodoItemProps) => {
  const classes = useStyles();
  const { _updateTodo, setShowEditDialog } = useContext(TodoContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const id = open ? "todo-item-popover" : undefined;

  const handleRightClick = useCallback((e) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  return (
    <>
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
        <TodoPopItemContent todo={todo} close={handleClose} />
      </Popover>
      <Grid
        {...dragProps}
        aria-label="todo-item"
        container
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        key={todo.id}
        wrap="nowrap"
        spacing={1}
        onContextMenu={handleRightClick}
      >
        <Grid item xs style={{ margin: "4px" }}>
          <Grid
            container
            direction="row"
            alignItems="center"
            justifyContent="space-around"
            wrap="nowrap"
          >
            <Grid item>
              <IconButton
                size="small"
                data-movable-handle
                tabIndex={-1}
                style={{
                  cursor: isDragged ? "grabbing" : "grab",
                }}
              >
                <DragHandleIcon fontSize="small" />
              </IconButton>
            </Grid>
            <Grid item>
              <Checkbox
                aria-label="Complete Todo"
                style={{ padding: "4px" }}
                size="small"
                disableRipple
                checked={todo.checked}
                onClick={(e) => {
                  let newTodo = todo;
                  newTodo.checked = !todo.checked;
                  _updateTodo(newTodo);
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          xs={9}
          style={{ cursor: "pointer", margin: "4px" }}
          onClick={(e) => {
            if (e.detail === 2) {
              setShowEditDialog(todo.id);
            }
            e.preventDefault();
            e.stopPropagation();
          }}
          zeroMinWidth
        >
          <Grid container direction="column" wrap="nowrap">
            <Grid item zeroMinWidth xs={12}>
              <Tooltip
                title={
                  <Typography variant="subtitle2">{todo.body}</Typography>
                }
                classes={{
                  tooltip: classes.customTooltip,
                }}
                placement="top"
                arrow
              >
                <Typography aria-label="todo-label" variant="body2" noWrap>
                  {todo.body}
                </Typography>
              </Tooltip>
            </Grid>
            {todo.tags && (
              <Grid item xs={12}>
                {todo.tags.map((tag) => (
                  <Chip
                    key={`tag-${tag}`}
                    style={{
                      borderRadius: "4px",
                      margin: "2px",
                    }}
                    size="small"
                    label={<Typography variant="caption">{tag}</Typography>}
                    variant="outlined"
                  />
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
        {todo.origin && (
          <Grid item xs>
            <Tooltip
              title={<Typography variant="subtitle2">{todo.path}</Typography>}
              classes={{ tooltip: classes.customTooltip }}
              placement="top"
              arrow
            >
              <Typography variant="body2" noWrap>
                <IconButton aria-label="todo-link" size="small" tabIndex={-1} onClick={() => jumpTo(todo)}>
                  <LinkIcon />
                </IconButton>
              </Typography>
            </Tooltip>
          </Grid>
        )}
        <Grid item xs style={{ margin: "4px" }}>
          <TodoItemPop todo={todo} />
        </Grid>
      </Grid>
    </>
  );
};

export default React.memo(TodoItem);
