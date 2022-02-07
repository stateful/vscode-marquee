import React, { createContext } from "react";

import { getEventListener, connect } from '../';
import { getVSColor } from '../utils';
import type { Configuration, Context, State, RGBA, MarqueeWindow } from '../types';

declare const window: MarqueeWindow;

const GlobalContext = createContext<Context>({} as Context);
const rgba = ['r', 'g', 'b', 'a'] as const;
const WIDGET_ID = '@vscode-marquee/utils';

const GlobalProvider = ({ children }: { children: React.ReactElement }) => {
  const globalState = getEventListener<State & Configuration>(WIDGET_ID);
  const providerValues = connect<State & Configuration>({
    ...window.marqueeStateConfiguration[WIDGET_ID].state,
    ...window.marqueeStateConfiguration[WIDGET_ID].configuration
  }, globalState);

  /**
   * theme color propagated into template
   */
  const cssThemeValue = window.getComputedStyle(document.documentElement)
    .getPropertyValue('--marquee-theme-color')
    .trim();
  const themeColor = cssThemeValue === 'transparent' || !cssThemeValue.match(/[\.\d]+/g)
    ? getVSColor()
    : cssThemeValue
        .match(/[\.\d]+/g)!
        .map(Number)
        .reduce((acc, val, i) => {
          acc[rgba[i]] = val;
          return acc;
        }, {} as RGBA);

  return (
    <GlobalContext.Provider
      value={{
        ...providerValues,
        themeColor
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
export { GlobalProvider };
