import React, { createContext, useState, useEffect } from "react";
import { createConsumer } from "../stateConsumer";

import store from "../store";
import type { IGlobalContext, Workspace } from '../types';

const GlobalContext = createContext<IGlobalContext>({} as IGlobalContext);

const GlobalProvider = ({ children }: { children: React.ReactElement }) => {
  const GlobalStore = store("globalScope", false);
  const [globalScope, setGlobalScope] = useState(true);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);


  let _removeWorkspace = (id: string) => {
    const wsps = [...workspaces];
    let index = wsps.findIndex((wsp) => wsp.id === id);
    wsps.splice(index, 1);

    GlobalStore.set("workspaces", wsps);
    setWorkspaces(wsps);
  };

  let _updateGlobalScope = (show: boolean) => {
    setGlobalScope(show);
    GlobalStore.set("globalScope", show);
  };

  const handler = () => {
    setWorkspaces(GlobalStore.get("workspaces") || workspaces);
    setGlobalScope(GlobalStore.get("globalScope"));
  };

  useEffect(() => {
    GlobalStore.subscribe(handler as any);

    createConsumer("activeWorkspace").subscribe((aws: Workspace) => {
      setActiveWorkspace(aws);
    });
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        globalScope,
        workspaces,
        activeWorkspace,
        _removeWorkspace,
        _updateGlobalScope,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
export { GlobalProvider };
