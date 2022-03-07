import React from "react";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { IconButton } from "@mui/material";

let Dragger = () => {
  return (
    <IconButton size="small" className="drag-handle">
      <DragIndicatorIcon fontSize="small" />
    </IconButton>
  );
};

export default React.memo(Dragger);
