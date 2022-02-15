import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";

import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import wrapper, { ThirdPartyWidget } from '@vscode-marquee/widget';
import { theme, GlobalProvider } from "@vscode-marquee/utils";
import type { MarqueeWindow, MarqueeInterface, ThirdPartyWidgetOptions } from '@vscode-marquee/utils';

import reducer, { initialState } from './redux/reducer';
import Sentry from "./sentry";
import Container from "./Container";
import { ACTIONS } from "./redux/actions";

import "./css/index.css";

declare const window: MarqueeWindow;

window.vscode = window.acquireVsCodeApi() as MarqueeWindow['vscode'];
Sentry.init();

export const App = () => {
  const store = createStore(reducer, initialState);

  /**
   * define marquee extension interface on global scope for widgets to use
   */
  window.marqueeExtension = {
    defineWidget: (
      widgetOptions: ThirdPartyWidgetOptions,
      constructor: CustomElementConstructor,
      options?: ElementDefinitionOptions
    ) => {
      customElements.define(widgetOptions.name, constructor, options);
      store.dispatch({
        type: ACTIONS.SET_THIRD_PARTY_WIDGET,
        value: {
          name: widgetOptions.name,
          icon: <FontAwesomeIcon icon={widgetOptions.icon} />,
          label: widgetOptions.label,
          tags: widgetOptions.tags,
          description: widgetOptions.description,
          component: wrapper(ThirdPartyWidget, widgetOptions.name),
        }
      });
    }
  } as MarqueeInterface;

  /**
   * tell extension backend that application is readyy
   */
  useEffect(() => { window.vscode.postMessage({ ready: true }); }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <GlobalProvider>
          <Container />
        </GlobalProvider>
      </Provider>
    </ThemeProvider>
  );
};

if (process.env.NODE_ENV !== 'test') {
  ReactDOM.render(<App />, document.getElementById("root"));
}
