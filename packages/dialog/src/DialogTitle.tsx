import React, { MouseEventHandler } from "react";

import MuiDialogTitle from "@material-ui/core/DialogTitle";
import CloseIcon from "@material-ui/icons/Close";
import { withStyles, Theme } from "@material-ui/core/styles";
import { Styles, ClassNameMap } from "@material-ui/core/styles/withStyles";

import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";

import { theme } from "@vscode-marquee/utils";

const styles = (theme: Theme): Styles<Theme, {}> => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

interface Props extends React.PropsWithChildren<{ classes: ClassNameMap<string> }> {
  onClose?: MouseEventHandler<HTMLButtonElement>
}

const DialogTitle = withStyles(styles(theme))((props: Props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

export default DialogTitle;
