import React, { useEffect } from "react";
import ReactDOM from "react-dom";

import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/styles";

import { theme, GlobalProvider } from "@vscode-marquee/utils";
import type { MarqueeWindow } from '@vscode-marquee/utils';

import Sentry from "./sentry";
import Container from "./Container";

import { ModeProvider } from "./contexts/ModeContext";

import "./css/index.css";

declare const window: MarqueeWindow;

window.vscode = window.acquireVsCodeApi() as MarqueeWindow['vscode'];
Sentry.init();

export const Providers = ({ children }: any) => {
  return (
    <GlobalProvider>
      <ModeProvider>
        {children}
      </ModeProvider>
    </GlobalProvider>
  );
};

export const App = () => {
  /**
   * tell extension backend that application is readyy
   */
  useEffect(() => { window.vscode.postMessage({ ready: true }); }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Providers>
        <Container />
      </Providers>
    </ThemeProvider>
  );
};

if (process.env.NODE_ENV !== 'test') {
  ReactDOM.render(<App />, document.getElementById("root"));
}
