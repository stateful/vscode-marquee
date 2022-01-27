/* istanbul ignore file */

import type { Client } from 'tangle';
import Channel from "tangle/webviews";
import { createTheme } from "@material-ui/core/styles";

import store from './store';
import calculateTheme from "./calculateTheme";
import { createConsumer } from './stateConsumer';

import BetterComplete from "./components/BetterComplete";
import NetworkError from './components/NetworkError';
import DoubleClickHelper from './components/DoubleClickHelper';

import GlobalContext, { GlobalProvider } from "./contexts/Global";
import { PrefProvider, PrefContext, defaultName } from './contexts/Pref';

import type { MarqueeWindow } from './types';

const defaultChannel = 'vscode.marquee';
const theme = createTheme(calculateTheme());

declare const window: MarqueeWindow;

const tangleChannels = new Map<string, any>();
const getEventListener = <T>(channel = defaultChannel) => {
  if (!tangleChannels.has(channel)) {
    const ch = new Channel<T>(channel);
    const eventListener = ch.attach(window.vscode as any);
    tangleChannels.set(channel, eventListener);
    return eventListener;
  }
  return tangleChannels.get(channel)! as Client<T>;
};

const jumpTo = (item: any) => {
  window.vscode.postMessage({
    west: {
      execCommands: [
        {
          command: "marquee.link",
          args: [{ item }],
        },
      ],
    },
  });
};

export {
  store,
  jumpTo,
  getEventListener,
  PrefProvider, PrefContext,
  defaultName,
  createConsumer,
  theme,

  // components
  BetterComplete,
  NetworkError,
  DoubleClickHelper,

  // contexts
  GlobalContext,
  GlobalProvider
};
export default theme;
export * from './types';
