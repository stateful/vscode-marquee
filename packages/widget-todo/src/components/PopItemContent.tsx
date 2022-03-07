import React, { useContext, useCallback, useMemo } from "react";
import { jumpTo, MarqueeWindow } from "@vscode-marquee/utils";
import {
  Typography,
  ListItem,
  ListItemText,
  List,
} from "@mui/material";

import TodoContext from "../Context";
import type { Todo } from '../types';

declare const window: MarqueeWindow;

interface TodoPopItemContentPayload {
  todo: Todo
  close: () => void
}

const TodoPopItemContent = ({ todo, close }: TodoPopItemContentPayload) => {
  const { _updateTodo, _removeTodo, setShowEditDialog } = useContext(TodoContext);

  const moveToCurrentWorkspace = useCallback(() => {
    if (!window.activeWorkspace || !window.activeWorkspace.id) {
      return;
    }

    const updatedTodo = todo;
    updatedTodo.workspaceId = window.activeWorkspace.id;
    _updateTodo(updatedTodo);
  }, [todo]);

  const moveToGlobalWorkspace = useCallback(() => {
    let updatedTodo = todo;
    updatedTodo.workspaceId = null;
    _updateTodo(updatedTodo);
  }, [todo]);

  const matchingWorkspace = useMemo(() => {
    let found = false;
    if (!window.activeWorkspace) {
      found = true;
    }
    if (
      window.activeWorkspace && window.activeWorkspace.id &&
      todo && todo.workspaceId &&
      window.activeWorkspace.id === todo.workspaceId
    ) {
      found = true;
    }
    return found;
  }, [todo]);

  return (
    <List component="nav" dense>
      <ListItem
        button
        onClick={() => {
          setShowEditDialog(todo.id);
          close();
        }}
      >
        <ListItemText primary={<Typography variant="body2">Edit</Typography>} />
      </ListItem>

      {todo && todo.origin && (
        <ListItem
          button
          onClick={() => {
            jumpTo(todo);
            close();
          }}
        >
          <ListItemText
            primary={<Typography variant="body2">Jump to origin</Typography>}
          />
        </ListItem>
      )}

      {!matchingWorkspace && (
        <ListItem
          button
          onClick={() => {
            moveToCurrentWorkspace();
            close();
          }}
        >
          <ListItemText
            primary={
              <Typography variant="body2">Move to current workspace</Typography>
            }
          />
        </ListItem>
      )}

      {matchingWorkspace && (
        <ListItem
          button
          onClick={() => {
            moveToGlobalWorkspace();
            close();
          }}
        >
          <ListItemText
            primary={
              <Typography variant="body2">Make a Global Todo</Typography>
            }
          />
        </ListItem>
      )}

      {!todo.archived && (
        <ListItem
          button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            let newTodo = todo;
            newTodo.archived = true;
            _updateTodo(newTodo);
            close();
            return true;
          }}
        >
          <ListItemText
            primary={<Typography variant="body2">Archive</Typography>}
          />
        </ListItem>
      )}

      {todo.archived && (
        <>
          <ListItem
            button
            onClick={() => {
              let newTodo = todo;
              newTodo.archived = false;
              _updateTodo(newTodo);
              close();
            }}
          >
            <ListItemText
              primary={<Typography variant="body2">Unarchive</Typography>}
            />
          </ListItem>
          <ListItem
            button
            onClick={() => {
              _removeTodo(todo.id);
              close();
            }}
          >
            <ListItemText
              primary={
                <Typography variant="body2">Delete permanently</Typography>
              }
            />
          </ListItem>
        </>
      )}
    </List>
  );
};

export default TodoPopItemContent;
