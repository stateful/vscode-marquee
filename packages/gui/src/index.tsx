import React, { useEffect } from "react";
import ReactDOM from "react-dom";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/styles";

import { theme, GlobalProvider } from "@vscode-marquee/utils";
import type { MarqueeWindow } from '@vscode-marquee/utils';

import Sentry from "./sentry";
import Container from "./Container";

import { ModeProvider } from "./contexts/ModeContext";

import "./css/index.css";
import { StyledEngineProvider, Theme } from "@mui/material/styles";


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


declare const window: MarqueeWindow;

window.vscode = window.acquireVsCodeApi() as MarqueeWindow['vscode'];
Sentry.init();

export const Providers = ({ children }: any) => {
  return (
    <ModeProvider>
      <GlobalProvider>
        {children}
      </GlobalProvider>
    </ModeProvider>
  );
};

export const App = () => {
  /**
   * tell extension backend that application is readyy
   */
  useEffect(() => { window.vscode.postMessage({ ready: true }); }, []);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Providers>
          <Container />
        </Providers>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

if (process.env.NODE_ENV !== 'test') {
  ReactDOM.render(<App />, document.getElementById("root"));
}
