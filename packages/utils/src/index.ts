/* istanbul ignore file */

import { useState } from 'react';
import Channel from "tangle/webviews";
import { createTheme } from "@material-ui/core/styles";

import type { Client } from 'tangle';

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

export type ContextProperties<T> = {
  [t in keyof T]: T[t]
} & {
  [t in keyof T & string as `set${Capitalize<t>}`]: (val: T[t]) => void
};

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

/**
 * Helper method to connect a widget context with its configuration and
 * application state
 * @param defaults combind default values for configuration and state
 * @param tangle   tangle client to broadcast information
 * @returns object containing state values and its setter methods
 */
function connect<T> (defaults: T, tangle: Client<T>): ContextProperties<T> {
  const contextValues: Partial<ContextProperties<T>> = {};
  for (const [prop, defaultVal] of Object.entries(defaults) as Entries<ContextProperties<T>>) {
    const [propState, setPropState] = useState<typeof defaultVal>(defaultVal);
    contextValues[prop as keyof T] = propState as ContextProperties<T>[keyof T];

    const setProp = `set${(prop as string).slice(0, 1).toUpperCase()}${(prop as string).slice(1)}` as `set${Capitalize<keyof T & string>}`;
    contextValues[setProp] = ((val: any) => {
      setPropState(val);
      tangle.broadcast({ [prop]: val } as T);
    }) as any;
    tangle.listen(prop as keyof T, setPropState as any);
  }

  return contextValues as ContextProperties<T>;
}

export {
  store,
  jumpTo,
  getEventListener,
  PrefProvider, PrefContext,
  defaultName,
  createConsumer,
  theme,
  connect,

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
