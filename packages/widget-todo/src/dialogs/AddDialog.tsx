import React, { useContext, useState } from "react";
import {
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@material-ui/core";
import ChipInput from "material-ui-chip-input";

import { DialogTitle, DialogContainer } from "@vscode-marquee/dialog";

import TodoContext from "../Context";

const TodoAddDialog = React.memo(({ close }: { close: () => void }) => {
  const { _addTodo } = useContext(TodoContext);
  const [error, setError] = useState(false);
  const [body, setBody] = useState("");
  const [tags, setTags] = useState([] as string[]);

  return (
    <DialogContainer fullWidth={true} onClose={close}>
      <DialogTitle onClose={close}>Add Todo</DialogTitle>
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
          placeholder="Type your todo..."
          onKeyDown={(e) => {
            if (e.keyCode === 13 && e.metaKey) {
              e.preventDefault();
              _addTodo(body);
              close();
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
      <DialogActions>
        <Button onClick={close} color="secondary">
          Close
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={() => {
            if (body !== "") {
              _addTodo(body, tags);
            } else {
              setError(true);
              return;
            }

            close();
          }}
        >
          Add
        </Button>
      </DialogActions>
    </DialogContainer>
  );
});

export default TodoAddDialog;
