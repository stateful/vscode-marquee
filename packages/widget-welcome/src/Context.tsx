import React, { createContext, useEffect, useState } from "react";
import { store, getEventListener } from "@vscode-marquee/utils";

import type { Context, Trick, State } from './types';

interface Props {
  children?: React.ReactNode;
}

const TrickContext = createContext<Context>({} as Context);

const TrickProvider = ({ children }: Props) => {
  const widgetState = getEventListener<State>('@vscode-marquee/welcome-widget');
  const TrickStore = store("tricks");
  const [error, setError] = useState<Error>();
  const [tricks, setTricks] = useState<Trick[]>([]);
  const [read, setRead] = useState<string[]>([]);
  const [liked, setLiked] = useState<string[]>([]);

  const _setRead = (id: string) => {
    if (!read.includes(id)) {
      setRead([...read, id]);
      TrickStore.set("read", [...read, id]);
    }
  };

  const _setLiked = (id: string) => {
    if (!liked.includes(id)) {
      setLiked([...liked, id]);
      TrickStore.set("liked", [...liked, id]);
      widgetState.emit('upvote', id);
    }
  };

  const _resetRead = () => {
    setRead([]);
    TrickStore.set("read", []);
  };

  useEffect(() => {
    widgetState.listen('tricks', (tricks) => {
      setTricks(tricks);
      setError(undefined);
    });
    widgetState.listen('read', setRead);
    widgetState.listen('liked', setLiked);
    widgetState.listen('error', setError);
  }, []);

  return (
    <TrickContext.Provider
      value={{
        tricks,
        liked,
        read,
        error,
        setTricks,
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
