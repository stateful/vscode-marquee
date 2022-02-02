import React, { useContext, useCallback, useMemo } from "react";
import { GlobalContext, jumpTo } from "@vscode-marquee/utils";
import {
  Typography,
  ListItem,
  ListItemText,
  List,
} from "@material-ui/core";

import TodoContext from "../Context";
import type { Todo } from '../types';

interface TodoPopItemContentPayload {
  todo: Todo
  close: () => void
}

const TodoPopItemContent = ({ todo, close }: TodoPopItemContentPayload) => {
  const { activeWorkspace } = useContext(GlobalContext);
  const { _updateTodo, _removeTodo, setShowEditDialog } = useContext(TodoContext);

  const moveToCurrentWorkspace = useCallback(() => {
    if (!activeWorkspace || !activeWorkspace.id) {
      return;
    }

    let updatedTodo = todo;
    updatedTodo.workspaceId = activeWorkspace.id;
    _updateTodo(updatedTodo);
  }, [todo, activeWorkspace]);

  const matchingWorkspace = useMemo(() => {
    let found = false;
    if (!activeWorkspace) {
      found = true;
    }
    if (activeWorkspace && activeWorkspace.id) {
      if (todo && todo.workspaceId) {
        if (activeWorkspace.id === todo.workspaceId) {
          found = true;
        }
      }
    }
    return found;
  }, [activeWorkspace, todo]);

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

      {todo && todo.exists && (
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
