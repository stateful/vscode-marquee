import React, { createContext, useState, useEffect } from 'react'
import { getEventListener, connect, MarqueeWindow } from '@vscode-marquee/utils'

import { fetchGeoData, fetchWeather, forecastCache, geoDataCache } from './utils'
import type { Context, Configuration, Forecast, Scale, Location, Events } from './types'

declare const window: MarqueeWindow

const WeatherContext = createContext<Context>({} as Context)
const WIDGET_ID = '@vscode-marquee/weather-widget'

const WeatherProvider = function ({ children }: { children: React.ReactElement }) {
  const eventListener = getEventListener<Events>()
  const widgetState = getEventListener<Configuration>(WIDGET_ID)
  const providerValues = connect<Configuration>({
    ...window.marqueeStateConfiguration[WIDGET_ID].state,
    ...window.marqueeStateConfiguration[WIDGET_ID].configuration
  }, widgetState)

  const [unmounted, setUnmounted] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<Error>()
  const [coords, setCoords] = useState<Location>()
  const [forecast, setForecast] = useState<Forecast>()
  const [showDialog, setShowDialog] = useState(false)

  const _updateScale = (scale: Scale) => {
    providerValues.setScale(scale.name)
  }

  const _updateCity = (city?: string) => {
    providerValues.setCity(city)
  }

  useEffect(() => {
    if (unmounted) {
      return
    }

    const cachedData = geoDataCache(providerValues.city)
    if (cachedData) {
      return setCoords(cachedData)
    }

    setIsFetching(true)
    fetchGeoData(providerValues.city).then(
      (location) => {
        if (unmounted) {
          return
        }

        setError(undefined)
        setCoords(location)
      },
      (e: Error) => !unmounted && setError(e)
    ).finally(() => !unmounted && setIsFetching(false))
  }, [providerValues.city])

  useEffect(() => {
    if (!coords || unmounted) {
      return
    }

    const weatherCache = forecastCache(coords?.lat, coords?.lng)
    if (weatherCache) {
      return setForecast(weatherCache)
    }

    setIsFetching(true)
    fetchWeather(coords?.lat, coords?.lng).then(
      (res) => !unmounted && setForecast(res),
      (e: Error) => !unmounted && setError(e)
    ).finally(() => !unmounted && setIsFetching(false))
  }, [coords?.lat, coords?.lng])

  useEffect(() => {
    eventListener.on('openWeatherDialog', setShowDialog)
    return () => {
      setUnmounted(true)
      widgetState.removeAllListeners()
      eventListener.removeAllListeners()
    }
  }, [])

  return (
    <WeatherContext.Provider
      value={{
        city: coords?.city,
        scale: providerValues.scale,
        error,
        forecast,
        isFetching,
        showDialog,
        setShowDialog,
        _updateScale,
        _updateCity,
      }}
    >
      {children}
    </WeatherContext.Provider>
  )
}

export default WeatherContext
export { WeatherProvider }
