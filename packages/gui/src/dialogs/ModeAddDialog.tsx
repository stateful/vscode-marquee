import React, { useContext, useState, useMemo } from "react";
import {
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@material-ui/core";
import type { EmojiData } from "emoji-mart";

import { DialogTitle, DialogContainer } from "@vscode-marquee/dialog";
import EmojiPop from "../components/EmojiPop";
import ModeContext from "../contexts/ModeContext";

const ModeAddDialog = React.memo(({ close }: { close: () => void }) => {
  const [modeName, setModeName] = useState("");
  const { _addMode } = useContext(ModeContext);
  const [emoji, setEmoji] = useState(null as (EmojiData | null));
  let modeNameInputRef: HTMLButtonElement | null = null;

  const error = useMemo(() => {
    return modeName === "";
  }, [modeName]);

  const addMode = () => {
    if (!error) {
      _addMode(modeName, emoji!);
      close();
    } else {
      modeNameInputRef!.focus();
    }
  };

  return (
    <DialogContainer fullWidth={true} onClose={close}>
      <DialogTitle onClose={close}>Add Mode</DialogTitle>
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
              addMode();
            }
          }}
        />
        <br /> <br />
        <div>
          <EmojiPop
            modeIcon={emoji!}
            onSelect={(emoji) => setEmoji(emoji)}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => addMode()}
          variant="contained"
          color="primary"
        >
          Add
        </Button>
      </DialogActions>
    </DialogContainer>
  );
});

export default ModeAddDialog;
