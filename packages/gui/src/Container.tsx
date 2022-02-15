import React, { useContext, useEffect, useMemo, useState } from "react";
import { connect, ConnectedProps } from "react-redux";

import { Grid, CircularProgress } from "@material-ui/core";
import { WidthProvider, Responsive } from "react-grid-layout";
import "./css/react-grid-layout.css";
import "react-resizable/css/styles.css";

import { getEventListener, MarqueeEvents, GlobalContext, MarqueeWindow } from "@vscode-marquee/utils";

import Navigation from "./components/Navigation";
import SettingsDialog from './dialogs/SettingsDialog';
import backgrounds from './utils/backgrounds';
import { themes, NO_BACKGROUND_STYLE, BACKGROUND_STYLE } from "./constants";
import { setCurrentModeLayout, removeModeWidget } from './redux/actions';
import type { ReduxState } from './redux/types';

declare const window: MarqueeWindow;
const ResponsiveReactGridLayout = WidthProvider(Responsive);
const sizes = ["lg", "md", "sm", "xs", "xxs"] as const;

const mapStateToProps = (state: ReduxState) => state;
const mapDispatchToProps = { setCurrentModeLayout };
const connector = connect(mapStateToProps, mapDispatchToProps);

export const WidgetLayout = connector(React.memo((props: ConnectedProps<typeof connector>) => {
  const { resetApp } = useContext(GlobalContext);
  const { modeName, modes, widgets, setCurrentModeLayout, mode, thirdPartyWidgets } = props;

  //if a new widget is introduced that doesn't exist in their current
  //stored layout, we patch the layout so that it displays properly
  //to encourage them to integrate or hide it
  //this finds the missing entries and patches them
  const getLayoutConfig = () => {
    if (!modeName || !modes[modeName]) {
      return null;
    }

    if (
      Object.entries(mode).length !== 0 &&
      Object.entries(modes).length !== 0 &&
      Object.entries(mode.layouts).length !== 0
    ) {
      const newLayouts = mode.layouts;
      let modified = false;

      sizes.forEach((size) => {
        const sizeArr = newLayouts[size];
        Object.keys(widgets).forEach((widget) => {
          const found = sizeArr.findIndex((entry) => entry.i === widget);
          if (found === -1) {
            const widgetObject = {
              minW: 2,
              minH: 6,
              static: false,
              moved: false,
              x: 0,
              y: 0,
              h: 12,
              w: 4,
              i: widget,
            };

            newLayouts[size].push(widgetObject);
            modified = true;
          }
        });
      });

      if (modified) {
        return newLayouts;
      } else {
        return mode.layouts;
      }
    }

    return modes[modeName].layouts;
  };

  let generateWidgets = () => {
    return Object.keys(widgets)
      .filter((widget) => modes[modeName] && modes[modeName].widgets[widget])
      .map((widget) => {
        const Widget = widgets[widget].element;
        return React.cloneElement(<Widget />, {
          name: widget,
          label: widgets[widget].label,
          key: widget
        });
      }
    );
  };

  const layout = getLayoutConfig();
  if (!layout || resetApp || thirdPartyWidgets.length !== window.marqueeThirdPartyWidgets) {
    return (
      <Grid
        container
        style={{ height: "100%" }}
        alignItems="center"
        justifyContent="center"
        direction="column"
      >
        <Grid item>
          <CircularProgress color="secondary" />
        </Grid>
      </Grid>
    );
  }

  return (
    <ResponsiveReactGridLayout
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 4 }}
      rowHeight={20}
      onLayoutChange={(_, newLayouts) => {
        setCurrentModeLayout(newLayouts);
      }}
      layouts={layout}
      draggableHandle=".drag-handle"
      draggableCancel=".draggableCancel"
      containerPadding={[10, 10]}
      margin={[10, 10]}
      // only when running unit tests
      measureBeforeMount={!Boolean(globalThis['process'])}
    >
      {generateWidgets()}
    </ResponsiveReactGridLayout>
  );
}));

const containerConnector = connect(null, { removeModeWidget });
export default containerConnector(React.memo((props: ConnectedProps<typeof containerConnector>) => {
  const { background, themeColor } = useContext(GlobalContext);
  const [showSettings, setShowSettings] = useState(false);

  const backgroundStyle = useMemo(() => {
    /**
     * if `background` is not a number we can't fetch provided background
     * ToDo(Christian): implement importing Unsplash images
     */
    if (isNaN(+background)) {
      return NO_BACKGROUND_STYLE;
    }

    const theme = themes.find((theme) => {
      return theme.id === parseInt(background, 10);
    });

    if (!theme || (!theme.background && !theme.backgroundColor)) {
      return NO_BACKGROUND_STYLE;
    }

    return {
      ...BACKGROUND_STYLE,
      ...(theme.background
        ? { backgroundImage: `url(${backgrounds(theme.background)})` }
        : { backgroundColor: theme.backgroundColor })
    };
  }, [background]);

  useEffect(() => {
    const eventListener = getEventListener<MarqueeEvents>();
    eventListener.on('openSettings', () => setShowSettings(true));
    eventListener.on('removeWidget', (name: string) => props.removeModeWidget(name));
  }, []);

  return (
    <div className={`appContainer`} style={backgroundStyle}>
      {showSettings && <SettingsDialog close={() => setShowSettings(false)} />}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          zIndex: 1000,
        }}
      >
        <Navigation />
      </div>
      <Grid
        container
        style={{
          height: "100vh",
          width: "100vw",
          overflow: "auto",
          background: `rgba(${themeColor.r}, ${themeColor.g}, ${themeColor.b}, ${themeColor.a})`,
        }}
        direction="column"
        wrap="nowrap"
      >
        <Grid item style={{ maxWidth: "100%", width: "100%" }}>
          <div style={{ visibility: "hidden" }}>
            <Navigation />
          </div>
        </Grid>

        <Grid item xs>
          <WidgetLayout />
        </Grid>
      </Grid>
    </div>
  );
}));
