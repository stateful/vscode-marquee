import React, { createContext } from "react";
import { getEventListener, connect } from '@vscode-marquee/utils';

import { DEFAULT_CONFIGURATION, DEFAULT_STATE } from './constants';
import type { Configuration, State, Context } from './types';

const DEFAULTS = { ...DEFAULT_CONFIGURATION, ...DEFAULT_STATE };
const WorkspaceContext = createContext<Context>(DEFAULTS as Context);

const WorkspaceProvider = ({ children }: { children: React.ReactElement }) => {
  const widgetState = getEventListener<Configuration & State>('@vscode-marquee/projects-widget');
  const providerValues = connect<State & Configuration>(DEFAULTS, widgetState);

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
