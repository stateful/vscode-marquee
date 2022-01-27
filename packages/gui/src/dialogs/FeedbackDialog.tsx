import React, {
  useState,
  useRef,
  useCallback,
} from "react";
import {
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  InputAdornment,
  Typography,
  Divider,
} from "@material-ui/core";
import EmailIcon from "@material-ui/icons/Email";
import validator from "email-validator";

import { DialogContainer, DialogTitle } from "@vscode-marquee/dialog";

import { sendFeedbackRequest } from '../utils';

const FeedbackDialog = React.memo(({ close }: { close: () => void }) => {
  const [sentError, setSentError] = useState<Error | undefined>();
  const [msgError, setMsgError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [body, setBody] = useState("");
  const [email, setEmail] = useState("");
  const [sendingData, isSendingData] = useState(false);
  const msgInput = useRef();

  const sendFeedback = useCallback(() => {
    if (msgError) {
      // @ts-expect-error no definition of `current`
      msgInput.current.focus();
      return;
    }
    if (emailError) {
      return;
    }
    if (!body) {
      return setMsgError(true);
    }
    if (!email) {
      return setEmailError(true);
    }

    isSendingData(true);
    sendFeedbackRequest(body, email).then(
      () => {
        isSendingData(false);
        setSentError(undefined);
        close();
      },
      (err: Error) => {
        setSentError(err);
        isSendingData(false);
      }
    );
  }, [body, email]);

  const emailChange = useCallback((e) => {
    if (e.target.value !== "") {
      if (!validator.validate(e.target.value)) {
        setEmailError(true);
      } else {
        setEmailError(false);
      }
    } else {
      setEmailError(false);
    }
    setEmail(e.target.value);
  }, []);

  const msgChange = useCallback((e) => {
    if (e.target.value === "") {
      setMsgError(true);
    } else {
      setMsgError(false);
    }
    setBody(e.target.value);
  }, []);

  return (
    <DialogContainer fullWidth={true} onClose={close}>
      <DialogTitle onClose={close}>Feedback</DialogTitle>
      {sentError && (
        <>
          <DialogContent dividers={true}>
            <Grid container direction="column">
              <Grid item>
                <Typography variant="subtitle1">
                  {sentError.message}
                  <br />
                  Please try again later or send an email to <a href="mailto: info@stateful.com">info@stateful.com</a>!
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={close} variant="contained" color="primary">
              Close
            </Button>
          </DialogActions>
        </>
      )}
      {!sentError && (
        <>
          <DialogContent dividers={true}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <Typography variant="subtitle1">Send us a quick note</Typography>
                <Divider />
                <br />
                <TextField
                  inputRef={msgInput}
                  error={msgError}
                  fullWidth
                  variant="filled"
                  onChange={msgChange}
                  onKeyDown={async (e) => {
                    if (e.keyCode === 13 && e.metaKey) {
                      sendFeedback();
                    }
                  }}
                  name="body"
                  multiline
                  minRows={6}
                  maxRows={8}
                  autoFocus
                  label="We're excited to hear your thoughts"
                  placeholder="Feedback here..."
                  value={body}
                />
              </Grid>
              <Grid item>
                <TextField
                  error={emailError}
                  fullWidth
                  variant="filled"
                  onChange={emailChange}
                  onKeyDown={async (e) => {
                    if (e.keyCode === 13 && e.metaKey) {
                      sendFeedback();
                    }
                  }}
                  name="email"
                  label="Let's keep in touch (optional)"
                  placeholder="you@you.com"
                  value={email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item>
                <br />
                <br />
                <br />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button disabled={sendingData} onClick={sendFeedback} variant="contained" color="primary">
              {sendingData ? 'Sending Feedback...' : 'Send'}
            </Button>
          </DialogActions>
        </>
      )}
    </DialogContainer>
  );
});

export default FeedbackDialog;
