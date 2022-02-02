import React, { createContext, useState, useEffect } from "react";
import { connect, getEventListener, MarqueeEvents } from "@vscode-marquee/utils";

import { fetchData } from './utils';
import { DEFAULT_CONFIGURATION } from './constants';
import type { Context, Trend, Configuration, Since, SpokenLanguage, SinceConfiguration } from './types';

const TrendContext = createContext<Context>({} as any);

interface Props {
  children?: React.ReactNode;
}

const TrendProvider = ({ children }: Props) => {
  const widgetState = getEventListener<Configuration>('@vscode-marquee/github-widget');
  const providerValues = connect<Configuration>(DEFAULT_CONFIGURATION, widgetState);

  const [error, setError] = useState<Error>();
  const [isFetching, setIsFetching] = useState(false);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  const _updateFilter = (trendFilter: string) => {
    providerValues.setTrendFilter(trendFilter);
  };

  const _updateSince = (since?: Since) => {
    providerValues.setSince(since?.name as SinceConfiguration || '');
  };

  const _updateLanguage = (language?: SpokenLanguage) => {
    providerValues.setLanguage(language?.name || '');
  };

  const _updateSpoken = (spoken?: SpokenLanguage) => {
    providerValues.setSpoken(spoken?.name || '');
  };

  useEffect(() => {
    const eventListener = getEventListener<MarqueeEvents>();
    eventListener.on('openGitHubDialog', setShowDialog);
  }, []);

  useEffect(() => {
    /**
     * don't fetch if
     */
    if (
      /**
       * we haven't received all configuration params
       */
      typeof providerValues.since !== 'string' ||
      typeof providerValues.language !== 'string' ||
      typeof providerValues.spoken !== 'string' ||
      /**
       * we are already fetching something
       */
      isFetching
    ) {
      return;
    }

    setIsFetching(true);
    fetchData(providerValues.since, providerValues.language, providerValues.spoken).then(
      (res) => {
        setTrends(res as Trend[]);
        setError(undefined);
      },
      (e: Error) => setError(e)
    ).finally(() => setIsFetching(false));
  }, [providerValues.language, providerValues.since, providerValues.spoken]);

  return (
    <TrendContext.Provider
      value={{
        ...providerValues,
        trends,
        error,
        isFetching,
        showDialog,
        setError,
        setTrends,
        setIsFetching,
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
