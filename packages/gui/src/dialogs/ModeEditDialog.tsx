import React, { useContext, useState, useMemo, useCallback, MouseEvent } from "react";
import {
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@material-ui/core";

import { DialogContainer, DialogTitle } from "@vscode-marquee/dialog";

import ModeContext from "../contexts/ModeContext";
import EmojiPop from "../components/EmojiPop";

interface ModeEditDialogProps {
  onClose: (event?: MouseEvent<HTMLButtonElement>) => void
  name: string
}

const ModeEditDialog = React.memo(({ onClose, name }: ModeEditDialogProps) => {
  const { modes, _duplicateMode } = useContext(ModeContext);
  const [modeName, setModeName] = useState(name);
  const [emoji, setEmoji] = useState(modes[name].icon);
  let modeNameInputRef: HTMLButtonElement | null = null;

  const error = useMemo(() => {
    return modeName === "";
  }, [modeName]);

  const updateMode = useCallback(() => {
    if (!error) {
      _duplicateMode(name, modeName, emoji!);
      onClose();
    } else {
      modeNameInputRef!.focus();
    }
  }, [name, modeName, emoji]);

  return (
    <DialogContainer fullWidth={true} onClose={onClose}>
      <DialogTitle onClose={onClose}>Duplicate Mode</DialogTitle>
      <DialogContent dividers={true}>
        <TextField
          inputProps={{ ref: (input: HTMLButtonElement) => (modeNameInputRef = input) }}
          error={error}
          fullWidth
          onChange={(e) => setModeName(e.target.value)}
          name="modeName"
          autoFocus
          value={modeName}
          label="Mode Name"
          onKeyDown={(e) => {
            if (e.keyCode === 13 && e.metaKey) {
              e.preventDefault();
              updateMode();
            }
          }}
        />
        <br /> <br />
        <div>
          <EmojiPop
            modeIcon={emoji}
            onSelect={(emoji) => {
              setEmoji(emoji);
            }}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => onClose()}
          variant="contained"
          color="secondary"
        >
          Close
        </Button>
        <Button
          onClick={() => updateMode()}
          variant="contained"
          color="primary"
        >
          Add
        </Button>
      </DialogActions>
    </DialogContainer>
  );
});

export { ModeEditDialog };
