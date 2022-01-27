import React, { createContext, useState, useEffect } from "react";
import { store, getEventListener, MarqueeEvents } from "@vscode-marquee/utils";

import { fetchData } from './utils';
import type { Since, SpokenLanguage, Trend } from './types';

const DEFAULT_SEARCH_PARAMS = {};
interface Context extends SearchParams {
  trends: Trend[];
  isFetching: boolean;
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  error?: Error;

  _updateSpoken: (id: SpokenLanguage) => void
  _updateLanguage: (val: SpokenLanguage) => void
  _updateSince: (val: Since) => void
  _updateFilter: (trendFilter: string) => void
}

interface SearchParams {
  since?: Since;
  language?: SpokenLanguage;
  spoken?: SpokenLanguage;
  trendFilter?: string;
}

const TrendContext = createContext<Context>({} as any);

interface Props {
  children?: React.ReactNode;
}

const TrendProvider = ({ children }: Props) => {
  const trendStore = store("trendPrefs", false);
  const [error, setError] = useState<Error>();
  const [isFetching, setIsFetching] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>(DEFAULT_SEARCH_PARAMS);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    trendStore.set("trendFilter", searchParams.trendFilter);
  }, [searchParams.trendFilter]);

  const _updateFilter = (trendFilter: string) => {
    setSearchParams({ ...searchParams, trendFilter});
    trendStore.set("trendFilter", trendFilter);
  };

  const _updateSince = (since: Since) => {
    setSearchParams({ ...searchParams, since});
    trendStore.set("since", since);
  };

  const _updateLanguage = (language: SpokenLanguage) => {
    setSearchParams({ ...searchParams, language});
    trendStore.set("language", language);
  };

  const _updateSpoken = (spoken: SpokenLanguage) => {
    setSearchParams({ ...searchParams, spoken});
    trendStore.set("spoken", spoken);
  };

  useEffect(() => {
    const eventListener = getEventListener<MarqueeEvents>();
    eventListener.on('openGitHubDialog', setShowDialog);
  }, []);

  useEffect(() => {
    setIsFetching(true);
    fetchData(searchParams.since, searchParams.language, searchParams.spoken).then(
      (res) => {
        setTrends(res as Trend[]);
        setError(undefined);
      },
      (e: Error) => setError(e)
    ).finally(() => setIsFetching(false));
  }, [searchParams.language, searchParams.since, searchParams.spoken, searchParams.trendFilter]);

  trendStore.subscribe((() => {
    const newSearchParams: SearchParams = {
      language: trendStore.get("language"),
      since: trendStore.get("since"),
      spoken: trendStore.get("spoken"),
      trendFilter: trendStore.get("trendFilter")
    };

    /**
     * only update if search params have updated
     */
    if (JSON.stringify(searchParams) === JSON.stringify(newSearchParams)) {
      return;
    }

    setSearchParams(newSearchParams);
  }) as any);

  return (
    <TrendContext.Provider
      value={{
        since: searchParams.since,
        trendFilter: searchParams.trendFilter,
        language: searchParams.language,
        spoken: searchParams.spoken,
        trends,
        error,
        isFetching,
        showDialog,
        setShowDialog,
        _updateSpoken,
        _updateFilter,
        _updateSince,
        _updateLanguage
      }}
    >
      {children}
    </TrendContext.Provider>
  );
};

export default TrendContext;
export { TrendProvider };
