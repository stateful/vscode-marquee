import React, { useContext } from "react";

import ClearIcon from "@material-ui/icons/Clear";
import { TextField } from "@material-ui/core";
import { DebounceInput } from "react-debounce-input";

import { PrefContext } from "@vscode-marquee/utils";

let WidgetFilter = () => {
  const { themeColor, widgetFilter, updateWidgetFilter } = useContext(PrefContext);

  return (
    <DebounceInput
      element={TextField}
      minLength={2}
      debounceTimeout={500}
      placeholder="Search for widgets..."
      onChange={(e) => {
        updateWidgetFilter(e.target.value);
      }}
      margin="none"
      size="small"
      name="github-filter"
      value={widgetFilter}
      fullWidth={true}
      InputProps={{
        fullWidth: true,
        style: {
          background: `rgba(${themeColor.r}, ${themeColor.g}, ${themeColor.b}, ${themeColor.a})`,
          padding: "2px",
          paddingLeft: "4px",
          paddingRight: "4px",
          borderRadius: "4px",
        },
        endAdornment: (
          <ClearIcon
            fontSize="small"
            style={{ cursor: "pointer" }}
            onClick={() => updateWidgetFilter("")}
          />
        ),
      }}
    />
  );
};

export default React.memo(WidgetFilter);
