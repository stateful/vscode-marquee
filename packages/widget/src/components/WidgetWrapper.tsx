import React, { useContext, useState } from "react";
import { Box, Grid } from "@material-ui/core";
import { getEventListener, MarqueeEvents } from '@vscode-marquee/utils';

import { PrefContext } from "@vscode-marquee/utils";

import { ErrorBoundary } from './ErrorBoundary';

const WidgetWrapper = ({ dragHandle, ...props }: any) => {
  const { themeColor } = useContext(PrefContext);
  const [ shouldBeDisplayed, setShouldBeDisplayed ] = useState(true);

  const eventListener = getEventListener<MarqueeEvents>();
  eventListener.on('updateWidgetDisplay', (widgets) => {
    setShouldBeDisplayed(widgets[props.name]);
  });

  if (!shouldBeDisplayed) {
    return <></>;
  }

  return (
    <Box {...props} ref={props.innerref}>
      <Grid
        container
        direction="column"
        style={{
          height: "100%",
          background: `rgba(${themeColor.r}, ${themeColor.g}, ${themeColor.b}, ${themeColor.a})`,
        }}
        wrap="nowrap"
      >
        {props.children}
      </Grid>
      {dragHandle}
    </Box>
  );
};

export default (Widget: any, name?: string) => React.memo(React.forwardRef((props, ref) => {
  return (
    <ErrorBoundary>
      <WidgetWrapper innerref={ref} name={name} dragHandle={props.children} {...props}>
        <Widget {...props} />
      </WidgetWrapper>
    </ErrorBoundary>
  );
}));
