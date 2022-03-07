import React from "react";
import { Grid, Button, Typography, IconButton } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { getEventListener, MarqueeEvents } from '@vscode-marquee/utils';

interface Props {
  name: string;
}

const HideWidgetContent = ({ name }: Props) => {
  const eventListener = getEventListener<MarqueeEvents>();
  const _open = () => {
    eventListener.emit("openSettings", {} as never);
  };

  const _removeModeWidget = (name: string) => {
    eventListener.emit("removeWidget", name);
  };

  return (
    <Grid container spacing={1} direction="column" alignItems="center">
      <Grid item>
        <Button
          size="small"
          variant="outlined"
          onClick={() => _removeModeWidget(name)}
        >
          Hide this widget
        </Button>
      </Grid>
      <Grid item>
        <Typography variant="caption">
          Can be undone in{" "}
          <IconButton size="small" onClick={_open}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Typography>
      </Grid>
    </Grid>
  );
};

export default React.memo(HideWidgetContent);
