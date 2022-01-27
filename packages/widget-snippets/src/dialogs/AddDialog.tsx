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
import type { Language } from '../types';

const SnippetAddDialog = React.memo(({ close }: { close: () => void }) => {
  const {
    _addSnippet,
    _updateSnippetSelected
  } = useContext(SnippetContext);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [language, setLanguage] = useState<Language>({
    name: "markdown",
    value: "markdown",
  });
  const [error, setError] = useState(false);

  return (
    <DialogContainer fullWidth={true} onClose={close}>
      <DialogTitle onClose={close}>{title || 'Add Snippet'}</DialogTitle>
      <DialogContent dividers={true}>
        <TextField
          aria-label="Snippet Title"
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
          getOptionSelected={
            (option, value) => option.value === value.value
          }
          onChange={(_, v) => setLanguage(getHighlightLanguage(v))}
        />
        <div style={{ height: "8px", minWidth: "100%" }} />
        <SnippetEditor body={body} language={language} onChange={(body) => setBody(body)} />
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

            _addSnippet({ title, body, language }, _updateSnippetSelected);
            close();
          }}>
          Save
        </Button>
      </DialogActions>
    </DialogContainer>
  );
});

export default SnippetAddDialog;
