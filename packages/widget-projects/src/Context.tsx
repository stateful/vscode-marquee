import React, { createContext } from "react";
import { getEventListener, connect } from '@vscode-marquee/utils';

import { DEFAULT_CONFIGURATION, DEFAULT_STATE } from './constants';
import type { Configuration, State, Context } from './types';

const DEFAULTS = { ...DEFAULT_CONFIGURATION, ...DEFAULT_STATE };
const WorkspaceContext = createContext<Context>(DEFAULTS as Context);

const WorkspaceProvider = ({ children }: { children: React.ReactElement }) => {
  const widgetState = getEventListener<Configuration & State>('@vscode-marquee/projects-widget');
  const providerValues = connect<State & Configuration>(DEFAULTS, widgetState);

  return (
    <WorkspaceContext.Provider value={providerValues}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceContext;
export { WorkspaceProvider };
