import React, { createContext } from "react";
import { getEventListener, MarqueeWindow, connect } from '@vscode-marquee/utils';

import type { Configuration, State, Context } from './types';

declare const window: MarqueeWindow;

const WorkspaceContext = createContext<Context>({} as Context);
const WIDGET_ID = '@vscode-marquee/projects-widget';

const WorkspaceProvider = ({ children }: { children: React.ReactElement }) => {
  const widgetState = getEventListener<Configuration & State>(WIDGET_ID);
  const providerValues = connect<State & Configuration>({
    ...window.marqueeStateConfiguration[WIDGET_ID].state,
    ...window.marqueeStateConfiguration[WIDGET_ID].configuration
  }, widgetState);

  const _removeWorkspace = (id: string) => {
    const wsps = [...providerValues.workspaces];
    let index = wsps.findIndex((wsp) => wsp.id === id);

    if (index < 0) {
      return console.error(`Couldn't find workspace with id "${id}"`);
    }

    wsps.splice(index, 1);
    providerValues.setWorkspaces(wsps);
  };

  return (
    <WorkspaceContext.Provider value={{
      ...providerValues,
      _removeWorkspace
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceContext;
export { WorkspaceProvider };
