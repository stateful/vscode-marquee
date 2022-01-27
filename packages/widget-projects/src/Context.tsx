import React, { createContext, useState, useEffect } from "react";
import { store } from '@vscode-marquee/utils';
import { Context, ContextValues } from './types';

const DEFAULTS: ContextValues = {
  workspaceFilter: "",
  workspaceSortOrder: "usage",
  openProjectInNewWindow: false
};
const WorkspaceContext = createContext<Context>({} as Context);

const WorkspaceProvider = ({ children }: { children: React.ReactElement }) => {
  const WorkspaceStore = store("workspaces", false);
  const [workspaceFilter, setWorkspaceFilter] = useState(DEFAULTS.workspaceFilter);
  const [workspaceSortOrder, setWorkspaceSortOrder] = useState(DEFAULTS.workspaceSortOrder);
  const [openProjectInNewWindow, setOpenProjectInNewWindow] = useState(DEFAULTS.openProjectInNewWindow);

  useEffect(() => {
    WorkspaceStore.set("workspaceFilter", workspaceFilter);
  }, [workspaceFilter]);

  useEffect(() => {
    WorkspaceStore.set("workspaceSortOrder", workspaceSortOrder);
  }, [workspaceSortOrder]);

  useEffect(() => {
    WorkspaceStore.set("openProjectInNewWindow", openProjectInNewWindow);
  }, [openProjectInNewWindow]);

  const handler = () => {
    setWorkspaceFilter(WorkspaceStore.get("workspaceFilter") || workspaceFilter);
    setOpenProjectInNewWindow(WorkspaceStore.get("openProjectInNewWindow" || openProjectInNewWindow));
    setWorkspaceSortOrder(WorkspaceStore.get("workspaceSortOrder") || workspaceSortOrder);
  };

  useEffect(() => {
    WorkspaceStore.subscribe(handler as any);
    handler();
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
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
