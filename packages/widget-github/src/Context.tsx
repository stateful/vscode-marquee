import React, { createContext, useState, useEffect } from 'react'
import { connect, getEventListener, MarqueeWindow } from '@vscode-marquee/utils'

import { GithubTrendingDialog } from './components/TrendingDialog'
import { fetchData, getFromCache } from './utils'
import type { Context, Trend, Configuration, Since, SpokenLanguage, SinceConfiguration, Events } from './types'

declare const window: MarqueeWindow

const TrendContext = createContext<Context>({} as any)
const WIDGET_ID = '@vscode-marquee/github-widget'
interface Props {
  children?: React.ReactNode;
}

const TrendProvider = ({ children }: Props) => {
  const eventListener = getEventListener<Events>()
  const widgetState = getEventListener<Configuration>(WIDGET_ID)
  const providerValues = connect<Configuration>(window.marqueeStateConfiguration[WIDGET_ID].configuration, widgetState)

  const [unmounted, setUnmounted] = useState(false)
  const [error, setError] = useState<Error>()
  const [isFetching, setIsFetching] = useState(false)
  const [trends, setTrends] = useState<Trend[]>([])
  const [showDialog, setShowDialog] = useState(false)

  const _updateFilter = (trendFilter: string) => {
    providerValues.setTrendFilter(trendFilter || '')
  }

  const _updateSince = (since?: Since) => {
    if (!since?.name) {
      return
    }
    providerValues.setSince(since.name as SinceConfiguration || '')
  }

  const _updateLanguage = (language?: SpokenLanguage) => {
    providerValues.setLanguage(language?.name || '')
  }

  const _updateSpoken = (spoken?: SpokenLanguage) => {
    providerValues.setSpoken(spoken?.name || '')
  }

  useEffect(() => {
    eventListener.on('openGitHubDialog', setShowDialog)
    return () => {
      setUnmounted(true)
      widgetState.removeAllListeners()
      eventListener.removeAllListeners()
    }
  }, [])

  useEffect(() => {
    /**
     * don't fetch if we are already fetching something
     */
    if (isFetching || unmounted) {
      return
    }

    const cache = getFromCache(providerValues.since, providerValues.language, providerValues.spoken)
    if (cache) {
      return setTrends(cache)
    }

    setIsFetching(true)
    fetchData(providerValues.since, providerValues.language, providerValues.spoken).then(
      (res) => {
        if (unmounted) {
          return
        }
        setTrends(res as Trend[])
        setError(undefined)
      },
      (e: Error) => !unmounted && setError(e)
    ).finally(() => !unmounted && setIsFetching(false))
  }, [providerValues.language, providerValues.since, providerValues.spoken])

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
      { showDialog && ( <GithubTrendingDialog close={() => setShowDialog(false)} /> )}
    </TrendContext.Provider>
  )
}

export default TrendContext
export { TrendProvider }
