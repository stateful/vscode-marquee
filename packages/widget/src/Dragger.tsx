import React from "react";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import { IconButton } from "@material-ui/core";

let Dragger = () => {
  return (
    <IconButton size="small" className="drag-handle">
      <DragIndicatorIcon fontSize="small" />
    </IconButton>
  );
};

export default React.memo(Dragger);
