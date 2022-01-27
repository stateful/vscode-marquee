import React from "react";
import { IconButton, Tooltip } from "@material-ui/core";

import HelpIcon from "@material-ui/icons/Help";

export interface DoubleClickHelperParams {
  content?: string
}

let DoubleClickHelper = (props: DoubleClickHelperParams) => {
  const content = props.content || "Double-click item titles to edit";
  return (
    <Tooltip title={content}>
      <IconButton size="small">
        <HelpIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default React.memo(DoubleClickHelper);
