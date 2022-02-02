import React, {
  useState,
  useContext,
} from "react";
import {
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@material-ui/core";

import { DialogContainer, DialogTitle } from "@vscode-marquee/dialog";
import { BetterComplete } from '@vscode-marquee/utils';

import SnippetEditor from "../components/Editor";
import SnippetContext from "../Context";

import { languages } from '../constants';
import { getHighlightLanguage } from "../utils";
import type { Snippet } from "../types";

interface SnippetEditDialogProps {
  close: () => void
  snippet: Snippet
}

const SnippetEditDialog = React.memo(({ close, snippet }: SnippetEditDialogProps) => {
  const { _updateSnippet, setSnippetSelected, _removeSnippet } = useContext(SnippetContext);

  const [title, setTitle] = useState(snippet.title);
  const [body, setBody] = useState(snippet.body);
  const [language, setLanguage] = useState(snippet.language);
  const [error, setError] = useState(false);

  return (
    <DialogContainer fullWidth={true} onClose={close}>
      <DialogTitle onClose={close}>{title}</DialogTitle>
      <DialogContent dividers={true}>
        <TextField
          fullWidth
          error={error}
          variant="filled"
          onChange={(e) => setTitle(e.target.value)}
          label="Title"
          name="title"
          autoFocus
          value={title}
        />
        <div style={{ height: "8px", minWidth: "100%" }} />
        <BetterComplete
          field="language"
          label="Syntax highlighting"
          options={languages}
          display="name"
          value={language}
          variant="filled"
          getOptionSelected={(option, value) =>  option.value === value.value}
          onChange={(e, v) => setLanguage(getHighlightLanguage(v))}
        />
        <div style={{ height: "8px", minWidth: "100%" }} />

        <SnippetEditor
          body={body}
          language={snippet.language}
          onChange={(body) => setBody(body)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={close} color="secondary">
          Close
        </Button>
        <Button variant="contained" color="secondary" onClick={() => _removeSnippet(snippet.id)}>
          Delete
        </Button>
        <Button color="primary" variant="contained" onClick={() => {
          if (title === "") {
            return setError(true);
          }

          _updateSnippet({ ...snippet, body, title, language });
          setSnippetSelected(snippet.id);
          close();
        }}>
          Save
        </Button>
      </DialogActions>
    </DialogContainer>
  );
});

export default SnippetEditDialog;
