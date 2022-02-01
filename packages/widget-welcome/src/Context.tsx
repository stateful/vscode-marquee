import React, { createContext } from "react";
import { connect, getEventListener } from "@vscode-marquee/utils";

import { DEFAULT_STATE } from "./constants";
import type { Context, State, Events } from './types';

interface Props {
  children?: React.ReactNode;
}

const TrickContext = createContext<Context>(DEFAULT_STATE as any as Context);

const TrickProvider = ({ children }: Props) => {
  const widgetState = getEventListener<State & Events>('@vscode-marquee/welcome-widget');
  const providerValues = connect<State & Omit<Events, "upvote">, Events>(DEFAULT_STATE, widgetState);

  const _setRead = (id: string) => {
    if (!providerValues.read.includes(id)) {
      providerValues.setRead([...providerValues.read, id]);
    }
  };

  const _setLiked = (id: string) => {
    if (!providerValues.liked.includes(id)) {
      providerValues.setLiked([...providerValues.liked, id]);
      widgetState.emit('upvote', id);
    }
  };

  const _resetRead = () => {
    providerValues.setRead([]);
  };

  return (
    <TrickContext.Provider
      value={{
        ...providerValues,
        _setLiked,
        _setRead,
        _resetRead,
      }}
    >
      {children}
    </TrickContext.Provider>
  );
};

export default TrickContext;
export { TrickProvider };
