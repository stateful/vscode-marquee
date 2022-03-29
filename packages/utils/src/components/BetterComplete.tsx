import React, { ChangeEvent } from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

export interface Props {
  id: string
  field: string,
  options: any,
  display: string
  label: string
  variant: "filled" | "standard" | "outlined" | undefined
  value: any
  getOptionSelected: (option: any, value: any) => boolean
  onChange: (e: ChangeEvent<{}>, v: any) => void
}

const useStyles = makeStyles(() => ({
  option: {
    backgroundColor: "var(--vscode-editor-background)",

    '&[data-focus="true"]': {
      backgroundColor: "var(--vscode-editor-selectionBackground)",
      color: "var(--vscode-input-foreground)",
    },
    '&[aria-selected="true"]': {
      backgroundColor: "var(--vscode-editor-selectionBackground)",
      color: "var(--vscode-editor-foreground)",
    },
  },
  input: {
    // color: "black",
    color: "var(--vscode-editor-foreground)",
  },
  label: {
    color: "var(--vscode-editor-foreground)",
  },
}));

const BetterComplete = ({
  id,
  field,
  options,
  display,
  label,
  variant,
  ...rest
}: Props) => {
  const classes = useStyles();

  return (
    <Autocomplete
      id={id}
      classes={{
        option: classes.option,
        input: classes.input,
      }}
      options={options}
      getOptionLabel={(option) => option[display] || ""}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label || field}
          fullWidth
          variant={variant || "outlined"}
          InputLabelProps={{
            className: classes.label,
          }}
        />
      )}
      {...rest}
    />
  );
};

export default React.memo(BetterComplete);
