import React, { MouseEventHandler } from "react";
import { Dialog } from "@material-ui/core";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";

interface Props extends Partial<React.PropsWithChildren<{ classes: ClassNameMap<string> }>> {
  fullScreen?: boolean
  fullWidth?: boolean
  onClose?: MouseEventHandler<HTMLButtonElement>
}

const DialogContainer = ({ children, fullScreen, ...props }: Props) => {
  const materialTheme = useTheme();
  const isFullScreen = useMediaQuery(materialTheme.breakpoints.down("xs"));
  return (
    <Dialog
      open={true}
      fullScreen={fullScreen ? true : isFullScreen}
      {...props}
    >
      {children}
    </Dialog>
  );
};

export default React.memo(DialogContainer);
