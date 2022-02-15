import React, { useState } from "react";
import SettingsIcon from "@material-ui/icons/Settings";
import { Grid, Button, Typography, IconButton } from "@material-ui/core";
import { connect } from "react-redux";

import { removeModeWidget } from "../redux/actions";
import SettingsDialog from "../dialogs/SettingsDialog";

interface HideWidgetContentProp {
  name: string
}

const mapStateToProps = (state: never, ownProps: HideWidgetContentProp) => (ownProps);
const mapDispatchToProps = { removeModeWidget };
type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const HideWidgetContent = ({ name, removeModeWidget }: Props) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <Grid container spacing={1} direction="column" alignItems="center">
      <Grid item>
        <Button
          size="small"
          variant="outlined"
          onClick={() => removeModeWidget(name) }
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

export default connect()(React.memo(HideWidgetContent));
