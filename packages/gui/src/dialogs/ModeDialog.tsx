import React from "react";
import {
  DialogContent,
  DialogActions,
  Button,
} from "@material-ui/core";

import { DialogTitle, DialogContainer } from "@vscode-marquee/dialog";

import ModeDialogContent from "../components/ModeDialogContent";

const ModeDialog = React.memo(({ close }: { close: () => void }) => {
  return (
    <DialogContainer fullScreen={true} onClose={close}>
      <DialogTitle onClose={close}>Mode Configuration</DialogTitle>
      <DialogContent dividers={true} style={{ padding: 0, margin: 0 }}>
        <ModeDialogContent />
      </DialogContent>
      <DialogActions>
        <Button onClick={close} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </DialogContainer>
  );
});

export default ModeDialog;
