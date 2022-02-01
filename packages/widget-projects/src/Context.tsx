import React, { createContext, useState } from "react";
import { getEventListener } from '@vscode-marquee/utils';
import type { Client } from 'tangle';

import { DEFAULT_CONFIGURATION, DEFAULT_STATE } from './constants';
import type { Configuration, State, Context } from './types';

const WorkspaceContext = createContext<Context>({} as Context);

type ContextProperties<T> = {
  [t in keyof T]: T[t]
} & {
  [t in keyof T & string as `set${Capitalize<t>}`]: (val: T[t]) => void
};

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

function connect<T> (defaults: T, state: Client<T>): ContextProperties<T> {
  const contextValues: Partial<ContextProperties<T>> = {};
  for (const [prop, defaultVal] of Object.entries(defaults) as Entries<ContextProperties<T>>) {
    const [propState, setPropState] = useState<typeof defaultVal>(defaultVal);
    contextValues[prop as keyof T] = propState as ContextProperties<T>[keyof T];

    const setProp = `set${(prop as string).slice(0, 1).toUpperCase()}${(prop as string).slice(1)}` as `set${Capitalize<keyof T & string>}`;
    contextValues[setProp] = ((val: any) => {
      setPropState(val);
      state.broadcast({ [prop]: val } as T);
    }) as any;
    state.listen(prop as keyof T, setPropState as any);
  }

  return contextValues as ContextProperties<T>;
}

const WorkspaceProvider = ({ children }: { children: React.ReactElement }) => {
  const widgetState = getEventListener<Configuration & State>('@vscode-marquee/projects-widget');
  const providerValues = connect<State & Configuration>(
    { ...DEFAULT_CONFIGURATION, ...DEFAULT_STATE },
    widgetState
  );

  return (
    <WorkspaceContext.Provider value={providerValues}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceContext;
export { WorkspaceProvider };
