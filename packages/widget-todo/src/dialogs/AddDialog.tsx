import React, { useContext, useState } from "react";
import {
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@material-ui/core";
import ChipInputOld from "material-ui-chip-input";

import { theme, MarqueeWindow } from "@vscode-marquee/utils";
import { SplitButton } from "@vscode-marquee/widget";
import { DialogTitle, DialogContainer } from "@vscode-marquee/dialog";

import TodoContext from "../Context";
import ChipInput from "../components/ChipInput";

declare const window: MarqueeWindow;
const options = ['Add to Workspace', 'Add as Global Todo'];

const TodoAddDialog = React.memo(({ close }: { close: () => void }) => {
  const { _addTodo } = useContext(TodoContext);
  const [error, setError] = useState(false);
  const [body, setBody] = useState("");
  const [tags, setTags] = useState([] as string[]);

  const submit = (index: number) => {
    const isWorkspaceTodo = index === 0;
    if (body !== "") {
      _addTodo(body, tags, isWorkspaceTodo);
    } else {
      setError(true);
      return;
    }

    close();
  };

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
              _addTodo(body, tags, true);
              close();
            }
          }}
        />
        <div style={{ height: "8px", minWidth: "100%" }} />
        <ChipInput
          fullWidth
          label="Add some tags!"
          variant="filled"
          value={tags}
          onChange={tags => setTags(tags)}
        />
        <ChipInputOld
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
        {window.activeWorkspace
          ? <SplitButton
              options={options}
              onClick={submit}
            />
          : <Button
              color="primary"
              variant="contained"
              onClick={() => submit(1)}
            >
              {options[1]}
            </Button>
        }

      </DialogActions>
    </DialogContainer>
  );
});

export default TodoAddDialog;
