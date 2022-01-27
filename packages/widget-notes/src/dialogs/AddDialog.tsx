import React, { useContext, useState } from "react";
import {
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@material-ui/core";
import { DialogTitle, DialogContainer } from "@vscode-marquee/dialog";

import NoteContext from "../Context";
import NoteEditor from "../components/Editor";

const AddDialog = React.memo(({ close }: { close: () => void }) => {
  const { _addNote, _updateNoteSelected } = useContext(NoteContext);
  const [error, setError] = useState(false);
  const [body, setBody] = useState("");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");

  return (
    <DialogContainer fullWidth={true} onClose={close}>
      <DialogTitle onClose={close}>{title || 'Add Note'}</DialogTitle>
      <DialogContent dividers={true}>
        <TextField
          error={error}
          fullWidth
          variant="filled"
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          name="title"
          autoFocus
          value={title}
          label="Title"
          placeholder="Title of Note"
          aria-labelledby="Title"
        />
        <div style={{ height: "8px", minWidth: "100%" }} />

        <NoteEditor
          border="1px solid var(--vscode-foreground)"
          name="add"
          _change={(newBody, newText) => {
            setBody(newBody);
            setText(newText);
          }}
          body={body}
          text={text}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={close} color="secondary">
          Close
        </Button>
        <Button color="primary" variant="contained" onClick={() => {
            if (title === "") {
              setError(true);
              return;
            }

            _addNote({ title, body, text }, _updateNoteSelected);
            close();
          }}>
          Add
        </Button>
      </DialogActions>
    </DialogContainer>
  );
});

export default AddDialog;
