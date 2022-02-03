import React, { createContext } from "react";

import { getEventListener, connect } from '../';
import { getVSColor } from '../utils';
import { DEFAULT_CONFIGURATION, DEFAULT_STATE } from '../constants';
import type { Configuration, Context, State, RGBA } from '../types';

const GlobalContext = createContext<Context>({} as Context);
const rgba = ['r', 'g', 'b', 'a'] as const;

const GlobalProvider = ({ children }: { children: React.ReactElement }) => {
  const globalState = getEventListener<State & Configuration>('@vscode-marquee/utils');
  const providerValues = connect<State & Configuration>(
    { ...DEFAULT_STATE, ...DEFAULT_CONFIGURATION },
    globalState
  );

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
