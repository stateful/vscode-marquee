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

import { SplitButton } from '@vscode-marquee/widget';
import { DialogContainer, DialogTitle } from "@vscode-marquee/dialog";
import { BetterComplete, MarqueeWindow } from '@vscode-marquee/utils';

import SnippetEditor from "../components/Editor";
import SnippetContext from "../Context";
import { languages } from '../constants';
import { getHighlightLanguage } from "../utils";
import type { Language } from '../types';

declare const window: MarqueeWindow;
const options = ['Add to Workspace', 'Add as Global Snippet'];

const SnippetAddDialog = React.memo(({ close }: { close: () => void }) => {
  const { _addSnippet, setSnippetSelected } = useContext(SnippetContext);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState(false);
  const [language, setLanguage] = useState<Language>({
    name: "markdown", value: "markdown"
  });

  const submit = (index: number) => {
    const isWorkspaceTodo = index === 0;
    if (title === "") {
      setError(true);
      return;
    }

    setSnippetSelected(
      _addSnippet({ title, body, language }, isWorkspaceTodo)
    );
    close();
  };

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

export default SnippetAddDialog;
