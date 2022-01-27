import React, { useContext } from "react";
import {
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Grid,
  Badge
} from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";

import { DialogTitle, DialogContainer } from '@vscode-marquee/dialog';
import { BetterComplete } from '@vscode-marquee/utils';

import TrendContext from "../Context";
import { trendLanguages, spokenLanguages } from "../constants";
import type { Since, SpokenLanguage } from '../types';

const SpokenLanguageOption = () => {
  const { spoken, _updateSpoken } = useContext(TrendContext);

  return (
    <Grid
      container
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
      spacing={2}
    >
      <Grid item xs={3}>
        Spoken language
      </Grid>
      <Grid item xs>
        <BetterComplete
          variant="filled"
          field="spoken-language"
          label="Selection..."
          options={spokenLanguages}
          display="name"
          value={spoken}
          getOptionSelected={(option: SpokenLanguage, value: SpokenLanguage) => option.urlParam === value.urlParam}
          onChange={(e: any, v: SpokenLanguage) => _updateSpoken(v)}
        />
      </Grid>
    </Grid>
  );
};

const ProgrammingLanguageOption = () => {
  const { language, _updateLanguage } = useContext(TrendContext);

  return (
    <Grid
      container
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
      spacing={2}
    >
      <Grid item xs={3}>
        Programming language
      </Grid>
      <Grid item xs>
        <BetterComplete
          variant="filled"
          field="programming-language"
          label="Selection..."
          options={trendLanguages}
          display="name"
          value={language}
          getOptionSelected={(option: SpokenLanguage, value: SpokenLanguage) => option.urlParam === value.urlParam}
          onChange={(e: any, v: SpokenLanguage) => _updateLanguage(v)}
        />
      </Grid>
    </Grid>
  );
};

const SinceOption = () => {
  const { since, _updateSince } = useContext(TrendContext);

  const options = [
    { name: "Daily", value: "daily" },
    { name: "Weekly", value: "weekly" },
    { name: "Monthly", value: "monthly" },
  ];

  return (
    <Grid
      container
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
      spacing={2}
    >
      <Grid item xs={3}>
        Time Span
      </Grid>
      <Grid item xs>
        <BetterComplete
          variant="filled"
          field="since"
          label="Since..."
          options={options}
          display="name"
          value={since}
          getOptionSelected={(option: Since, value: Since) => option.value === value.value}
          onChange={(e: any, v: Since) => _updateSince(v)}
        />
      </Grid>
    </Grid>
  );
};

const GithubTrendingDialog = React.memo(({ close }: { close: () => void }) => {
  return (
    <DialogContainer fullWidth={true} onClose={close}>
      <DialogTitle onClose={close}>Github Settings</DialogTitle>
      <DialogContent dividers={true}>
        <Grid container direction="column" spacing={2}>
          <Grid item xs>
            <ProgrammingLanguageOption />
          </Grid>
          <Grid item xs>
            <SinceOption />
          </Grid>
          <Grid item xs>
            <SpokenLanguageOption />
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

const TrendingDialogLauncher = () => {
  const { language, since, spoken, showDialog, setShowDialog } = useContext(TrendContext);

  /**
   * show badge if settings are changed from default
   */
  const badgeContent = (since || spoken || language)
    ? 1
    : 0;

  return (
    <>
      <IconButton onClick={() => setShowDialog(true)} size="small">
        <Badge
          color="secondary"
          variant="dot"
          overlap="circular"
          badgeContent={badgeContent}
        >
          <SettingsIcon fontSize="small" />
        </Badge>
      </IconButton>
      { showDialog && ( <GithubTrendingDialog close={() => setShowDialog(false)} /> )}
    </>
  );
};

export default TrendingDialogLauncher;
