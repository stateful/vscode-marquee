import React, { useContext, useState, useCallback } from "react";
import {
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@material-ui/core";
import { DialogContainer, DialogTitle } from "@vscode-marquee/dialog";
import { jumpTo, theme } from '@vscode-marquee/utils';

import ChipInput from "material-ui-chip-input";
import LinkIcon from "@material-ui/icons/Link";

import TodoContext from "../Context";
import type { Todo } from '../types';

interface TodoEditDialogParams {
  close: () => void
  todo: Todo
}

const TodoEditDialog = React.memo(({ close, todo }: TodoEditDialogParams) => {
  const { _updateTodo } = useContext(TodoContext);

  let [error, setError] = useState(false);
  let [body, setBody] = useState(todo.body);
  let [tags, setTags] = useState(todo.tags);

  let saveTodo = useCallback(() => {
    if (body === "") {
      return setError(true);
    }
    _updateTodo({ ...todo, body, tags });
    close();
  }, [todo, body, tags]);

  return (
    <DialogContainer fullWidth={true} onClose={close}>
      <DialogTitle onClose={close}>
        Edit Todo &nbsp; &nbsp;
        {todo && todo.path && (
          <Button
            size="small"
            startIcon={<LinkIcon />}
            disableFocusRipple
            onClick={() => {
              jumpTo(todo);
              if (close) {
                close();
              }
            }}
          >
            {todo.path.split("/").reverse()[0].toUpperCase()}
          </Button>
        )}
      </DialogTitle>
      <DialogContent dividers={true}>
        <TextField
          error={error}
          fullWidth
          variant="filled"
          onChange={(e) => {
            setBody(e.target.value);
          }}
          name="body"
          multiline
          minRows={5}
          maxRows={8}
          autoFocus
          value={body}
          placeholder="Type your todo..."
          onKeyDown={async (e) => {
            if (e.keyCode === 13 && e.metaKey) {
              saveTodo();
            }
          }}
        />
        <div style={{ height: "8px", minWidth: "100%" }} />
        <ChipInput
          newChipKeyCodes={[13, 9]}
          blurBehavior="add"
          fullWidth
          label="Add some tags!"
          // helperText="Can be used in filtering."
          variant="filled"
          value={tags}
          onAdd={(tag) => {
            setTags([...tags, tag]);
          }}
          onDelete={(chip, index) => {
            const newTags = [...tags];
            newTags.splice(index, 1);
            setTags(newTags);
          }}
        />
      </DialogContent>
      <DialogActions style={{ paddingRight: theme.spacing(3) }}>
        <Button onClick={close} color="secondary">
          Close
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={() => {
            if (body === "") {
              return setError(true);
            }

            saveTodo();
            close();
          }}
        >
          Save
        </Button>
      </DialogActions>
    </DialogContainer>
  );
});

export default TodoEditDialog;
