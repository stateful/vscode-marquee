import React, { useContext, useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import { Grid, Button, Typography, IconButton } from "@mui/material";

import ModeContext from "../contexts/ModeContext";
import SettingsDialog from "../dialogs/SettingsDialog";

interface HideWidgetContentProp {
  name: string
}

const HideWidgetContent = ({ name }: HideWidgetContentProp) => {
  const { _removeModeWidget } = useContext(ModeContext);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <Grid container spacing={1} direction="column" alignItems="center">
      <Grid item>
        <Button
          size="small"
          variant="outlined"
          onClick={() => _removeModeWidget(name) }
        >
          Hide this widget
        </Button>
      </Grid>
      <Grid item>
        <Typography variant="caption">
          Can be undone in <IconButton size="small" onClick={() => setShowSettings(true)}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Typography>
        {showSettings && <SettingsDialog close={() => setShowSettings(false)} />}
      </Grid>
    </Grid>
  );
};

export default React.memo(HideWidgetContent);
