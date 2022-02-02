import React, { useContext, useState } from "react";
import {
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Typography,
  Grid,
} from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";
import SettingsIcon from "@material-ui/icons/Settings";
import { DebounceInput } from "react-debounce-input";

import { DialogTitle, DialogContainer } from "@vscode-marquee/dialog";
import { BetterComplete } from '@vscode-marquee/utils';

import WeatherContext from "../Context";
import { SCALE_OPTIONS } from '../constants';

const LocationOption = React.memo(() => {
  const { city, _updateCity } = useContext(WeatherContext);
  const [cityValue, setCityValue] = useState("");
  let cityInputRef: HTMLInputElement | null = null;

  return (
    <Grid container direction="column">
      <Grid item>
        <Grid
          container
          direction="row"
          alignItems="center"
          spacing={2}
          justifyContent="space-between"
        >
          <Grid item>
            <Typography>{city}</Typography>
          </Grid>
          <Grid item>
            <Button
              onClick={() => {
                setCityValue('');
                _updateCity('');
              }}
            >
              Restore to auto-detected
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Grid container direction="row" alignItems="center" spacing={2}>
          <Grid item xs>
            <DebounceInput
              label={"Update your location"}
              variant="filled"
              fullWidth
              inputProps={{ ref: (input: HTMLInputElement) => (cityInputRef = input) }}
              minLength={5}
              element={TextField}
              placeholder="City, State, Country"
              debounceTimeout={200}
              onKeyDown={(e) => {
                if (e.which === 13 || e.keyCode === 13) {
                  if (cityInputRef) {
                    _updateCity(cityInputRef.value);
                    cityInputRef.blur();
                  }

                  setCityValue('');
                  e.stopPropagation();
                  e.preventDefault();
                }
              }}
              InputProps={{
                endAdornment: (
                  <ClearIcon
                    fontSize="small"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setCityValue('');
                      _updateCity('');
                      if (cityInputRef) {
                        cityInputRef.value = "";
                        cityInputRef.focus();
                      }
                    }}
                  />
                ),
              }}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(e) => {
                /**
                 * sometimes this event is emitted with a React Node rather
                 * than an HTML element which causes the input to be cleared
                 */
                if (!e.target.tagName) {
                  return;
                }

                setCityValue(e.target.value);
                _updateCity(e.target.value);
              }}
              name="city"
              value={cityValue}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
});

const ScaleOption = React.memo(() => {
  const { scale, _updateScale } = useContext(WeatherContext);
  const value = scale && SCALE_OPTIONS.find((s) => s.name === scale) || SCALE_OPTIONS[0];

  return (
    <Grid
      container
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
      spacing={2}
    >
      <Grid item xs>
        <BetterComplete
          field="scale"
          label="Temperature scale"
          options={SCALE_OPTIONS}
          display="name"
          value={value}
          variant="filled"
          getOptionSelected={(option, value) => {
            return option.value === value.value;
          }}
          onChange={(e, v) => v
            ? _updateScale(v)
            : _updateScale(SCALE_OPTIONS[0])}
        />
      </Grid>
    </Grid>
  );
});

const WeatherDialog = React.memo(({ close }: { close: () => void }) => {
  return (
    <DialogContainer fullWidth={true} onClose={close}>
      <DialogTitle onClose={close}>Weather</DialogTitle>
      <DialogContent dividers={true}>
        <Grid container direction="column" spacing={2}>
          <Grid item xs>
            <ScaleOption />
          </Grid>
          <Grid item xs>
            <LocationOption />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </DialogContainer>
  );
});

const WeatherDialogLauncher = () => {
  const { showDialog, setShowDialog } = useContext(WeatherContext);

  return (
    <>
      <IconButton size="small" onClick={() => setShowDialog(true)}>
        <SettingsIcon fontSize="small" />
      </IconButton>
      { showDialog && ( <WeatherDialog close={() => setShowDialog(false)} /> )}
    </>
  );
};

export { WeatherDialogLauncher, WeatherDialog };
