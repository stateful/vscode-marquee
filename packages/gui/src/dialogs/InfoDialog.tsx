import React, { useContext, useMemo } from "react";
import {
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Link,
  List,
  ListItem,
  ListSubheader,
  Divider,
  ListItemText,
} from "@material-ui/core";

import { GlobalContext } from "@vscode-marquee/utils";
import { DialogContainer, DialogTitle } from "@vscode-marquee/dialog";

// @ts-expect-error no types for imported png files
import google_icon_dark from "../img/powered_by_google_on_non_white.png";
// @ts-expect-error no types for imported png files
import google_icon_light from "../img/powered_by_google_on_white.png";

import { themes } from "../constants";

const InfoDialog = React.memo(({ close }: { close: () => void }) => {
  const { background } = useContext(GlobalContext);

  const theme = useMemo(() => {
    if (isNaN(+background)) {
      return { title: 'Unknown', author: 'Unknown' };
    }

    return themes.filter((theme) => {
      return theme.id === parseInt(background, 10);
    })[0];
  }, [background]);

  return (
    <DialogContainer fullWidth={true} onClose={close}>
      <DialogTitle onClose={close}>Marquee Extension</DialogTitle>
      <DialogContent dividers={true}>
        <List>
          <ListSubheader disableSticky>Theme</ListSubheader>
          <Divider />
          <ListItem>
            <ListItemText
              primary={
                <Typography variant="body2">
                  {theme.title} - contributed by {theme.author}
                </Typography>
              }
            />
          </ListItem>
          <ListSubheader disableSticky>Resources</ListSubheader>
          <Divider />
          <ListItem>
            <ListItemText
              primary={
                <Grid
                  container
                  direction="column"
                  style={{ height: "100%", width: "100%" }}
                >
                  <Grid item>
                    <Typography variant="body2">
                      <Link href="https://github.com/stateful/vscode-marquee">
                        GitHub Repository
                      </Link>
                      : Marquee GitHub Repository
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="body2">
                      <Link href="https://marquee.stateful.com">
                        Marquee Homepage
                      </Link>
                      : Additional resources about Marquee!
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="body2">
                      <Link href="https://discord.com/channels/878764303052865537/900787619728871484">
                        Discord Channel
                      </Link>
                      : Join our Discord channel for questions and feedback.
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="body2">
                      <Link href="https://gitter.im/vscode-marquee/community">
                        Gitter Channel
                      </Link>
                      : Join our Gitter community channel for questions and feedback.
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="body2">
                      <Link href="https://www.stateful.com/privacy">
                        Privacy Policy
                      </Link>
                      : Our official commitments about data usage and privacy.
                    </Typography>
                  </Grid>
                </Grid>
              }
            />
          </ListItem>
          <ListSubheader disableSticky>Attribution</ListSubheader>
          <Divider />
          <ListItem>
            <ListItemText
              primary={
                <Grid container direction="row" justifyContent="flex-start">
                  <Grid item xs={4}>
                    {document.body.classList[0] === "vscode-light" ? (
                      <img
                        style={{ height: "14px" }}
                        src={google_icon_light}
                        alt="Powered by Google"
                      />
                    ) : (
                      <img
                        style={{ height: "14px" }}
                        src={google_icon_dark}
                        alt="Powered by Google"
                      />
                    )}
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      For the Google Geolocation APIs backing Marquee.
                    </Typography>
                  </Grid>
                </Grid>
              }
            />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </DialogContainer>
  );
});

export default InfoDialog;
