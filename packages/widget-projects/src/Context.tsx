import React, { createContext, useState, useEffect } from "react";
import { getEventListener } from '@vscode-marquee/utils';
import type { Workspace } from '@vscode-marquee/utils';

import { DEFAULTS } from './constants';
import type { Configuration, State, Context } from './types';

const WorkspaceContext = createContext<Context>({} as Context);

const WorkspaceProvider = ({ children }: { children: React.ReactElement }) => {
  const widgetState = getEventListener<Configuration & State>('@vscode-marquee/projects-widget');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceFilter, setWorkspaceFilter] = useState(DEFAULTS.workspaceFilter);
  const [workspaceSortOrder, setWorkspaceSortOrder] = useState(DEFAULTS.workspaceSortOrder);
  const [openProjectInNewWindow, setOpenProjectInNewWindow] = useState(DEFAULTS.openProjectInNewWindow);

  useEffect(() => {
    widgetState.broadcast({
      workspaceFilter,
      workspaceSortOrder,
      openProjectInNewWindow
    } as Configuration & State);
  }, [workspaceFilter, workspaceSortOrder, openProjectInNewWindow]);

  useEffect(() => {
    widgetState.listen('workspaces', setWorkspaces);
    widgetState.listen('workspaceFilter', setWorkspaceFilter);
    widgetState.listen('workspaceSortOrder', setWorkspaceSortOrder);
    widgetState.listen('openProjectInNewWindow', setOpenProjectInNewWindow);
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        workspaceFilter,
        setWorkspaceFilter,
        workspaceSortOrder,
        setWorkspaceSortOrder,
        openProjectInNewWindow,
        setOpenProjectInNewWindow
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceContext;
export { WorkspaceProvider };
